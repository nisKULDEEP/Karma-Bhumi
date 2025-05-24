import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { z } from "zod";
import { HTTPSTATUS } from "../config/http.config";
import { generateWorkspaceInvitation, joinWorkspaceByInviteService, getMemberRoleInWorkspace } from "../services/member.service";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { roleGuard } from "../utils/roleGuard";

export const joinWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const inviteCode = z.string().parse(req.params.inviteCode);
    const userId = req.user?._id;

    const { workspaceId, role } = await joinWorkspaceByInviteService(
      userId,
      inviteCode
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Successfully joined the workspace",
      workspaceId,
      role,
    });
  }
);

// Schema for team member invitation
const inviteSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.string().optional(), // Optional role, default is MEMBER
});

/**
 * Invite a new member to a workspace
 */
export const inviteWorkspaceMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { email, role } = inviteSchema.parse(req.body);

    // Check user's permission in the workspace
    const userRole = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(userRole.role, [Permissions.INVITE_MEMBERS]);

    // Generate and send invitation
    const invitation = await generateWorkspaceInvitation(
      workspaceId,
      email,
      userId,
      role
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Invitation sent successfully",
      email: invitation.email,
    });
  }
);
