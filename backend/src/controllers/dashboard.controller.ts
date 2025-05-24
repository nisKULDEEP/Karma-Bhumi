import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import { getDashboardStatsService, getRecentProjectsService, getUpcomingTasksService, getActiveChallengesService } from "../services/dashboard.service";

/**
 * Get dashboard statistics for the current user in a workspace
 */
export const getDashboardStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const dashboardStats = await getDashboardStatsService(userId, workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Dashboard statistics fetched successfully",
      ...dashboardStats,
    });
  }
);

/**
 * Get recent projects for the current user in a workspace
 */
export const getRecentProjectsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;

    const { projects } = await getRecentProjectsService(userId, workspaceId, limit);

    return res.status(HTTPSTATUS.OK).json({
      message: "Recent projects fetched successfully",
      projects,
    });
  }
);

/**
 * Get upcoming tasks for the current user in a workspace
 */
export const getUpcomingTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;

    const { tasks } = await getUpcomingTasksService(userId, workspaceId, limit);

    return res.status(HTTPSTATUS.OK).json({
      message: "Upcoming tasks fetched successfully",
      tasks,
    });
  }
);

/**
 * Get active challenges for the current user
 */
export const getActiveChallengesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { challenges } = await getActiveChallengesService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Active challenges fetched successfully",
      challenges,
    });
  }
);