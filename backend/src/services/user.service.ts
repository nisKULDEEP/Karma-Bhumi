import UserModel from "../models/user.model";
import MemberModel from "../models/member.model";
import { BadRequestException } from "../utils/appError";
import { PermissionType } from "../enums/role.enum";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  // Get the user's permissions for their current workspace
  let permissions: PermissionType[] = [];
  
  if (user.currentWorkspace) {
    const member = await MemberModel.findOne({
      userId: user._id,
      workspaceId: user.currentWorkspace._id
    }).populate('role');
    
    if (member && member.role) {
      // @ts-ignore - This is safe because we're populating the role
      permissions = member.role.permissions || [];
    }
  }

  return {
    user,
    permissions
  };
};

/**
 * Get a user's permissions for a specific workspace
 */
export const getUserWorkspacePermissionsService = async (userId: string, workspaceId: string) => {
  // Find the member record to get their role in this workspace
  const member = await MemberModel.findOne({
    userId,
    workspaceId
  }).populate('role');

  if (!member) {
    throw new BadRequestException("User is not a member of this workspace");
  }

  // @ts-ignore - This is safe because we're populating the role
  const permissions = member.role?.permissions || [];

  return {
    // @ts-ignore
    role: member.role?.name,
    permissions
  };
};
