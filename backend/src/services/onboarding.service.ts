import mongoose, { ClientSession } from "mongoose";
import OrganizationModel from "../models/organization.model";
import UserModel, { UserDocument } from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import ProjectModel, { ProjectDocument } from "../models/project.model";
import ProjectTemplateModel from "../models/project-template.model";
import { MemberContextType } from "../models/member.model";
import { Roles } from "../enums/role.enum";
import { ProviderEnum } from "../enums/account-provider.enum";
import { BadRequestException, NotFoundException } from "../utils/appError";

// Add a utility function to check if transactions are supported
const isTransactionSupported = async (): Promise<boolean> => {
  try {
    // For local development, always return false to avoid transaction-related errors
    // This is a safer approach since most local MongoDB setups are standalone instances
    
    // Check if we're in a development environment
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                          !process.env.NODE_ENV || 
                          process.env.NODE_ENV === 'local';
    
    if (isDevelopment) {
      console.log('Development environment detected - disabling MongoDB transactions');
      return false;
    }
    
    // Check if the MongoDB topology supports transactions
    // This is safer than trying to actually start a transaction
    const db = mongoose.connection.db;
    if (!db) {
      console.log('MongoDB connection not established yet - disabling transactions');
      return false;
    }
    
    // Check if the connection is a standalone (which doesn't support transactions)
    const topology = (mongoose.connection as any).topology;
    if (topology && topology.constructor.name === 'SingleConnection') {
      console.log('MongoDB running in standalone mode - transactions not supported');
      return false;
    }
    
    // More conservative approach: Always return false unless explicitly in production
    if (process.env.NODE_ENV !== 'production' || !process.env.ENABLE_TRANSACTIONS) {
      console.log('MongoDB transactions disabled by default - set NODE_ENV=production and ENABLE_TRANSACTIONS=true to enable');
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error checking transaction support, defaulting to no transactions:', error.message);
    return false;
  }
};

export interface OrganizationSetupData {
  name: string;
  subdomain: string;
  industry?: string;
  logo?: string;
  settings?: {
    theme?: {
      primaryColor: string;
      secondaryColor: string;
    };
    features?: {
      enableTimeTracking: boolean;
      enableSprintPlanning: boolean;
      enableGitIntegration: boolean;
    };
  };
}

export interface UserSetupData {
  email: string;
  name: string;
  password?: string;  // Make password optional
  profilePicture?: string;
  useExistingUser?: boolean; // Add flag for existing users
  _id?: any; // User ID for when using existing user credentials
}

export interface WorkspaceSetupData {
  name: string;
  description?: string;
  teamMembers?: { email: string; role: string }[];
}

export interface ProjectSetupData {
  name: string;
  description?: string;
  templateId: string;
  customStatuses?: { name: string; color: string }[];
}

export interface OnboardingStatus {
  step: string;
  nextStep: string | null;
  completed: boolean;
  organization?: {
    exists: boolean;
    id?: string;
    name?: string;
  };
  workspace?: {
    exists: boolean;
    id?: string;
    name?: string;
  };
  project?: {
    exists: boolean;
    id?: string;
    name?: string;
  };
}

/**
 * Get the current onboarding status for a user
 */
export const getOnboardingStatus = async (userId: string): Promise<OnboardingStatus> => {
  try {
    // Get user with populated fields
    const user = await UserModel.findById(userId)
      .populate('currentOrganization')
      .populate('currentWorkspace');
    
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check organization status
    const hasOrganization = !!user.currentOrganization;
    
    // If no organization, return early
    if (!hasOrganization) {
      return {
        step: 'organization_setup_required',
        nextStep: 'organization_setup',
        completed: false,
        organization: {
          exists: false
        },
        workspace: {
          exists: false
        },
        project: {
          exists: false
        }
      };
    }
    
    // Check workspace status
    const hasWorkspace = !!user.currentWorkspace;
    
    // If no workspace, return organization status
    if (!hasWorkspace) {
      return {
        step: 'organization_created',
        nextStep: 'workspace_setup',
        completed: false,
        organization: {
          exists: true,
          id: (user.currentOrganization as any)._id.toString(),
          name: (user.currentOrganization as any).name
        },
        workspace: {
          exists: false
        },
        project: {
          exists: false
        }
      };
    }
    
    // Check if user has any projects in the current workspace
    const projects = await ProjectModel.find({
      workspace: user.currentWorkspace,
      owner: userId
    }).limit(1) as ProjectDocument[];
    
    const hasProjects = projects.length > 0;
    
    if (!hasProjects) {
      return {
        step: 'workspace_created',
        nextStep: 'project_setup',
        completed: false,
        organization: {
          exists: true,
          id: (user.currentOrganization as any)._id.toString(),
          name: (user.currentOrganization as any).name
        },
        workspace: {
          exists: true,
          id: (user.currentWorkspace as any)._id.toString(),
          name: (user.currentWorkspace as any).name
        },
        project: {
          exists: false
        }
      };
    }
    
    // User has completed all onboarding steps
    return {
      step: 'project_created',
      nextStep: null,
      completed: true,
      organization: {
        exists: true,
        id: (user.currentOrganization as any)._id.toString(),
        name: (user.currentOrganization as any).name
      },
      workspace: {
        exists: true, 
        id: (user.currentWorkspace as any)._id.toString(),
        name: (user.currentWorkspace as any).name
      },
      project: {
        exists: true,
        id: projects[0]._id ? projects[0]._id.toString() : String(projects[0]._id),
        name: projects[0].name
      }
    };
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    throw error;
  }
};

export const setupOrganizationWithUser = async (
  organizationData: OrganizationSetupData,
  userData: UserSetupData
) => {
  // Check if transactions are supported
  const transactionsSupported = await isTransactionSupported();
  let session: ClientSession | undefined; // Explicitly type session

  if (transactionsSupported) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    // 1. Check if subdomain is available
    const existingOrgQuery = OrganizationModel.findOne({
      subdomain: organizationData.subdomain,
    });

    // Apply session if transactions are supported
    const existingOrg = transactionsSupported
      ? await existingOrgQuery.session(session ?? null) // Fix: Use ?? null
      : await existingOrgQuery;

    if (existingOrg) {
      throw new BadRequestException("Subdomain is already taken");
    }

    let user: UserDocument;

    if (userData.useExistingUser) {
      // Use the existing user instead of creating a new one
      if (!userData.email) {
        // If email is not provided in userData, try to find the user by userId from the session
        const userQuery = UserModel.findById(userData._id);
        const foundUser = transactionsSupported
          ? await userQuery.session(session ?? null) // Fix: Use ?? null
          : await userQuery;

        if (!foundUser) {
          throw new NotFoundException("User not found. Please sign in again.");
        }

        // Now TypeScript knows foundUser is not null
        user = foundUser;
      } else {
        // Use the provided email to find the user
        const userQuery = UserModel.findOne({ email: userData.email });
        const existingUser = transactionsSupported
          ? await userQuery.session(session ?? null) // Fix: Use ?? null
          : await userQuery;

        if (!existingUser) {
          throw new NotFoundException("User not found. Please sign up first.");
        }

        // Now we know existingUser is not null
        user = existingUser;
      }
    } else {
      // Create a new user
      user = new UserModel({
        email: userData.email,
        name: userData.name,
        password: userData.password,
        profilePicture: userData.profilePicture,
      });

      if (transactionsSupported && session) { // Check session
        await user.save({ session });
      } else {
        await user.save();
      }

      // Create account for new user
      const account = new AccountModel({
        userId: user._id,
        provider: ProviderEnum.EMAIL,
        providerId: userData.email,
      });

      if (transactionsSupported && session) { // Check session
        await account.save({ session });
      } else {
        await account.save();
      }
    }

    // 4. Create organization
    const organization = new OrganizationModel({
      name: organizationData.name,
      subdomain: organizationData.subdomain,
      industry: organizationData.industry,
      logo: organizationData.logo,
      owner: user._id,
      settings: organizationData.settings || {
        theme: {
          primaryColor: "#2563eb",
          secondaryColor: "#1e40af",
        },
        features: {
          enableTimeTracking: true,
          enableSprintPlanning: true,
          enableGitIntegration: true,
        },
      },
    });

    if (transactionsSupported && session) { // Check session
      await organization.save({ session });
    } else {
      await organization.save();
    }

    // 5. Set up organization membership
    const roleQuery = RoleModel.findOne({ name: Roles.OWNER });
    const ownerRole = transactionsSupported
      ? await roleQuery.session(session ?? null) // Fix: Use ?? null
      : await roleQuery;

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const orgMember = new MemberModel({
      userId: user._id,
      organizationId: organization._id,
      role: ownerRole._id,
      contextType: MemberContextType.ORGANIZATION,
      joinedAt: new Date(),
    });

    if (transactionsSupported && session) { // Check session
      await orgMember.save({ session });
    } else {
      await orgMember.save();
    }

    // Update user with organization
    user.currentOrganization = organization._id as mongoose.Types.ObjectId;

    if (transactionsSupported && session) { // Check session
      await user.save({ session });
    } else {
      await user.save();
    }

    if (transactionsSupported && session) { // Fix: Check session before committing
      await session.commitTransaction();
      session.endSession();
    }

    return { user, organization };
  } catch (error) {
    if (transactionsSupported && session) { // Fix: Check session before aborting
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

export const setupWorkspaceForOrganization = async (
  organizationId: string,
  userId: string,
  workspaceData: WorkspaceSetupData
) => {
  // Check if transactions are supported
  const transactionsSupported = await isTransactionSupported();
  let session: ClientSession | undefined; // Explicitly type session

  if (transactionsSupported) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    const orgQuery = OrganizationModel.findById(organizationId);
    const organization = transactionsSupported
      ? await orgQuery.session(session ?? null) // Fix: Use ?? null
      : await orgQuery;

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    // 1. Create workspace
    const workspace = new WorkspaceModel({
      name: workspaceData.name,
      description: workspaceData.description,
      owner: userId,
      organization: organizationId,
    });

    if (transactionsSupported && session) { // Check session
      await workspace.save({ session });
    } else {
      await workspace.save();
    }

    // 2. Set up workspace membership for owner
    const roleQuery = RoleModel.findOne({ name: Roles.OWNER });
    const ownerRole = transactionsSupported
      ? await roleQuery.session(session ?? null) // Use ?? null
      : await roleQuery;

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const workspaceMember = new MemberModel({
      userId,
      workspaceId: workspace._id,
      organizationId: organizationId, // Add organizationId
      role: ownerRole._id,
      contextType: MemberContextType.WORKSPACE,
      joinedAt: new Date(),
    });

    if (transactionsSupported && session) { // Check session
      await workspaceMember.save({ session });
    } else {
      await workspaceMember.save();
    }

    // 3. Update user's current workspace
    const userQuery = UserModel.findById(userId);
    const user = transactionsSupported
      ? await userQuery.session(session ?? null) // Use ?? null
      : await userQuery;

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    if (transactionsSupported && session) { // Check session
      await user.save({ session });
    } else {
      await user.save();
    }

    // 4. Invite team members if provided
    if (workspaceData.teamMembers && workspaceData.teamMembers.length > 0) {
      for (const memberData of workspaceData.teamMembers) {
        const memberUserQuery = UserModel.findOne({ email: memberData.email });
        const memberUser = transactionsSupported
          ? await memberUserQuery.session(session ?? null) // Use ?? null
          : await memberUserQuery;

        if (memberUser) {
          const memberRoleQuery = RoleModel.findOne({ name: memberData.role });
          const memberRole = transactionsSupported
            ? await memberRoleQuery.session(session ?? null) // Use ?? null
            : await memberRoleQuery;

          if (memberRole) {
            const newMember = new MemberModel({
              userId: memberUser._id,
              workspaceId: workspace._id,
              organizationId: organizationId, // Add organizationId
              role: memberRole._id,
              contextType: MemberContextType.WORKSPACE,
              joinedAt: new Date(),
            });
            if (transactionsSupported && session) { // Check session
              await newMember.save({ session });
            } else {
              await newMember.save();
            }
          } else {
            console.warn(`Role ${memberData.role} not found for user ${memberData.email}`);
          }
        } else {
          console.warn(`User with email ${memberData.email} not found`);
          // Optionally, send an invitation email here
        }
      }
    }

    if (transactionsSupported && session) { // Fix: Check session before committing
      await session.commitTransaction();
      session.endSession();
    }

    return { workspace };
  } catch (error) {
    if (transactionsSupported && session) { // Fix: Check session before aborting
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

export const setupProjectForWorkspace = async (
  workspaceId: string,
  userId: string,
  projectData: ProjectSetupData
) => {
  const transactionsSupported = await isTransactionSupported();
  let session: ClientSession | undefined;

  if (transactionsSupported) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    // Find workspace
    const workspaceQuery = WorkspaceModel.findById(workspaceId);
    const workspace = transactionsSupported
      ? await workspaceQuery.session(session ?? null)
      : await workspaceQuery;

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    // Ensure the user has a membership in this workspace
    const memberQuery = MemberModel.findOne({
      userId,
      workspaceId,
      contextType: MemberContextType.WORKSPACE
    });
    
    const existingMembership = transactionsSupported
      ? await memberQuery.session(session ?? null)
      : await memberQuery;
    
    // If user doesn't have workspace membership, create it
    if (!existingMembership) {
      console.log(`User ${userId} needs workspace membership for workspace ${workspaceId}`);
      
      // Find owner role
      const roleQuery = RoleModel.findOne({ name: Roles.OWNER });
      const ownerRole = transactionsSupported
        ? await roleQuery.session(session ?? null)
        : await roleQuery;

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      // Create workspace membership
      const workspaceMember = new MemberModel({
        userId,
        workspaceId,
        organizationId: workspace.organization,
        role: ownerRole._id,
        contextType: MemberContextType.WORKSPACE,
        joinedAt: new Date(),
      });

      if (transactionsSupported && session) {
        await workspaceMember.save({ session });
      } else {
        await workspaceMember.save();
      }
    }

    // Try to find template by ID or name (for special cases like "scrum-template")
    let template;
    
    try {
      // First try to find by ID (this will work for actual MongoDB ObjectIds)
      const templateQuery = ProjectTemplateModel.findById(projectData.templateId);
      template = transactionsSupported
        ? await templateQuery.session(session ?? null)
        : await templateQuery;
    } catch (error) {
      // If ID lookup fails, template will be null
    }
    
    // If template not found by ID, try to find by name pattern based on the ID
    if (!template) {
      // Extract a potential name from IDs like "scrum-template" -> "Scrum Project"
      let potentialName = "";
      
      if (projectData.templateId === "scrum-template") {
        potentialName = "Scrum Project";
      } else if (projectData.templateId === "kanban-template") {
        potentialName = "Kanban Board";
      } else if (projectData.templateId.includes("-template")) {
        // For any other template format, capitalize the first part
        potentialName = projectData.templateId
          .replace(/-template$/, "")
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
      
      if (potentialName) {
        const nameTemplateQuery = ProjectTemplateModel.findOne({ name: potentialName });
        template = transactionsSupported
          ? await nameTemplateQuery.session(session ?? null)
          : await nameTemplateQuery;
      }
    }

    // If still no template, use a default one
    if (!template) {
      // Create fallback template data
      const fallbackTemplateData = {
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
      };
      
      // Try to create the fallback template
      try {
        template = new ProjectTemplateModel(fallbackTemplateData);
        if (transactionsSupported && session) {
          await template.save({ session });
        } else {
          await template.save();
        }
      } catch (error) {
        console.error("Error creating fallback template:", error);
        throw new NotFoundException("Project template not found and fallback creation failed");
      }
    }

    // Create project
    const project = new ProjectModel({
      name: projectData.name,
      description: projectData.description,
      workspace: workspaceId,
      organization: workspace.organization,
      owner: userId,
      createdBy: userId,
      template: {
        category: template.category,
        defaultView: template.defaultView,
      },
      workflow: {
        statuses: projectData.customStatuses || template.taskStatuses,
        transitions: [], // Default transitions will be added based on statuses
      },
    });

    // Set up default transitions between all statuses
    const statuses = project.workflow.statuses.map(s => s.name);
    project.workflow.transitions = statuses.map(from => ({
      from,
      to: statuses.filter(s => s !== from),
    }));

    if (transactionsSupported && session) {
      await project.save({ session });
    } else {
      await project.save();
    }

    // Update user's current workspace explicitly
    const userQuery = UserModel.findById(userId);
    const user = transactionsSupported
      ? await userQuery.session(session ?? null)
      : await userQuery;

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Make sure the user's current workspace is set
    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    user.currentOrganization = workspace.organization as mongoose.Types.ObjectId;
    
    if (transactionsSupported && session) {
      await user.save({ session });
    } else {
      await user.save();
    }

    if (transactionsSupported && session) {
      await session.commitTransaction();
      session.endSession();
    }

    return { project, workspace }; // Return workspace along with project
  } catch (error) {
    if (transactionsSupported && session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};