import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Roles } from "../enums/role.enum";
import MemberModel, { MemberContextType } from "../models/member.model"; // Import MemberContextType
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import UserModel from "../models/user.model"; // Add User model import
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import { emailService } from "./email.service"; // Import email service
import { config } from "../config/app.config"; // Import config
import crypto from "crypto"; // For generating invite tokens

export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId,
  }).populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  const roleName = member.role?.name;

  return { role: roleName };
};

export const joinWorkspaceByInviteService = async (
  userId: string,
  inviteCode: string
) => {
  // Find workspace by invite code
  const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
  if (!workspace) {
    throw new NotFoundException("Invalid invite code or workspace not found");
  }

  // Check if user is already a member
  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  }).exec();

  if (existingMember) {
    throw new BadRequestException("You are already a member of this workspace");
  }

  const role = await RoleModel.findOne({ name: Roles.MEMBER });

  if (!role) {
    throw new NotFoundException("Role not found");
  }

  // Get the organization ID for this workspace
  if (!workspace.organization) {
    throw new BadRequestException("This workspace is not associated with an organization");
  }

  console.log("Creating new member with: ", {
    userId,
    workspaceId: workspace._id,
    contextType: MemberContextType.WORKSPACE, // Using the enum value - lowercase "workspace"
    organizationId: workspace.organization
  });

  // Add user to workspace as a member
  const newMember = new MemberModel({
    userId,
    workspaceId: workspace._id,
    role: role._id,
    contextType: MemberContextType.WORKSPACE, // Using the enum value - lowercase "workspace"
    joinedAt: new Date(),
    organizationId: workspace.organization // Required field when contextType is "workspace"
  });

  try {
    await newMember.save();
  } catch (error: any) { // Explicitly type error as any to access message property
    console.error("Error saving member:", error);
    throw new BadRequestException(`Failed to join workspace: ${error.message || 'Unknown error'}`);
  }

  return { workspaceId: workspace._id, role: role.name };
};

/**
 * Generate an invitation for a user to join a workspace
 * @param workspaceId Workspace to invite to
 * @param email Email of person to invite
 * @param inviterUserId ID of user sending the invitation
 * @param role Role to assign to the new member
 * @returns The invitation details
 */
export const generateWorkspaceInvitation = async (
  workspaceId: string,
  email: string,
  inviterUserId: string,
  roleName: string = Roles.MEMBER
) => {
  // Find workspace
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  // Check if inviter is a member of the workspace
  const inviter = await MemberModel.findOne({
    userId: inviterUserId,
    workspaceId,
  }).populate("userId");
  
  if (!inviter) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  // Find role by name
  const role = await RoleModel.findOne({ name: roleName });
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  
  // Check if user is already a member of the workspace
  if (existingUser) {
    const existingMember = await MemberModel.findOne({
      userId: existingUser._id,
      workspaceId,
    });

    if (existingMember) {
      throw new BadRequestException("User is already a member of this workspace");
    }
  }

  // Generate unique invitation code if workspace doesn't have one
  if (!workspace.inviteCode) {
    workspace.inviteCode = crypto.randomBytes(16).toString('hex');
    await workspace.save();
  }

  // Generate invitation link
  const invitationLink = `${config.FRONTEND_ORIGIN}/invite/${workspace.inviteCode}`;
  
  // Get inviter's full name or email as fallback
  const inviterUser = await UserModel.findById(inviter.userId);
  const inviterName = inviterUser?.name || inviterUser?.email || 'A team member';

  // Send invitation email
  await emailService.sendInvitationEmail(
    email,
    invitationLink,
    inviterName,
    workspace.name
  );

  return {
    email,
    invitationLink,
    workspaceName: workspace.name,
    inviterName,
  };
};
