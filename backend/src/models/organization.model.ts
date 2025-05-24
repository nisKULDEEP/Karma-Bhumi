import mongoose, { Document, Schema } from "mongoose";

export interface OrganizationDocument extends Document {
  name: string;
  subdomain: string;
  industry?: string;
  owner: mongoose.Types.ObjectId;
  logo?: string;
  settings: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
    features: {
      enableTimeTracking: boolean;
      enableSprintPlanning: boolean;
      enableGitIntegration: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<OrganizationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[a-zA-Z0-9-]+$/.test(v);
        },
        message: "Subdomain can only contain letters, numbers, and hyphens"
      }
    },
    industry: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    logo: {
      type: String,
    },
    settings: {
      theme: {
        primaryColor: {
          type: String,
          default: "#2563eb" // Default blue color
        },
        secondaryColor: {
          type: String,
          default: "#1e40af"
        }
      },
      features: {
        enableTimeTracking: {
          type: Boolean,
          default: true
        },
        enableSprintPlanning: {
          type: Boolean,
          default: true
        },
        enableGitIntegration: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient lookup
organizationSchema.index({ subdomain: 1 }, { unique: true });
organizationSchema.index({ owner: 1 });

const OrganizationModel = mongoose.model<OrganizationDocument>("Organization", organizationSchema);
export default OrganizationModel;