import mongoose from "mongoose";
import { NotFoundException, BadRequestException } from "../utils/appError";
import SprintModel from "../models/sprint.model";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";

export const createSprintService = async (
  userId: string,
  workspaceId: string,
  projectId: string,
  body: {
    name: string;
    startDate: Date;
    endDate: Date;
    goal?: string;
  }
) => {
  // Validate dates
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (endDate <= startDate) {
    throw new BadRequestException("End date must be after start date");
  }

  // Create new sprint
  const sprint = new SprintModel({
    name: body.name,
    project: projectId,
    workspace: workspaceId,
    startDate,
    endDate,
    goal: body.goal || null,
    isActive: false,
    createdBy: userId,
  });

  await sprint.save();

  return { sprint };
};

export const getSprintsService = async (
  workspaceId: string,
  projectId: string
) => {
  const sprints = await SprintModel.find({
    workspace: workspaceId,
    project: projectId,
  })
    .populate("createdBy", "name profilePicture -password")
    .sort({ createdAt: -1 });

  return { sprints };
};

export const getSprintByIdService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string
) => {
  const sprint = await SprintModel.findOne({
    _id: sprintId,
    workspace: workspaceId,
    project: projectId,
  }).populate("createdBy", "name profilePicture -password");

  if (!sprint) {
    throw new NotFoundException("Sprint not found");
  }

  // Get tasks in this sprint
  const tasks = await TaskModel.find({
    sprint: sprintId,
    workspace: workspaceId,
    project: projectId,
  })
    .populate("assignedTo", "name email profilePicture -password")
    .populate("createdBy", "name profilePicture -password");

  return { sprint, tasks };
};

export const updateSprintService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string,
  body: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    goal?: string;
  }
) => {
  const sprint = await SprintModel.findOne({
    _id: sprintId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!sprint) {
    throw new NotFoundException("Sprint not found");
  }

  // Update fields if provided
  if (body.name) sprint.name = body.name;
  if (body.goal !== undefined) sprint.goal = body.goal;

  // Validate dates if both are provided
  if (body.startDate && body.endDate) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    sprint.startDate = startDate;
    sprint.endDate = endDate;
  } else if (body.startDate) {
    const startDate = new Date(body.startDate);
    if (startDate >= sprint.endDate) {
      throw new BadRequestException("Start date must be before end date");
    }
    sprint.startDate = startDate;
  } else if (body.endDate) {
    const endDate = new Date(body.endDate);
    if (endDate <= sprint.startDate) {
      throw new BadRequestException("End date must be after start date");
    }
    sprint.endDate = endDate;
  }

  await sprint.save();

  return { sprint };
};

export const startSprintService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if there's an active sprint already
    const activeSprintExists = await SprintModel.findOne({
      workspace: workspaceId,
      project: projectId,
      isActive: true,
    }).session(session);

    if (activeSprintExists) {
      throw new BadRequestException(
        "Another sprint is already active. Complete it before starting a new one."
      );
    }

    // Find the sprint to activate
    const sprint = await SprintModel.findOne({
      _id: sprintId,
      workspace: workspaceId,
      project: projectId,
    }).session(session);

    if (!sprint) {
      throw new NotFoundException("Sprint not found");
    }

    sprint.isActive = true;
    await sprint.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { sprint };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const completeSprintService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the sprint to complete
    const sprint = await SprintModel.findOne({
      _id: sprintId,
      workspace: workspaceId,
      project: projectId,
      isActive: true,
    }).session(session);

    if (!sprint) {
      throw new NotFoundException("Active sprint not found");
    }

    // Set sprint to inactive
    sprint.isActive = false;
    await sprint.save({ session });

    // Move incomplete tasks back to backlog
    await TaskModel.updateMany(
      {
        sprint: sprintId,
        status: { $ne: TaskStatusEnum.DONE },
      },
      {
        sprint: null,
        status: TaskStatusEnum.BACKLOG,
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { message: "Sprint completed successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const deleteSprintService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the sprint to delete
    const sprint = await SprintModel.findOne({
      _id: sprintId,
      workspace: workspaceId,
      project: projectId,
    }).session(session);

    if (!sprint) {
      throw new NotFoundException("Sprint not found");
    }

    if (sprint.isActive) {
      throw new BadRequestException(
        "Cannot delete an active sprint. Complete it first."
      );
    }

    // Reset sprint reference for all tasks in this sprint
    await TaskModel.updateMany(
      { sprint: sprintId },
      { sprint: null },
      { session }
    );

    // Delete the sprint
    await sprint.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return { message: "Sprint deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const addTasksToSprintService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string,
  taskIds: string[]
) => {
  // Check if sprint exists
  const sprint = await SprintModel.findOne({
    _id: sprintId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!sprint) {
    throw new NotFoundException("Sprint not found");
  }

  // Add tasks to the sprint
  await TaskModel.updateMany(
    {
      _id: { $in: taskIds },
      workspace: workspaceId,
      project: projectId,
    },
    { sprint: sprintId }
  );

  return { message: "Tasks added to sprint successfully" };
};

export const removeTaskFromSprintService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string,
  taskId: string
) => {
  // Check if sprint exists
  const sprint = await SprintModel.findOne({
    _id: sprintId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!sprint) {
    throw new NotFoundException("Sprint not found");
  }

  // Check if the task is in this sprint
  const task = await TaskModel.findOne({
    _id: taskId,
    sprint: sprintId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!task) {
    throw new NotFoundException("Task not found in this sprint");
  }

  // Remove the task from the sprint
  task.sprint = null;
  if (sprint.isActive && task.status === TaskStatusEnum.BACKLOG) {
    // If the sprint is active and the task is in backlog, move it to TODO
    task.status = TaskStatusEnum.TODO;
  }
  await task.save();

  return { message: "Task removed from sprint successfully" };
};

export const getActiveSprintService = async (
  workspaceId: string,
  projectId: string
) => {
  const activeSprint = await SprintModel.findOne({
    workspace: workspaceId,
    project: projectId,
    isActive: true,
  }).populate("createdBy", "name profilePicture -password");

  if (!activeSprint) {
    return { activeSprint: null, tasks: [] };
  }

  // Get tasks in this sprint
  const tasks = await TaskModel.find({
    sprint: activeSprint._id,
    workspace: workspaceId,
    project: projectId,
  })
    .populate("assignedTo", "name email profilePicture -password")
    .populate("createdBy", "name profilePicture -password");

  return { activeSprint, tasks };
};