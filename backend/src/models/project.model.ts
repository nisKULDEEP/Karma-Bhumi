import mongoose, { Document, Schema } from "mongoose";
import { ProjectTemplateCategory, ViewType } from "./project-template.model";

export enum ProjectStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export interface ProjectDocument extends Document {
  emoji: string;
  name: string;
  description: string | null;
  workspace: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId | null;
  template: {
    category: ProjectTemplateCategory;
    defaultView: ViewType;
  };
  workflow: {
    statuses: {
      name: string;
      color: string;
      order: number;
    }[];
    transitions: {
      from: string;
      to: string[];
    }[];
  };
  automationRules: {
    name: string;
    trigger: {
      event: string;
      conditions: Record<string, any>[];
    };
    actions: {
      type: string;
      params: Record<string, any>;
    }[];
    isActive: boolean;
  }[];
  owner: mongoose.Types.ObjectId;
  status: string; // ProjectStatus enum value
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    emoji: {
      type: String,
      required: false,
      default: "📊",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    template: {
      category: {
        type: String,
        enum: Object.values(ProjectTemplateCategory),
        required: true,
      },
      defaultView: {
        type: String,
        enum: Object.values(ViewType),
        default: ViewType.BOARD,
      },
    },
    workflow: {
      statuses: [{
        name: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
      }],
      transitions: [{
        from: {
          type: String,
          required: true,
        },
        to: [{
          type: String,
          required: true,
        }],
      }],
    },
    automationRules: [{
      name: {
        type: String,
        required: true,
      },
      trigger: {
        event: {
          type: String,
          required: true,
        },
        conditions: [{
          type: Schema.Types.Mixed,
        }],
      },
      actions: [{
        type: {
          type: String,
          required: true,
        },
        params: {
          type: Schema.Types.Mixed,
          required: true,
        },
      }],
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient lookup
projectSchema.index({ workspace: 1 });
projectSchema.index({ team: 1 });
projectSchema.index({ organization: 1 });
projectSchema.index({ "template.category": 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });

const ProjectModel = mongoose.model<ProjectDocument>("Project", projectSchema);
export default ProjectModel;
