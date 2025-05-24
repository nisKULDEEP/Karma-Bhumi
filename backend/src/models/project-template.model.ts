import mongoose, { Document, Schema } from "mongoose";

export enum ProjectTemplateCategory {
  AGILE = "agile",
  KANBAN = "kanban",
  SCRUM = "scrum",
  MARKETING = "marketing",
  SALES = "sales",
  CUSTOM = "custom"
}

export enum ViewType {
  BOARD = "board",
  LIST = "list",
  GANTT = "gantt",
  CALENDAR = "calendar",
  TIMELINE = "timeline"
}

export interface ProjectTemplateDocument extends Document {
  name: string;
  category: ProjectTemplateCategory;
  description: string;
  defaultView: ViewType;
  taskStatuses: {
    name: string;
    color: string;
    order: number;
  }[];
  taskPriorities: {
    name: string;
    color: string;
    order: number;
  }[];
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
  }[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectTemplateSchema = new Schema<ProjectTemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(ProjectTemplateCategory),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    defaultView: {
      type: String,
      enum: Object.values(ViewType),
      default: ViewType.BOARD,
    },
    taskStatuses: [{
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
    taskPriorities: [{
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
    }],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient lookup
projectTemplateSchema.index({ category: 1 });
projectTemplateSchema.index({ isDefault: 1 });

const ProjectTemplateModel = mongoose.model<ProjectTemplateDocument>("ProjectTemplate", projectTemplateSchema);
export default ProjectTemplateModel;