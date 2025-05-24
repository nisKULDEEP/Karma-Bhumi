import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import { Roles } from "../enums/role.enum";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import MemberModel, { MemberContextType } from "../models/member.model";
import { ProviderEnum } from "../enums/account-provider.enum";
import OrganizationModel from "../models/organization.model";
import { config } from "../config/app.config";

/**
 * Generate a unique subdomain for an organization
 * @param baseName The base name to use for the subdomain
 * @param session Optional mongoose session for transactions
 * @returns A unique subdomain string
 */
const generateUniqueSubdomain = async (baseName: string, session?: mongoose.ClientSession) => {
  // Convert the name to a valid subdomain format
  let baseSubdomain = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let subdomain = baseSubdomain;
  let attempts = 0;
  const maxAttempts = 10;
  
  // Try to find a unique subdomain
  while (attempts < maxAttempts) {
    // Check if the subdomain exists
    const exists = session 
      ? await OrganizationModel.findOne({ subdomain }).session(session)
      : await OrganizationModel.findOne({ subdomain });
    
    if (!exists) {
      return subdomain; // Found a unique subdomain
    }
    
    // If it exists, add a random suffix
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(Math.random() * 1000);
    subdomain = `${baseSubdomain}${timestamp}${randomNum}`;
    
    attempts++;
  }
  
  // If we tried too many times, use a completely unique identifier
  return `${baseSubdomain}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
}) => {
  const { providerId, provider, displayName, email, picture } = data;

  // If using in-memory MongoDB, don't use transactions
  if (config.USE_IN_MEMORY_DB) {
    try {
      let user = await UserModel.findOne({ email });

      if (!user) {
        // Create a new user if it doesn't exist
        user = new UserModel({
          email,
          name: displayName,
          profilePicture: picture || null,
        });
        await user.save();

        const account = new AccountModel({
          userId: user._id,
          provider: provider,
          providerId: providerId,
        });
        await account.save();

        // Generate a unique subdomain
        const subdomain = await generateUniqueSubdomain(user.name);

        // Create organization
        const organization = new OrganizationModel({
          name: `${user.name}'s Organization`,
          subdomain,
          owner: user._id,
        });
        await organization.save();

        // Create organization membership
        const ownerRole = await RoleModel.findOne({
          name: Roles.OWNER,
        });

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
        await orgMember.save();

        // Create workspace
        const workspace = new WorkspaceModel({
          name: `My Workspace`,
          description: `Workspace created for ${user.name}`,
          owner: user._id,
          organization: organization._id,
        });
        await workspace.save();

        // Create workspace membership
        const member = new MemberModel({
          userId: user._id,
          workspaceId: workspace._id,
          organizationId: organization._id,
          role: ownerRole._id,
          contextType: MemberContextType.WORKSPACE,
          joinedAt: new Date(),
        });
        await member.save();

        user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
        user.currentOrganization = organization._id as mongoose.Types.ObjectId;
        await user.save();
      }

      return { user };
    } catch (error) {
      throw error;
    }
  } else {
    // For regular MongoDB, use transactions as before
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      console.log("Started Session...");

      let user = await UserModel.findOne({ email }).session(session);

      if (!user) {
        // Create a new user if it doesn't exist
        user = new UserModel({
          email,
          name: displayName,
          profilePicture: picture || null,
        });
        await user.save({ session });

        const account = new AccountModel({
          userId: user._id,
          provider: provider,
          providerId: providerId,
        });
        await account.save({ session });

        // Generate a unique subdomain
        const subdomain = await generateUniqueSubdomain(user.name, session);

        // Create organization
        const organization = new OrganizationModel({
          name: `${user.name}'s Organization`,
          subdomain,
          owner: user._id,
        });
        await organization.save({ session });

        // Create organization membership
        const ownerRole = await RoleModel.findOne({
          name: Roles.OWNER,
        }).session(session);

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
        await orgMember.save({ session });

        // Create workspace
        const workspace = new WorkspaceModel({
          name: `My Workspace`,
          description: `Workspace created for ${user.name}`,
          owner: user._id,
          organization: organization._id,
        });
        await workspace.save({ session });

        // Create workspace membership
        const member = new MemberModel({
          userId: user._id,
          workspaceId: workspace._id,
          organizationId: organization._id,
          role: ownerRole._id,
          contextType: MemberContextType.WORKSPACE,
          joinedAt: new Date(),
        });
        await member.save({ session });

        user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
        user.currentOrganization = organization._id as mongoose.Types.ObjectId;
      }
      await session.commitTransaction();
      session.endSession();
      console.log("End Session...");

      return { user };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }
  }
};

export const registerUserService = async (body: {
  email: string;
  name: string;
  password: string;
}) => {
  const { email, name, password } = body;

  // If using in-memory MongoDB, don't use transactions
  if (config.USE_IN_MEMORY_DB) {
    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestException("Email already exists");
      }

      // 1. Create user
      const user = new UserModel({
        email,
        name,
        password,
      });
      await user.save();

      // 2. Create account
      const account = new AccountModel({
        userId: user._id,
        provider: ProviderEnum.EMAIL,
        providerId: email,
      });
      await account.save();

      // Generate a unique subdomain
      const subdomain = await generateUniqueSubdomain(user.name);

      // 3. Create organization
      const organization = new OrganizationModel({
        name: `${user.name}'s Organization`,
        subdomain,
        owner: user._id,
      });
      await organization.save();

      // 4. Create organization membership
      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      });

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
      await orgMember.save();

      // 5. Create workspace
      const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
        organization: organization._id,
      });
      await workspace.save();

      // 6. Create workspace membership
      const workspaceMember = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        organizationId: organization._id,
        role: ownerRole._id,
        contextType: MemberContextType.WORKSPACE,
        joinedAt: new Date(),
      });
      await workspaceMember.save();

      // 7. Update user's current workspace and organization
      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      user.currentOrganization = organization._id as mongoose.Types.ObjectId;
      await user.save();

      return {
        userId: user._id,
        workspaceId: workspace._id,
      };
    } catch (error) {
      throw error;
    }
  } else {
    // For regular MongoDB, use transactions as before
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) {
        throw new BadRequestException("Email already exists");
      }

      // 1. Create user
      const user = new UserModel({
        email,
        name,
        password,
      });
      await user.save({ session });

      // 2. Create account
      const account = new AccountModel({
        userId: user._id,
        provider: ProviderEnum.EMAIL,
        providerId: email,
      });
      await account.save({ session });

      // Generate a unique subdomain
      const subdomain = await generateUniqueSubdomain(user.name, session);

      // 3. Create organization
      const organization = new OrganizationModel({
        name: `${user.name}'s Organization`,
        subdomain,
        owner: user._id,
      });
      await organization.save({ session });

      // 4. Create organization membership
      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

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
      await orgMember.save({ session });

      // 5. Create workspace
      const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
        organization: organization._id,
      });
      await workspace.save({ session });

      // 6. Create workspace membership
      const workspaceMember = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        organizationId: organization._id,
        role: ownerRole._id,
        contextType: MemberContextType.WORKSPACE,
        joinedAt: new Date(),
      });
      await workspaceMember.save({ session });

      // 7. Update user's current workspace and organization
      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      user.currentOrganization = organization._id as mongoose.Types.ObjectId;
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        userId: user._id,
        workspaceId: workspace._id,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new NotFoundException("Invalid email or password");
  }

  const user = await UserModel.findById(account.userId);

  if (!user) {
    throw new NotFoundException("User not found for the given account");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  return user.omitPassword();
};
