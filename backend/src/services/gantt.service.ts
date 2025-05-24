import { Types } from 'mongoose';
import ProjectModel from '../models/project.model';
import TaskModel from '../models/task.model';
import SprintModel from '../models/sprint.model';
import { NotFoundException } from '../utils/appError';

interface GanttTask {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  duration?: number;
  progress: number;
  parent?: string;
  type?: string;
  priority?: string;
  color?: string;
  assignee?: string;
  taskId: string;
}

interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

/**
 * Get Gantt chart data for a project
 * Includes tasks, subtasks, and dependencies
 */
export const getProjectGanttData = async (projectId: string) => {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw new NotFoundException('Project not found');
  }

  // Fetch all tasks for the project
  const tasks = await TaskModel.find({ 
    project: projectId,
    // Only include tasks with start date and due date for Gantt
    startDate: { $ne: null },
    dueDate: { $ne: null }
  })
  .populate('assignee', 'name email')
  .populate('parentTask')
  .populate('dependsOn')
  .lean();

  // Fetch any active sprints for the project
  const sprints = await SprintModel.find({
    project: projectId,
    startDate: { $ne: null },
    endDate: { $ne: null }
  }).lean();

  // Transform tasks into Gantt format
  const ganttTasks: GanttTask[] = [];
  const ganttLinks: GanttLink[] = [];

  // Add sprints as project milestones
  sprints.forEach((sprint) => {
    ganttTasks.push({
      id: `sprint_${sprint._id}`,
      text: `Sprint: ${sprint.name}`,
      start_date: sprint.startDate,
      end_date: sprint.endDate,
      type: 'project',
      progress: calculateSprintProgress(sprint),
      color: '#8B5CF6', // Purple for sprints
      taskId: sprint._id.toString()
    });
  });

  // Add tasks
  tasks.forEach((task) => {
    // Skip tasks without required dates
    if (!task.startDate || !task.dueDate) return;

    const progress = (task as any).completedAt ? 1 : (task as any).progress || 0;
    
    // Determine task type
    let taskType = 'task';
    if (task.isSubtask) taskType = 'subtask';
    
    // Determine parent task for subtasks
    let parent = undefined;
    if ((task as any).parentTask) {
      parent = (task as any).parentTask._id.toString();
    } else if (task.sprint) {
      // If task belongs to a sprint, make the sprint its parent
      parent = `sprint_${task.sprint}`;
    }

    const ganttTask: GanttTask = {
      id: task._id.toString(),
      text: task.title,
      start_date: task.startDate,
      end_date: task.dueDate,
      progress: progress,
      parent: parent,
      type: taskType,
      priority: task.priority,
      assignee: (task as any).assignee ? (task as any).assignee.name : undefined,
      color: getTaskStatusColor(task.status),
      taskId: task._id.toString()
    };

    ganttTasks.push(ganttTask);

    // Add dependency links
    if (task.dependsOn && task.dependsOn.length > 0) {
      task.dependsOn.forEach((dependency, index) => {
        ganttLinks.push({
          id: `link_${task._id}_${index}`,
          source: dependency.toString(),
          target: task._id.toString(),
          type: '0' // Finish-to-Start dependency
        });
      });
    }
  });

  return {
    data: ganttTasks,
    links: ganttLinks,
    project: {
      name: project.name,
      id: project._id
    }
  };
};

/**
 * Update a task's timeline in the Gantt chart
 */
export const updateTaskGanttDates = async (taskId: string, startDate: Date, endDate: Date) => {
  const task = await TaskModel.findById(taskId);
  if (!task) {
    throw new NotFoundException('Task not found');
  }

  task.startDate = startDate;
  task.dueDate = endDate;
  await task.save();

  return { task };
};

/**
 * Create a dependency link between tasks
 */
export const createTaskDependency = async (sourceTaskId: string, targetTaskId: string) => {
  const sourceTask = await TaskModel.findById(sourceTaskId);
  const targetTask = await TaskModel.findById(targetTaskId);

  if (!sourceTask || !targetTask) {
    throw new NotFoundException('One or both tasks not found');
  }

  // Add dependency if it doesn't already exist
  const objectIdSourceTask = new Types.ObjectId(sourceTaskId);
  const dependsOnArray = targetTask.dependsOn as Types.ObjectId[];
  
  if (!dependsOnArray.some(id => id.toString() === sourceTaskId)) {
    dependsOnArray.push(objectIdSourceTask);
    targetTask.dependsOn = dependsOnArray;
    await targetTask.save();
  }

  return {
    link: {
      id: `link_${sourceTaskId}_${targetTaskId}`,
      source: sourceTaskId,
      target: targetTaskId,
      type: '0'
    }
  };
};

/**
 * Remove a dependency link between tasks
 */
export const removeTaskDependency = async (sourceTaskId: string, targetTaskId: string) => {
  const targetTask = await TaskModel.findById(targetTaskId);

  if (!targetTask) {
    throw new NotFoundException('Target task not found');
  }

  // Remove the dependency
  targetTask.dependsOn = targetTask.dependsOn.filter(
    id => id.toString() !== sourceTaskId
  );
  await targetTask.save();

  return { success: true };
};

/**
 * Helper function to calculate sprint progress
 */
const calculateSprintProgress = (sprint: any): number => {
  if (!sprint.totalTasks || sprint.totalTasks === 0) return 0;
  return sprint.completedTasks / sprint.totalTasks;
};

/**
 * Helper function to get color based on task status
 */
const getTaskStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'To Do': '#3B82F6',      // Blue
    'In Progress': '#8B5CF6', // Purple
    'Review': '#F59E0B',     // Amber
    'Done': '#10B981',       // Green
    'Backlog': '#6B7280',    // Gray
    'Blocked': '#EF4444'     // Red
  };

  return statusColors[status] || '#6B7280'; // Default to gray
};