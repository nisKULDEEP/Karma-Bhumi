import { Router } from "express";
import { getDashboardStatsController, getRecentProjectsController, getUpcomingTasksController, getActiveChallengesController } from "../controllers/dashboard.controller";

const router = Router();

// Get dashboard statistics for the current user in a workspace
router.get('/workspace/:workspaceId/stats', getDashboardStatsController);

// Get recent projects for the current user in a workspace
router.get('/workspace/:workspaceId/projects/recent', getRecentProjectsController);

// Get upcoming tasks for the current user in a workspace
router.get('/workspace/:workspaceId/tasks/upcoming', getUpcomingTasksController);

// Get active challenges for the current user
router.get('/challenges', getActiveChallengesController);

export default router;