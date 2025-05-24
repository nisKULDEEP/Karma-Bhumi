import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { createOrganizationSchema } from "../validation/organization.validation";
import { registerSchema } from "../validation/auth.validation";
import {
  setupOrganizationWithUser,
  setupWorkspaceForOrganization,
  setupProjectForWorkspace,
  getOnboardingStatus,
  OrganizationSetupData,
  UserSetupData,
  WorkspaceSetupData,
  ProjectSetupData,
} from "../services/onboarding.service";
import ProjectTemplateModel from "../models/project-template.model";

// Get current onboarding status for a user
export const getOnboardingStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    
    const status = await getOnboardingStatus(userId);
    
    return res.status(HTTPSTATUS.OK).json({
      message: "Onboarding status retrieved successfully",
      status
    });
  }
);

export const initiateOnboardingController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Always validate organization data
      const orgData = createOrganizationSchema.parse(req.body.organization);
      
      let userData;
      
      // Check if we're using existing user credentials
      if (req.body.user && req.body.user.useExistingUser === true) {
        // If using existing user, use the currently logged in user's details
        userData = {
          name: req.user?.name || '',
          email: req.user?.email || '',
          _id: req.user?._id, // Include the current user's ID
          useExistingUser: true
        };
      } else {
        // Otherwise apply full validation for new user data
        userData = registerSchema.parse(req.body.user);
      }

      // Setup organization and create/use existing user
      const { user, organization } = await setupOrganizationWithUser(
        orgData as OrganizationSetupData,
        userData as UserSetupData
      );

      // Log in the user
      req.logIn(user, (err) => {
        if (err) {
          throw err;
        }
      });

      return res.status(HTTPSTATUS.CREATED).json({
        message: "Organization and user created successfully",
        user: user.omitPassword(),
        organization,
        onboardingStatus: {
          step: 'organization_created',
          nextStep: 'workspace_setup',
          completed: false
        }
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      throw error;
    }
  }
);

export const setupWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const organizationId = req.user?.currentOrganization;
    const userId = req.user?._id;

    if (!organizationId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Organization not found. Please complete organization setup first.",
        onboardingStatus: {
          step: 'organization_setup_required',
          nextStep: 'organization_setup',
          completed: false
        }
      });
    }

    const workspaceData: WorkspaceSetupData = {
      name: req.body.name,
      description: req.body.description,
      teamMembers: req.body.teamMembers,
    };

    const { workspace } = await setupWorkspaceForOrganization(
      organizationId.toString(),
      userId,
      workspaceData
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Workspace created successfully",
      workspace,
      onboardingStatus: {
        step: 'workspace_created',
        nextStep: 'project_setup',
        completed: false
      }
    });
  }
);

export const setupProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = req.user?.currentWorkspace;
    const organizationId = req.user?.currentOrganization;
    const userId = req.user?._id;

    if (!workspaceId || !organizationId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Workspace or organization not found. Please complete previous setup steps.",
        onboardingStatus: {
          step: workspaceId ? 'organization_setup_required' : 'workspace_setup_required',
          nextStep: workspaceId ? 'organization_setup' : 'workspace_setup',
          completed: false
        }
      });
    }

    const projectData: ProjectSetupData = {
      name: req.body.name,
      description: req.body.description,
      templateId: req.body.templateId,
      customStatuses: req.body.customStatuses,
    };

    const { project, workspace } = await setupProjectForWorkspace(
      workspaceId.toString(),
      userId,
      projectData
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Project created successfully",
      project,
      workspace,
      onboardingStatus: {
        step: 'project_created',
        nextStep: null,
        completed: true
      }
    });
  }
);

export const getProjectTemplatesController = asyncHandler(
  async (req: Request, res: Response) => {
    let templates = await ProjectTemplateModel.find({ isDefault: true })
      .select('name category description defaultView taskStatuses')
      .sort({ name: 1 });

    // If no templates exist, create default ones on-the-fly
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          name: "Scrum Project",
          category: "SCRUM",
          description: "Template for Scrum teams with sprint planning and backlog management",
          defaultView: "BOARD",
          isDefault: true,
          taskStatuses: [
            { name: "Backlog", color: "#6B7280", order: 0 },
            { name: "To Do", color: "#3B82F6", order: 1 },
            { name: "In Progress", color: "#8B5CF6", order: 2 },
            { name: "Review", color: "#F59E0B", order: 3 },
            { name: "Done", color: "#10B981", order: 4 }
          ],
          taskPriorities: [
            { name: "Urgent", color: "#EF4444", order: 0 },
            { name: "High", color: "#F59E0B", order: 1 },
            { name: "Medium", color: "#3B82F6", order: 2 },
            { name: "Low", color: "#10B981", order: 3 }
          ]
        },
        {
          name: "Kanban Board",
          category: "KANBAN",
          description: "Simple Kanban board for visualizing work progress",
          defaultView: "BOARD",
          isDefault: true,
          taskStatuses: [
            { name: "To Do", color: "#3B82F6", order: 0 },
            { name: "In Progress", color: "#8B5CF6", order: 1 },
            { name: "Done", color: "#10B981", order: 2 }
          ],
          taskPriorities: [
            { name: "High", color: "#EF4444", order: 0 },
            { name: "Medium", color: "#F59E0B", order: 1 },
            { name: "Low", color: "#10B981", order: 2 }
          ]
        }
      ];

      try {
        // Create the templates in the database
        templates = await ProjectTemplateModel.create(defaultTemplates);
        console.log("Created default project templates on-the-fly");
      } catch (error) {
        console.error("Error creating default templates:", error);
        // Even if DB save fails, still return the templates for the UI
        templates = defaultTemplates as any;
      }
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Project templates fetched successfully",
      templates,
    });
  }
);