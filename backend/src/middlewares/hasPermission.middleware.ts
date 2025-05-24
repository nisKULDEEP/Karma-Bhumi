import { Request, Response, NextFunction } from "express";
import { PermissionType } from "../enums/role.enum";
import { ForbiddenError } from "../utils/errors";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import mongoose from "mongoose";

/**
 * Middleware to check if user has required permissions within a workspace context
 * @param requiredPermissions - An array of permissions to check against
 * @param anyPermission - If true, user needs to have at least one of the permissions. If false (default), user needs all permissions.
 */
export const hasPermission = (
  requiredPermissions: PermissionType | PermissionType[],
  anyPermission = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get current user ID
      const userId = req.user?._id;
      if (!userId) {
        throw new ForbiddenError("You must be logged in");
      }

      // Get workspace ID from params or query
      const workspaceId = 
        req.params.workspaceId || 
        req.query.workspaceId || 
        req.body.workspaceId;

      if (!workspaceId) {
        throw new ForbiddenError("Workspace ID is required");
      }

      // Convert string permission to array for consistent handling
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      // Find the member record to get their role in this workspace
      const member = await MemberModel.findOne({
        userId: new mongoose.Types.ObjectId(userId.toString()),
        workspaceId: new mongoose.Types.ObjectId(workspaceId.toString())
      });

      if (!member) {
        throw new ForbiddenError("You are not a member of this workspace");
      }

      // Get the role and its associated permissions
      const role = await RoleModel.findById(member.role);
      if (!role) {
        throw new ForbiddenError("Role not found");
      }

      // Check if the user's role has the required permissions
      const hasRequiredPermissions = anyPermission
        ? permissions.some(permission => role.permissions.includes(permission))
        : permissions.every(permission => role.permissions.includes(permission));

      if (!hasRequiredPermissions) {
        throw new ForbiddenError(
          `You don't have the required ${
            anyPermission ? "permission" : "permissions"
          }`
        );
      }

      // If the user has the required permissions, proceed
      next();
    } catch (error) {
      next(error);
    }
  };
};