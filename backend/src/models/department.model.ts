import mongoose, { Document, Schema } from "mongoose";

export interface DepartmentDocument extends Document {
  name: string;
  description: string | null;
  organization: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<DepartmentDocument>(
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

// Create index for efficient lookup of departments by organization
departmentSchema.index({ organization: 1 });

const DepartmentModel = mongoose.model<DepartmentDocument>(
  "Department",
  departmentSchema
);

export default DepartmentModel;