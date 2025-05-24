import mongoose, { Schema, Document, Query } from 'mongoose';

/**
 * Interface representing a time entry document
 */
export interface ITimeEntry extends Document {
  user: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  task?: mongoose.Types.ObjectId;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;  // in seconds
  billable: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for time entries
 */
const timeEntrySchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    description: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number
    },
    billable: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create an index for faster queries
timeEntrySchema.index({ user: 1, workspace: 1, startTime: -1 });
timeEntrySchema.index({ project: 1, startTime: -1 });
timeEntrySchema.index({ task: 1, startTime: -1 });

// Automatically populate references
timeEntrySchema.pre(/^find/, function(this: Query<any, any>, next) {
  this.populate({
    path: 'user',
    select: 'name email avatar'
  });
  next();
});

/**
 * Time Entry model
 */
const TimeEntryModel = mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema);

export default TimeEntryModel;