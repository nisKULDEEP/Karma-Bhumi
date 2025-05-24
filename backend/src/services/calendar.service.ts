import { Types } from 'mongoose';
import TaskModel from '../models/task.model';
import SprintModel from '../models/sprint.model';
import ProjectModel from '../models/project.model';
import { NotFoundException } from '../utils/appError';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  extendedProps: {
    type: 'task' | 'sprint' | 'project' | 'deadline';
    taskId?: string;
    sprintId?: string;
    projectId?: string;
    status?: string;
    priority?: string;
    assignee?: {
      id: string;
      name: string;
    };
  };
}

// First, let's define interfaces that better match the structure returned by Mongoose
interface LeanDocument {
  _id: any;
  __v: number;
}

interface PopulatedUser extends LeanDocument {
  name: string;
  email: string;
}

interface ProjectDetails extends LeanDocument {
  name: string;
  color: string;
}

// Make sure our interface matches the actual structure returned by Mongoose
interface PopulatedTask extends LeanDocument {
  title: string;
  status: string;
  priority: string;
  startDate?: Date;
  dueDate?: Date;
  project?: ProjectDetails;
  assignedTo?: PopulatedUser[];
}

/**
 * Get calendar events for a user within a workspace
 * Includes tasks, sprints, and project deadlines
 */
export const getUserCalendarEvents = async (
  userId: string,
  workspaceId: string,
  startDate: Date,
  endDate: Date
) => {
  // Get projects the user has access to in this workspace
  const projects = await ProjectModel.find({
    workspace: workspaceId
  }).populate('team').lean();
  
  const projectIds = projects.map(project => project._id);
  
  // Get tasks assigned to the user
  const tasks = await TaskModel.find({
    project: { $in: projectIds },
    $or: [
      { assignedTo: userId },  // Changed from assignee to assignedTo to match model
      { watchers: userId }
    ],
    $and: [
      {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { dueDate: { $gte: startDate, $lte: endDate } }
        ]
      }
    ]
  })
  .populate('project', 'name color')
  .populate('assignedTo', 'name email')  // Changed from assignee to assignedTo
  .lean();
  
  // Get sprints in the user's projects
  const sprints = await SprintModel.find({
    project: { $in: projectIds },
    $and: [
      {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } }
        ]
      }
    ]
  })
  .populate('project', 'name color')
  .lean();
  
  // Transform tasks and sprints into calendar events
  const events: CalendarEvent[] = [];
  
  // Add tasks
  tasks.forEach((task) => {
    // First convert to unknown, then to our interface to avoid direct type errors
    const typedTask = task as unknown as {
      _id: any;
      title: string;
      status: string;
      priority: string;
      startDate?: Date;
      dueDate?: Date;
      project?: { _id: any; name: string; color: string };
      assignedTo?: Array<{ _id: any; name: string; email: string }>;
    };
    
    if (typedTask.startDate || typedTask.dueDate) {
      // Ensure we have valid Date objects
      const taskStartDate = typedTask.startDate ? new Date(typedTask.startDate) : undefined;
      const taskDueDate = typedTask.dueDate ? new Date(typedTask.dueDate) : undefined;
      
      // Only add tasks with at least one valid date
      if (taskStartDate || taskDueDate) {
        // Handle populated fields safely
        const assignedUser = typedTask.assignedTo && typedTask.assignedTo.length > 0 
          ? typedTask.assignedTo[0] 
          : null;
        
        events.push({
          id: `task_${typedTask._id}`,
          title: typedTask.title,
          start: taskStartDate || taskDueDate as Date, // We've checked at least one exists
          end: taskDueDate || new Date((taskStartDate as Date).getTime() + 3600000), // Default 1 hour if only start date
          allDay: false,
          color: getTaskStatusColor(typedTask.status),
          extendedProps: {
            type: 'task',
            taskId: typedTask._id.toString(),
            projectId: typedTask.project && typedTask.project._id ? typedTask.project._id.toString() : undefined,
            status: typedTask.status,
            priority: typedTask.priority,
            assignee: assignedUser ? {
              id: assignedUser._id.toString(),
              name: assignedUser.name
            } : undefined
          }
        });
      }
    }
  });
  
  // Add sprints
  sprints.forEach((sprint) => {
    // Only add sprints with both start and end dates
    if (sprint.startDate && sprint.endDate) {
      events.push({
        id: `sprint_${sprint._id}`,
        title: `Sprint: ${sprint.name}`,
        start: new Date(sprint.startDate),
        end: new Date(sprint.endDate),
        allDay: true,
        color: '#8B5CF6', // Purple for sprints
        extendedProps: {
          type: 'sprint',
          sprintId: sprint._id.toString(),
          projectId: sprint.project?._id?.toString()
        }
      });
    }
  });
  
  // Add project deadlines
  projects.forEach((project) => {
    if ((project as any).endDate && (project as any).endDate >= startDate && (project as any).endDate <= endDate) {
      events.push({
        id: `project_${project._id}`,
        title: `Deadline: ${project.name}`,
        start: new Date((project as any).endDate),
        end: new Date((project as any).endDate),
        allDay: true,
        color: '#EF4444', // Red for deadlines
        extendedProps: {
          type: 'deadline',
          projectId: project._id.toString()
        }
      });
    }
  });
  
  return { events };
};

/**
 * Update a task's dates from the calendar
 */
export const updateTaskCalendarDates = async (
  taskId: string,
  startDate: Date,
  endDate: Date
) => {
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
 * Helper function to get color based on task status
 */
const getTaskStatusColor = (status?: string): string => {
  const statusColors: Record<string, string> = {
    'To Do': '#3B82F6',      // Blue
    'In Progress': '#8B5CF6', // Purple
    'Review': '#F59E0B',     // Amber
    'Done': '#10B981',       // Green
    'Backlog': '#6B7280',    // Gray
    'Blocked': '#EF4444'     // Red
  };
  
  return statusColors[status || ''] || '#6B7280'; // Default to gray
};