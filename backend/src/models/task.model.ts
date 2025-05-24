import mongoose, { Document, Schema } from "mongoose";
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from "../enums/task.enum";
import { generateTaskCode } from "../utils/uuid";

export interface TaskDocument extends Document {
  taskCode: string;
  title: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  board: mongoose.Types.ObjectId;
  epic: mongoose.Types.ObjectId | null;
  status: TaskStatusEnumType;
  priority: TaskPriorityEnumType;
  assignedTo: mongoose.Types.ObjectId[] | []; // Now supports multiple assignees
  comments: any;
  attachments: any;
  createdBy: mongoose.Types.ObjectId;
  startDate: Date | null;
  dueDate: Date | null;
  sprint: mongoose.Types.ObjectId | null;
  parent: mongoose.Types.ObjectId | null; // For subtasks
  isSubtask: boolean;
  dependsOn: mongoose.Types.ObjectId[] | []; // For Gantt chart task dependencies
  customFields: { key: string; value: any }[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    taskCode: {
      type: String,
      unique: true,
      default: generateTaskCode,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
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
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    epic: {
      type: Schema.Types.ObjectId,
      ref: "Epic",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatusEnum),
      default: TaskStatusEnum.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriorityEnum),
      default: TaskPriorityEnum.MEDIUM,
    },
    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    isSubtask: {
      type: Boolean,
      default: false,
    },
    dependsOn: [{
      type: Schema.Types.ObjectId,
      ref: "Task",
    }],
    customFields: [
      {
        key: { type: String, required: true },
        value: { type: Schema.Types.Mixed }
      }
    ],
    comments: [
      {
        content: { type: String, required: true },
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient lookup
taskSchema.index({ project: 1 });
taskSchema.index({ workspace: 1 });
taskSchema.index({ organization: 1 });
taskSchema.index({ team: 1 });
taskSchema.index({ board: 1 });
taskSchema.index({ epic: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ sprint: 1 });
taskSchema.index({ parent: 1 });
taskSchema.index({ isSubtask: 1 });

const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema);

export default TaskModel;
