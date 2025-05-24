import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/role-permission";
import { config } from "../config/app.config";

// Export the seedRoles function to be used in server startup
export const seedRoles = async () => {
  console.log("Seeding roles started...");

  try {
    // Only connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectDatabase();
    }

    // Check if roles already exist to avoid unnecessary reseeding
    const existingRolesCount = await RoleModel.countDocuments();
    
    if (existingRolesCount === Object.keys(RolePermissions).length) {
      console.log("All roles already exist, skipping seed.");
      return;
    }

    // Only clear roles if we need to reseed
    if (existingRolesCount > 0) {
      console.log("Clearing existing roles...");
      await RoleModel.deleteMany({});
    }

    // For in-memory MongoDB, don't use transactions as they're not supported
    // For regular MongoDB, optionally use transactions if needed
    if (config.USE_IN_MEMORY_DB) {
      // Create all roles defined in RolePermissions without transactions
      for (const roleName in RolePermissions) {
        const role = roleName as keyof typeof RolePermissions;
        const permissions = RolePermissions[role];

        const newRole = new RoleModel({
          name: role,
          permissions: permissions,
        });
        await newRole.save();
        console.log(`Role ${role} added with permissions.`);
      }
      console.log("Roles seeded successfully.");
    } else {
      // Use transactions for regular MongoDB connections (must be a replica set)
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        
        // Create all roles defined in RolePermissions with transactions
        for (const roleName in RolePermissions) {
          const role = roleName as keyof typeof RolePermissions;
          const permissions = RolePermissions[role];

          const newRole = new RoleModel({
            name: role,
            permissions: permissions,
          });
          await newRole.save({ session });
          console.log(`Role ${role} added with permissions.`);
        }

        await session.commitTransaction();
        console.log("Roles seeded successfully.");
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  } catch (error) {
    console.error("Error during role seeding:", error);
    throw error;
  }
};

// Allow direct execution of this file for manual seeding
if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log("Role seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Role seeding failed:", error);
      process.exit(1);
    });
}
