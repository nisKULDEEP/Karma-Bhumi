import mongoose, { Document, Schema } from "mongoose";

export interface SprintDocument extends Document {
  name: string;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  board: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  goal: string | null;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<SprintDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    goal: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
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

// Only one active sprint per project
sprintSchema.index({ project: 1, isActive: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true } 
});

// Create indexes for efficient lookup
sprintSchema.index({ workspace: 1 });
sprintSchema.index({ team: 1 });
sprintSchema.index({ organization: 1 });
sprintSchema.index({ board: 1 });

const SprintModel = mongoose.model<SprintDocument>("Sprint", sprintSchema);

export default SprintModel;