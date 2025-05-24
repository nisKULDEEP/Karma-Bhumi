import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService, getUserWorkspacePermissionsService } from "../services/user.service";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { user, permissions } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
      permissions
    });
  }
);

export const getUserWorkspacePermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { workspaceId } = req.params;

    if (!workspaceId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Workspace ID is required"
      });
    }

    const { role, permissions } = await getUserWorkspacePermissionsService(userId.toString(), workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Permissions fetched successfully",
      role,
      permissions
    });
  }
);
