import mongoose, { Document, Schema } from "mongoose";

export enum BoardType {
  KANBAN = "kanban",
  LIST = "list",
  GANTT = "gantt",
}

export interface BoardDocument extends Document {
  name: string;
  description: string | null;
  type: string; // BoardType enum value
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<BoardDocument>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: false 
    },
    type: { 
      type: String, 
      enum: Object.values(BoardType),
      default: BoardType.KANBAN
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
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
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
boardSchema.index({ project: 1 });
boardSchema.index({ workspace: 1 });
boardSchema.index({ team: 1 });
boardSchema.index({ organization: 1 });

const BoardModel = mongoose.model<BoardDocument>("Board", boardSchema);

export default BoardModel;