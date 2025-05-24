import mongoose, { Document, Schema } from "mongoose";

export interface TeamDocument extends Document {
  name: string;
  description: string | null;
  department: mongoose.Types.ObjectId | null;
  organization: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<TeamDocument>(
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
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: false,
      default: null
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
teamSchema.index({ department: 1 });
teamSchema.index({ organization: 1 });

const TeamModel = mongoose.model<TeamDocument>("Team", teamSchema);

export default TeamModel;