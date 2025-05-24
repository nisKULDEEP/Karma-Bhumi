// filepath: /Users/niskuldeep/Desktop/personal/Advanced-MERN-B2B-Teams-Project-Management-Saas/backend/src/scripts/update-role-permissions.ts
/**
 * This script updates existing roles in the database to include the INVITE_MEMBERS permission
 * Run this with: npx ts-node src/scripts/update-role-permissions.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import RoleModel from '../models/roles-permission.model';
import { Permissions, Roles } from '../enums/role.enum';
import { connectDatabase, closeDatabase } from '../config/database.config';

// Load environment variables
config();

async function updateRolePermissions() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('Connected to database');

    // Update OWNER role
    const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
    if (ownerRole) {
      // Add INVITE_MEMBERS permission if not already present
      if (!ownerRole.permissions.includes(Permissions.INVITE_MEMBERS)) {
        ownerRole.permissions.push(Permissions.INVITE_MEMBERS);
        await ownerRole.save();
        console.log('Added INVITE_MEMBERS permission to OWNER role');
      } else {
        console.log('OWNER role already has INVITE_MEMBERS permission');
      }
    } else {
      console.log('OWNER role not found in database');
    }

    // Update ADMIN role
    const adminRole = await RoleModel.findOne({ name: Roles.ADMIN });
    if (adminRole) {
      // Add INVITE_MEMBERS permission if not already present
      if (!adminRole.permissions.includes(Permissions.INVITE_MEMBERS)) {
        adminRole.permissions.push(Permissions.INVITE_MEMBERS);
        await adminRole.save();
        console.log('Added INVITE_MEMBERS permission to ADMIN role');
      } else {
        console.log('ADMIN role already has INVITE_MEMBERS permission');
      }
    } else {
      console.log('ADMIN role not found in database');
    }

    // Update ORG_OWNER and ORG_ADMIN roles too
    const orgOwnerRole = await RoleModel.findOne({ name: Roles.ORG_OWNER });
    if (orgOwnerRole && !orgOwnerRole.permissions.includes(Permissions.INVITE_MEMBERS)) {
      orgOwnerRole.permissions.push(Permissions.INVITE_MEMBERS);
      await orgOwnerRole.save();
      console.log('Added INVITE_MEMBERS permission to ORG_OWNER role');
    }

    const orgAdminRole = await RoleModel.findOne({ name: Roles.ORG_ADMIN });
    if (orgAdminRole && !orgAdminRole.permissions.includes(Permissions.INVITE_MEMBERS)) {
      orgAdminRole.permissions.push(Permissions.INVITE_MEMBERS);
      await orgAdminRole.save();
      console.log('Added INVITE_MEMBERS permission to ORG_ADMIN role');
    }

    console.log('Role permissions updated successfully');
  } catch (error) {
    console.error('Error updating role permissions:', error);
  } finally {
    // Use the correct function to close the database connection
    await closeDatabase();
    console.log('Disconnected from database');
  }
}

// Run the update function
updateRolePermissions();