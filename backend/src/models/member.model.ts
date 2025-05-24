import mongoose, { Document, Schema } from "mongoose";
import { RoleDocument } from "./roles-permission.model";

export enum MemberContextType {
  ORGANIZATION = "organization",
  DEPARTMENT = "department",
  TEAM = "team",
  WORKSPACE = "workspace",
}

export interface MemberDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contextType: string; // MemberContextType enum value
  organizationId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  role: RoleDocument;
  joinedAt: Date;
}

const memberSchema = new Schema<MemberDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contextType: {
      type: String,
      enum: Object.values(MemberContextType),
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: function(this: MemberDocument) {
        return this.contextType === MemberContextType.ORGANIZATION || 
               this.contextType === MemberContextType.DEPARTMENT || 
               this.contextType === MemberContextType.TEAM || 
               this.contextType === MemberContextType.WORKSPACE;
      },
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: function(this: MemberDocument) {
        return this.contextType === MemberContextType.DEPARTMENT;
      },
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: function(this: MemberDocument) {
        return this.contextType === MemberContextType.TEAM;
      },
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: function(this: MemberDocument) {
        return this.contextType === MemberContextType.WORKSPACE;
      },
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient lookup
memberSchema.index({ userId: 1, contextType: 1 });
// Removing all duplicate indexes that are already defined with unique constraints below
// memberSchema.index({ userId: 1, organizationId: 1, contextType: 1 });
// memberSchema.index({ userId: 1, departmentId: 1, contextType: 1 });
// memberSchema.index({ userId: 1, teamId: 1, contextType: 1 });
// memberSchema.index({ userId: 1, workspaceId: 1, contextType: 1 });

// Create compound unique indexes to prevent duplicate memberships in the same context
memberSchema.index(
  { userId: 1, organizationId: 1, contextType: 1 }, 
  { unique: true, partialFilterExpression: { contextType: MemberContextType.ORGANIZATION } }
);
memberSchema.index(
  { userId: 1, departmentId: 1, contextType: 1 }, 
  { unique: true, partialFilterExpression: { contextType: MemberContextType.DEPARTMENT } }
);
memberSchema.index(
  { userId: 1, teamId: 1, contextType: 1 }, 
  { unique: true, partialFilterExpression: { contextType: MemberContextType.TEAM } }
);
memberSchema.index(
  { userId: 1, workspaceId: 1, contextType: 1 }, 
  { unique: true, partialFilterExpression: { contextType: MemberContextType.WORKSPACE } }
);

const MemberModel = mongoose.model<MemberDocument>("Member", memberSchema);
export default MemberModel;
