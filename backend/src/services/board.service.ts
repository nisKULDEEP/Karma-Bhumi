import mongoose from "mongoose";
import BoardModel, { BoardType } from "../models/board.model";
import TaskModel from "../models/task.model";
import { NotFoundException, BadRequestException } from "../utils/appError";
import { TaskStatusEnum } from "../enums/task.enum";

export interface BoardColumn {
  id: string;
  title: string;
  taskIds: string[];
  tasks: any[];
}

export interface BoardView {
  columns: BoardColumn[];
  boardId: string;
  name: string;
  description: string | null;
  type: string;
}

/**
 * Create a new board
 */
export const createBoardService = async (
  workspaceId: string,
  projectId: string,
  teamId: string,
  organizationId: string,
  userId: string,
  boardData: {
    name: string;
    description?: string;
    type: string;
  }
) => {
  try {
    const board = new BoardModel({
      name: boardData.name,
      description: boardData.description || null,
      type: boardData.type,
      project: projectId,
      workspace: workspaceId,
      team: teamId,
      organization: organizationId,
      createdBy: userId,
    });

    await board.save();

    return { board };
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
};

/**
 * Get all boards for a project
 */
export const getBoardsService = async (
  workspaceId: string,
  projectId: string
) => {
  try {
    const boards = await BoardModel.find({
      workspace: workspaceId,
      project: projectId,
    }).sort({ createdAt: -1 });

    return { boards };
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw error;
  }
};

/**
 * Get a board by ID
 */
export const getBoardByIdService = async (
  workspaceId: string,
  projectId: string,
  boardId: string
) => {
  try {
    const board = await BoardModel.findOne({
      _id: boardId,
      workspace: workspaceId,
      project: projectId,
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return { board };
  } catch (error) {
    console.error("Error fetching board:", error);
    throw error;
  }
};

/**
 * Update a board
 */
export const updateBoardService = async (
  workspaceId: string,
  projectId: string,
  boardId: string,
  updateData: {
    name?: string;
    description?: string;
    type?: string;
  }
) => {
  try {
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: boardId,
        workspace: workspaceId,
        project: projectId,
      },
      { $set: updateData },
      { new: true }
    );

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return { board };
  } catch (error) {
    console.error("Error updating board:", error);
    throw error;
  }
};

/**
 * Delete a board
 */
export const deleteBoardService = async (
  workspaceId: string,
  projectId: string,
  boardId: string
) => {
  try {
    const board = await BoardModel.findOneAndDelete({
      _id: boardId,
      workspace: workspaceId,
      project: projectId,
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    // Update any tasks assigned to this board to a default board
    // This would typically be implemented as a transaction in production
    const defaultBoard = await BoardModel.findOne({
      workspace: workspaceId,
      project: projectId,
      _id: { $ne: boardId },
    });

    if (defaultBoard) {
      await TaskModel.updateMany(
        { board: boardId },
        { $set: { board: defaultBoard._id } }
      );
    } else {
      // If no other board exists, tasks will become orphaned
      // In a production system, you might want to handle this differently
      console.warn("No alternative board exists for tasks to be reassigned to");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};

/**
 * Get tasks organized by board columns (Kanban view)
 */
export const getBoardKanbanViewService = async (
  workspaceId: string,
  projectId: string,
  boardId: string
) => {
  try {
    // Find the board
    const board = await BoardModel.findOne({
      _id: boardId,
      workspace: workspaceId,
      project: projectId,
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    // Get all tasks for this board
    const tasks = await TaskModel.find({
      workspace: workspaceId,
      project: projectId,
      board: boardId,
      isSubtask: false, // Only include parent tasks in board view
    })
      .sort({ updatedAt: -1 })
      .populate("assignedTo", "name email profilePicture")
      .populate("createdBy", "name email profilePicture");

    // Group tasks by status
    const tasksByStatus = tasks.reduce((acc: Record<string, any[]>, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {});

    // Create columns based on task statuses
    const columns = Object.entries(tasksByStatus).map(([status, tasks]) => ({
      id: status,
      title: status,
      taskIds: tasks.map((task) => task._id.toString()),
      tasks: tasks,
    }));

    // Add empty columns for statuses that don't have tasks
    const allStatuses = Object.values(TaskStatusEnum);
    allStatuses.forEach((status) => {
      if (!tasksByStatus[status]) {
        columns.push({
          id: status,
          title: status,
          taskIds: [],
          tasks: [],
        });
      }
    });

    // Sort columns to maintain consistent order
    const sortedColumns = columns.sort((a, b) => {
      const statusOrder = [
        TaskStatusEnum.TODO,
        TaskStatusEnum.IN_PROGRESS,
        TaskStatusEnum.IN_REVIEW,
        TaskStatusEnum.DONE,
      ];
      
      // Convert to string to avoid type errors
      const aIdString = String(a.id);
      const bIdString = String(b.id);
      
      // Default to end of list if not in statusOrder
      const aIndex = statusOrder.indexOf(aIdString as any);
      const bIndex = statusOrder.indexOf(bIdString as any);
      
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return {
      boardView: {
        columns: sortedColumns,
        boardId: board?._id?.toString() || boardId,
        name: board?.name || '',
        description: board?.description || null,
        type: board?.type || '',
      },
    };
  } catch (error) {
    console.error("Error fetching Kanban board view:", error);
    throw error;
  }
};

/**
 * Get tasks organized as a list (List view)
 */
export const getBoardListViewService = async (
  workspaceId: string,
  projectId: string,
  boardId: string
) => {
  try {
    // Find the board
    const board = await BoardModel.findOne({
      _id: boardId,
      workspace: workspaceId,
      project: projectId,
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    // Get all tasks for this board
    const tasks = await TaskModel.find({
      workspace: workspaceId,
      project: projectId,
      board: boardId,
    })
      .sort({ updatedAt: -1 })
      .populate("assignedTo", "name email profilePicture")
      .populate("createdBy", "name email profilePicture");

    return {
      boardView: {
        tasks,
        boardId: board?._id?.toString() || boardId,
        name: board?.name || '',
        description: board?.description || null,
        type: board?.type || '',
      },
    };
  } catch (error) {
    console.error("Error fetching List board view:", error);
    throw error;
  }
};

/**
 * Get tasks organized for Gantt chart view
 */
export const getBoardGanttViewService = async (
  workspaceId: string,
  projectId: string,
  boardId: string
) => {
  try {
    // Find the board
    const board = await BoardModel.findOne({
      _id: boardId,
      workspace: workspaceId,
      project: projectId,
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    // Get all tasks for this board with start and due dates
    const tasks = await TaskModel.find({
      workspace: workspaceId,
      project: projectId,
      board: boardId,
    })
      .sort({ dueDate: 1 })
      .populate("assignedTo", "name email profilePicture")
      .populate("createdBy", "name email profilePicture");

    // Format tasks for Gantt chart
    const ganttTasks = tasks.map((task) => ({
      id: task._id?.toString() || '',
      title: task.title,
      startDate: task.startDate,
      endDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      progress: task.status === TaskStatusEnum.DONE ? 100 : 
               task.status === TaskStatusEnum.IN_REVIEW ? 75 :
               task.status === TaskStatusEnum.IN_PROGRESS ? 50 : 0,
      dependencies: task.parent ? [task.parent.toString()] : [],
    }));

    return {
      boardView: {
        tasks: ganttTasks,
        boardId: board?._id?.toString() || boardId,
        name: board?.name || '',
        description: board?.description || null,
        type: board?.type || '',
      },
    };
  } catch (error) {
    console.error("Error fetching Gantt board view:", error);
    throw error;
  }
};

/**
 * Move a task to a different status (column) within the same board
 */
export const moveTaskBetweenColumnsService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  sourceColumn: string,
  destinationColumn: string,
  newIndex: number
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find the task
    const task = await TaskModel.findOne({
      _id: taskId,
      workspace: workspaceId,
      project: projectId,
    }).session(session);

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Update task status to match the destination column
    task.status = destinationColumn as any;
    await task.save({ session });

    // Get all tasks in the destination column to update their order if needed
    // This is where you'd implement order/position logic if needed

    await session.commitTransaction();
    
    return { task };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error moving task between columns:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Reorder tasks within the same column
 */
export const reorderTasksService = async (
  workspaceId: string,
  projectId: string,
  columnId: string,
  taskIds: string[]
) => {
  try {
    // In a real implementation, you would store task order
    // For now, we'll just return success
    return { success: true, message: "Tasks reordered" };
    
    // Example implementation if you had a 'position' field in your task model:
    /*
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Update position for each task
      const updates = taskIds.map((taskId, index) => 
        TaskModel.updateOne(
          { _id: taskId, workspace: workspaceId, project: projectId },
          { $set: { position: index } }
        ).session(session)
      );
      
      await Promise.all(updates);
      
      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    */
  } catch (error) {
    console.error("Error reordering tasks:", error);
    throw error;
  }
};