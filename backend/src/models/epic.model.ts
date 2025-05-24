import mongoose, { Document, Schema } from "mongoose";

export interface EpicDocument extends Document {
  name: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  board: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  startDate: Date | null;
  endDate: Date | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const epicSchema = new Schema<EpicDocument>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: false,
      default: null,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
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
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date, 
      default: null,
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
epicSchema.index({ project: 1 });
epicSchema.index({ board: 1 });
epicSchema.index({ workspace: 1 });
epicSchema.index({ team: 1 });
epicSchema.index({ organization: 1 });

const EpicModel = mongoose.model<EpicDocument>("Epic", epicSchema);

export default EpicModel;