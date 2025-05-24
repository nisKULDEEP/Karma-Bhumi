import { Types } from 'mongoose';

export interface TimeEntry {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  workspace: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  billable: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntryDocument extends TimeEntry, Document {}

export interface StartTimeTrackingParams {
  taskId?: string;
  projectId?: string;
  description: string;
  startTime?: Date;
  billable?: boolean;
  tags?: string[];
}

export interface UpdateTimeEntryParams {
  description?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  billable?: boolean;
  tags?: string[];
}

export interface TimeEntrySummary {
  timeEntries: TimeEntry[];
  totalTime: number;
  entriesByDay: Record<string, TimeEntry[]>;
}

export interface ProjectTimeSummary {
  totalTime: number;
  billableTime: number;
  nonBillableTime: number;
  entriesByUser: Record<string, {
    totalTime: number;
    username: string;
    entries: TimeEntry[];
  }>;
}