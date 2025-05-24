// filepath: /Users/niskuldeep/Desktop/personal/Advanced-MERN-B2B-Teams-Project-Management-Saas/backend/src/scripts/fix-permissions.ts
/**
 * This script updates permissions for a specific user in a specific workspace
 * Run with: npx ts-node src/scripts/fix-permissions.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { connectDatabase, closeDatabase } from '../config/database.config';
import UserModel from '../models/user.model';
import WorkspaceModel from '../models/workspace.model';
import MemberModel from '../models/member.model';
import RoleModel from '../models/roles-permission.model';
import { Permissions } from '../enums/role.enum';

// Load environment variables
config();

async function fixUserPermissions() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('Connected to database');

    // Workspace ID from the URL
    const workspaceId = '67ffe01e9fcf9de1c56c5a45';
    
    // Find the workspace
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      console.error('Workspace not found');
      return;
    }
    
    console.log(`Found workspace: ${workspace.name}`);
    
    // Find all members in this workspace
    const members = await MemberModel.find({ workspaceId }).populate('role');
    
    if (members.length === 0) {
      console.error('No members found in this workspace');
      return;
    }
    
    console.log(`Found ${members.length} members in this workspace`);
    
    // Check each member's role and permissions
    for (const member of members) {
      const user = await UserModel.findById(member.userId);
      
      if (!user) continue;
      
      console.log(`Member: ${user.email || user.name || member.userId}`);
      console.log(`Role: ${member.role?.name || 'No role'}`);
      
      // If the role exists, update its permissions
      if (member.role) {
        // @ts-ignore - We know role is populated
        const roleId = member.role._id;
        const role = await RoleModel.findById(roleId);
        
        if (role) {
          // Check if INVITE_MEMBERS permission is already present
          if (!role.permissions.includes(Permissions.INVITE_MEMBERS)) {
            // Add the permission
            role.permissions.push(Permissions.INVITE_MEMBERS);
            await role.save();
            console.log(`Added INVITE_MEMBERS permission to role ${role.name}`);
          } else {
            console.log(`Role ${role.name} already has INVITE_MEMBERS permission`);
          }
          
          // Also add ADD_MEMBER permission
          if (!role.permissions.includes(Permissions.ADD_MEMBER)) {
            role.permissions.push(Permissions.ADD_MEMBER);
            await role.save();
            console.log(`Added ADD_MEMBER permission to role ${role.name}`);
          } else {
            console.log(`Role ${role.name} already has ADD_MEMBER permission`);
          }
        }
      }
    }

    console.log('Permissions update completed!');
  } catch (error) {
    console.error('Error updating permissions:', error);
  } finally {
    await closeDatabase();
    console.log('Disconnected from database');
  }
}

// Run the fix
fixUserPermissions();