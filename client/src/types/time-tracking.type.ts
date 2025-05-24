// Client-side time tracking type definitions

import { IUser } from "./user.type";


export interface TimeEntry {
  _id: string;
  user: string | IUser;
  workspace: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
  duration: number;
  billable: boolean;
  tags: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type TimeEntryType = TimeEntry

export interface TimeEntryFiltersType {
  startDate?: string;
  endDate?: string;
  userId?: string;
  projectId?: string;
}

export interface CreateTimeEntryType {
  workspace: string;
  projectId?: string;
  taskId?: string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime?: string | Date;
  duration?: number;
  billable?: boolean;
  tags?: string[];
}

export interface TimeEntriesResponseType {
  timeEntries: TimeEntry[];
  totalTime: number;
  message: string;
}

export interface TimeEntryResponseType {
  timeEntry: TimeEntry;
  message: string;
}

export interface TimeReportResponseType {
  summary: {
    totalTime: number;
    billableTime: number;
    nonBillableTime: number;
    entriesByProject: Record<string, {
      totalTime: number;
      projectName: string;
      entries: TimeEntry[];
    }>;
    entriesByUser: Record<string, {
      totalTime: number;
      userName: string;
      entries: TimeEntry[];
    }>;
    entriesByDay: Record<string, {
      totalTime: number;
      entries: TimeEntry[];
    }>;
  };
  message: string;
}