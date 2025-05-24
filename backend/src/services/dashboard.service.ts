import { Types } from "mongoose";
import TaskModel from "../models/task.model";
import ProjectModel from "../models/project.model";
import { TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import { NotFoundException } from "../utils/appError";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import UserModel from "../models/user.model";

/**
 * Get dashboard statistics for a user in a workspace
 */
export const getDashboardStatsService = async (
  userId: string,
  workspaceId: string
) => {
  // Verify the user is a member of this workspace
  const member = await MemberModel.findOne({
    userId,
    workspaceId,
  });

  if (!member) {
    throw new NotFoundException(
      "User is not a member of this workspace",
      ErrorCodeEnum.MEMBER_NOT_FOUND
    );
  }

  // Tasks assigned to the user in this workspace
  const tasks = await TaskModel.find({
    workspace: workspaceId,
    assignedTo: { $in: [userId] },
  });

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === TaskStatusEnum.DONE
  ).length;

  // TODO: In a real implementation, we'd fetch this from a time tracking service
  // For now, we'll use mock data for hours tracked
  const timeTracked = {
    hours: 32,
    minutes: 15,
  };

  // TODO: In a real implementation, we'd calculate this based on user activity
  const karmaPoints = 250;
  
  // Calculate completion rate as a percentage
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    timeTracked,
    karmaPoints,
  };
};

/**
 * Get recent projects for a user in a workspace
 */
export const getRecentProjectsService = async (
  userId: string,
  workspaceId: string,
  limit = 3
) => {
  // Get projects in the workspace that the user is a member of
  const projects = await ProjectModel.find({
    workspace: workspaceId,
  }).sort({ updatedAt: -1 }).limit(limit);

  return { projects };
};

/**
 * Get upcoming tasks for a user
 */
export const getUpcomingTasksService = async (
  userId: string,
  workspaceId: string,
  limit = 3
) => {
  // Get upcoming tasks assigned to the user that are not completed
  const tasks = await TaskModel.find({
    workspace: workspaceId,
    assignedTo: { $in: [userId] },
    status: { $ne: TaskStatusEnum.DONE },
    dueDate: { $gte: new Date() }
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .populate("project", "name");
  
  return { tasks };
};

/**
 * Get active challenges for a user
 */
export const getActiveChallengesService = async (
  userId: string
) => {
  // In a real application, these would be fetched from a challenges service
  // For now, we'll return mock data
  const challenges = [
    {
      id: "1",
      title: "Complete 5 tasks today",
      progress: 3,
      total: 5,
      progressPercentage: 60
    },
    {
      id: "2", 
      title: "7-day streak",
      progress: 6,
      total: 7,
      progressPercentage: 85
    },
    {
      id: "3",
      title: "Team collaboration",
      progress: 3,
      total: 10,
      progressPercentage: 30
    }
  ];

  return { challenges };
};