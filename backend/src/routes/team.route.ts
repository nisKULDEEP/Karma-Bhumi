import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import {
  getTeamsInWorkspaceController,
  createTeamController,
  updateTeamController,
  deleteTeamController,
  getTeamByIdController,
  getTeamMembersController,
  getTeamProjectsController
} from "../controllers/team.controller";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Team routes
router.get("/workspace/:workspaceId", getTeamsInWorkspaceController);
router.post("/workspace/:workspaceId/create", createTeamController);
router.put("/:teamId/workspace/:workspaceId/update", updateTeamController);
router.delete("/:teamId/workspace/:workspaceId/delete", deleteTeamController);

// New routes for team details, members, and projects
router.get("/:teamId/workspace/:workspaceId", getTeamByIdController);
router.get("/:teamId/workspace/:workspaceId/members", getTeamMembersController);
router.get("/:teamId/workspace/:workspaceId/projects", getTeamProjectsController);

export default router;