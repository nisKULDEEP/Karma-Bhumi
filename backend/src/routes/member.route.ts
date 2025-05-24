import { Router } from "express";
import { inviteWorkspaceMemberController, joinWorkspaceController } from "../controllers/member.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";

const memberRoutes = Router();

// Public route for joining a workspace with an invite code
memberRoutes.post("/workspace/:inviteCode/join", joinWorkspaceController);

// Protected route for inviting members to a workspace
memberRoutes.post(
  "/workspace/:workspaceId/invite", 
  isAuthenticated, 
  inviteWorkspaceMemberController
);

export default memberRoutes;
