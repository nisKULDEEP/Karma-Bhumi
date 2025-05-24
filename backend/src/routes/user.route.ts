import { Router } from "express";
import { getCurrentUserController, getUserWorkspacePermissionsController } from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";

const userRoutes = Router();

userRoutes.get("/current", isAuthenticated, getCurrentUserController);
userRoutes.get("/workspace/:workspaceId/permissions", isAuthenticated, getUserWorkspacePermissionsController);

export default userRoutes;
