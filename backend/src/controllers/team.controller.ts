import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { Permissions } from "../enums/role.enum";
import { roleGuard } from "../utils/roleGuard";
import { HTTPSTATUS } from "../config/http.config";
import TeamModel from "../models/team.model";
import { z } from "zod";
import ProjectModel from "../models/project.model";
import MemberModel from "../models/member.model";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { NotFoundException } from "../utils/appError";

// Schema for team creation/update
const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
});

// Schema for team ID validation
export const teamIdSchema = z.string().min(1, "Team ID is required");

/**
 * Get all teams in a workspace
 */
export const getTeamsInWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    // Find all teams in the workspace's organization
    const teams = await TeamModel.find({
      organization: workspaceId,
    }).sort({ createdAt: -1 });

    // Get additional information for each team
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        // Count team members
        const memberCount = await MemberModel.countDocuments({
          team: team._id,
        });

        // Count projects associated with this team
        const projectCount = await ProjectModel.countDocuments({
          team: team._id,
        });

        return {
          _id: team._id,
          name: team.name,
          description: team.description,
          memberCount,
          projectCount,
        };
      })
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Teams fetched successfully",
      teams: teamsWithCounts,
    });
  }
);

/**
 * Get a specific team by ID
 */
export const getTeamByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const teamId = teamIdSchema.parse(req.params.teamId);

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    // Find the team
    const team = await TeamModel.findOne({
      _id: teamId,
      organization: workspaceId,
    });

    if (!team) {
      throw new NotFoundException(
        "Team not found or does not belong to this workspace",
        ErrorCodeEnum.RESOURCE_NOT_FOUND
      );
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Team fetched successfully",
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  }
);

/**
 * Get members of a specific team
 */
export const getTeamMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const teamId = teamIdSchema.parse(req.params.teamId);

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    // Check if team exists and belongs to the workspace
    const team = await TeamModel.findOne({
      _id: teamId,
      organization: workspaceId,
    });

    if (!team) {
      throw new NotFoundException(
        "Team not found or does not belong to this workspace",
        ErrorCodeEnum.RESOURCE_NOT_FOUND
      );
    }

    // Get team members with user details
    const members = await MemberModel.find({ team: teamId })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 });

    return res.status(HTTPSTATUS.OK).json({
      message: "Team members fetched successfully",
      members,
    });
  }
);

/**
 * Get projects associated with a specific team
 */
export const getTeamProjectsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const teamId = teamIdSchema.parse(req.params.teamId);

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    // Check if team exists and belongs to the workspace
    const team = await TeamModel.findOne({
      _id: teamId,
      organization: workspaceId,
    });

    if (!team) {
      throw new NotFoundException(
        "Team not found or does not belong to this workspace",
        ErrorCodeEnum.RESOURCE_NOT_FOUND
      );
    }

    // Get team projects
    const projects = await ProjectModel.find({ team: teamId })
      .sort({ createdAt: -1 });

    return res.status(HTTPSTATUS.OK).json({
      message: "Team projects fetched successfully",
      projects,
    });
  }
);

/**
 * Create a new team in a workspace
 */
export const createTeamController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { name, description } = teamSchema.parse(req.body);

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TEAM, Permissions.MANAGE_TEAM_SETTINGS]);

    // Create the team
    const team = new TeamModel({
      name,
      description: description || null,
      organization: workspaceId, // Workspace ID is equivalent to organization ID
      department: null, // Optional: set default department if needed
      createdBy: userId,
    });

    await team.save();

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Team created successfully",
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
      },
    });
  }
);

/**
 * Update a team
 */
export const updateTeamController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const teamId = teamIdSchema.parse(req.params.teamId);
    const { name, description } = teamSchema.parse(req.body);

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_TEAM_SETTINGS]);

    // Find and update the team
    const team = await TeamModel.findOneAndUpdate(
      { 
        _id: teamId,
        organization: workspaceId 
      },
      {
        name,
        description: description || null,
      },
      { new: true }
    );

    if (!team) {
      throw new NotFoundException(
        "Team not found or does not belong to this workspace",
        ErrorCodeEnum.RESOURCE_NOT_FOUND
      );
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Team updated successfully",
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
      },
    });
  }
);

/**
 * Delete a team
 */
export const deleteTeamController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const teamId = teamIdSchema.parse(req.params.teamId);

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_TEAM_SETTINGS]);

    // Check if team has associated projects
    const projectsCount = await ProjectModel.countDocuments({ team: teamId });
    if (projectsCount > 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Cannot delete team with associated projects. Please reassign or delete the projects first."
      });
    }

    // Find and delete the team
    const team = await TeamModel.findOneAndDelete({
      _id: teamId,
      organization: workspaceId,
    });

    if (!team) {
      throw new NotFoundException(
        "Team not found or does not belong to this workspace",
        ErrorCodeEnum.RESOURCE_NOT_FOUND
      );
    }

    // Clean up team members
    await MemberModel.updateMany(
      { team: teamId },
      { $unset: { team: "" } }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Team deleted successfully",
    });
  }
);