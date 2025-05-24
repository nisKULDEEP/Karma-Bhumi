import { IUser } from "./user.type";

// Task-related type definitions
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'READY';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ITask {
  _id: string;
  taskCode: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string;
  workspace: string;
  assignedTo: IUser[]; // Updated to be an array of users
  createdBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  startDate?: Date;
  dueDate?: Date;
  sprint?: string;
  comments?: IComment[];
  attachments?: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id?: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: Date;
}

export interface IAttachment {
  _id?: string;
  filename: string;
  url: string;
  uploadedBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  uploadedAt: Date;
}

export interface IColumn {
  id: TaskStatus;
  title: string;
  tasks: ITask[];
}

export interface IBoard {
  columns: IColumn[];
}

export interface CustomStatus {
  id: string;
  name: string;
  color: string;
  projectId: string;
  workspaceId: string;
}

export interface ISprint {
  _id: string;
  name: string;
  project: string;
  workspace: string;
  startDate: Date;
  endDate: Date;
  goal?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}