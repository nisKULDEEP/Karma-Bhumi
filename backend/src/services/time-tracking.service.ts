import { Types } from 'mongoose';
import TimeEntryModel from '../models/time-entry.model';
import ProjectModel from '../models/project.model';
import TaskModel from '../models/task.model';
import UserModel from '../models/user.model';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../utils/appError';
import { ErrorCodeEnum } from '../enums/error-code.enum';

interface StartTimeTrackingParams {
  taskId?: string;
  projectId?: string;
  description: string;
  startTime?: Date;
  billable?: boolean;
  tags?: string[];
}

interface UpdateTimeEntryParams {
  description?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  billable?: boolean;
  tags?: string[];
}

/**
 * Start time tracking for a task or project
 */
export const startTimeTracking = async (
  userId: string,
  workspaceId: string,
  data: StartTimeTrackingParams
) => {
  // Check if there's already an active time entry for this user
  const activeEntry = await TimeEntryModel.findOne({
    user: userId,
    endTime: { $exists: false }
  });

  if (activeEntry) {
    throw new BadRequestException(
      'You already have an active time entry. Please stop it before starting a new one.',
      ErrorCodeEnum.TIME_TRACKING_ALREADY_ACTIVE
    );
  }

  // Validate project/task if provided
  if (data.projectId) {
    const project = await ProjectModel.findOne({
      _id: data.projectId,
      workspace: workspaceId
    });
    
    if (!project) {
      throw new NotFoundException('Project not found in this workspace');
    }
  }
  
  if (data.taskId) {
    const task = await TaskModel.findById(data.taskId);
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    // If task is provided but project is not, automatically use the task's project
    if (!data.projectId && task.project) {
      data.projectId = task.project.toString();
    }
  }

  // Create the time entry
  const timeEntry = new TimeEntryModel({
    user: userId,
    workspace: workspaceId,
    project: data.projectId,
    task: data.taskId,
    description: data.description,
    startTime: data.startTime || new Date(),
    billable: data.billable || false,
    tags: data.tags || []
  });

  await timeEntry.save();

  return { timeEntry };
};

/**
 * Stop active time tracking
 */
export const stopTimeTracking = async (
  userId: string,
  workspaceId: string,
  timeEntryId: string
) => {
  const timeEntry = await TimeEntryModel.findOne({
    _id: timeEntryId,
    user: userId,
    workspace: workspaceId,
    endTime: { $exists: false }
  });

  if (!timeEntry) {
    throw new NotFoundException('Active time entry not found');
  }

  // Set end time and calculate duration
  const endTime = new Date();
  timeEntry.endTime = endTime;
  timeEntry.duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / 1000);
  
  await timeEntry.save();

  return { timeEntry };
};

/**
 * Update a time entry
 */
export const updateTimeEntry = async (
  userId: string,
  timeEntryId: string,
  updates: UpdateTimeEntryParams
) => {
  const timeEntry = await TimeEntryModel.findOne({
    _id: timeEntryId,
    user: userId
  });

  if (!timeEntry) {
    throw new NotFoundException('Time entry not found');
  }

  // Special handling for duration/times
  if (updates.startTime && updates.endTime) {
    // If both start and end times are provided, calculate duration
    updates.duration = Math.floor((updates.endTime.getTime() - updates.startTime.getTime()) / 1000);
  } else if (updates.duration && updates.startTime && !updates.endTime) {
    // If duration and start time are provided, calculate end time
    const endTime = new Date(updates.startTime);
    endTime.setSeconds(endTime.getSeconds() + updates.duration);
    updates.endTime = endTime;
  } else if (updates.duration && !updates.startTime && updates.endTime) {
    // If duration and end time are provided, calculate start time
    const startTime = new Date(updates.endTime);
    startTime.setSeconds(startTime.getSeconds() - updates.duration);
    updates.startTime = startTime;
  }

  // Update the time entry
  Object.assign(timeEntry, updates);
  await timeEntry.save();

  return { timeEntry };
};

/**
 * Delete a time entry
 */
export const deleteTimeEntry = async (
  userId: string,
  timeEntryId: string
) => {
  const timeEntry = await TimeEntryModel.findOne({
    _id: timeEntryId,
    user: userId
  });

  if (!timeEntry) {
    throw new NotFoundException('Time entry not found');
  }

  await timeEntry.deleteOne();

  return { success: true };
};

/**
 * Get time entries for a user within a workspace
 */
export const getUserTimeEntries = async (
  userId: string,
  workspaceId: string,
  startDate: Date,
  endDate: Date,
  projectId?: string,
  taskId?: string
) => {
  // Build query
  const query: any = {
    user: userId,
    workspace: workspaceId,
    startTime: { $gte: startDate, $lte: endDate }
  };

  if (projectId) {
    query.project = projectId;
  }

  if (taskId) {
    query.task = taskId;
  }

  // Get time entries
  const timeEntries = await TimeEntryModel.find(query)
    .sort({ startTime: -1 })
    .populate({
      path: 'project',
      select: 'name color'
    })
    .populate({
      path: 'task',
      select: 'title status'
    });

  // Calculate total time
  let totalTime = 0;
  timeEntries.forEach(entry => {
    if (entry.duration) {
      totalTime += entry.duration;
    }
  });

  // Group entries by day
  const entriesByDay: Record<string, any[]> = {};
  timeEntries.forEach(entry => {
    const dateKey = entry.startTime.toISOString().split('T')[0];
    if (!entriesByDay[dateKey]) {
      entriesByDay[dateKey] = [];
    }
    entriesByDay[dateKey].push(entry);
  });

  return {
    timeEntries,
    totalTime,
    entriesByDay
  };
};

/**
 * Get time summary for a project
 */
export const getProjectTimeSummary = async (
  projectId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const query: any = { project: projectId };

  if (startDate && endDate) {
    query.startTime = { $gte: startDate, $lte: endDate };
  }

  const timeEntries = await TimeEntryModel.find(query);

  // Calculate total time
  let totalTime = 0;
  timeEntries.forEach(entry => {
    if (entry.duration) {
      totalTime += entry.duration;
    }
  });

  // Group by user
  const userTimeMap: Record<string, number> = {};
  
  for (const entry of timeEntries) {
    const userId = entry.user.toString();
    if (!userTimeMap[userId]) {
      userTimeMap[userId] = 0;
    }
    userTimeMap[userId] += entry.duration || 0;
  }

  // Get unique users with their totals
  const userSummary = await Promise.all(
    Object.keys(userTimeMap).map(async (userId) => {
      const user = await TimeEntryModel.findOne({ user: userId })
        .populate('user', 'name email avatar');
      
      return {
        user: user?.user,
        totalTime: userTimeMap[userId]
      };
    })
  );

  // Group by task
  const taskTimeMap: Record<string, number> = {};
  
  for (const entry of timeEntries.filter(e => e.task)) {
    const taskId = entry.task!.toString();
    if (!taskTimeMap[taskId]) {
      taskTimeMap[taskId] = 0;
    }
    taskTimeMap[taskId] += entry.duration || 0;
  }

  // Get unique tasks with their totals
  const taskSummary = await Promise.all(
    Object.keys(taskTimeMap).map(async (taskId) => {
      const task = await TaskModel.findById(taskId)
        .select('title status');
      
      return {
        task,
        totalTime: taskTimeMap[taskId]
      };
    })
  );

  return {
    totalTime,
    userSummary,
    taskSummary
  };
};