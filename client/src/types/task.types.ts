export enum TaskStatusEnum {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  READY = "READY",
  DONE = "DONE",
  BLOCKED = "BLOCKED",
  CANCELLED = "CANCELLED",
  DEFERRED = "DEFERRED",
}

export enum TaskPriorityEnum {
  LOWEST = "LOWEST",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  HIGHEST = "HIGHEST",
  URGENT = "URGENT",
}

// Add the type definitions directly in this file instead of importing from constants
export type TaskStatusEnumType = keyof typeof TaskStatusEnum;
export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;

export enum BoardType {
  KANBAN = "kanban",
  LIST = "list",
  GANTT = "gantt",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface CustomField {
  key: string;
  value: string | number | boolean | Date;
}

export interface Epic {
  _id: string;
  name: string;
  description?: string;
  project: string;
  board: string;
  workspace: string;
  team: string;
  organization: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  type: BoardType;
  project: string;
  workspace: string;
  team: string;
  organization: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: Date;
}

export interface Attachment {
  _id: string;
  filename: string;
  url: string;
  uploadedBy: User;
  uploadedAt: Date;
}

export interface Task {
  _id: string;
  taskCode: string;
  title: string;
  description?: string;
  project: string;
  workspace: string;
  organization: string;
  team: string;
  board: string | Board;
  epic?: string | Epic;
  status: keyof typeof TaskStatusEnum;
  priority: keyof typeof TaskPriorityEnum;
  assignedTo: User[];
  comments: Comment[];
  attachments: Attachment[];
  createdBy: User;
  startDate?: Date;
  dueDate?: Date;
  sprint?: string;
  parent?: string;
  isSubtask: boolean;
  customFields: CustomField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  _id: string;
  name: string;
  project: string;
  workspace: string;
  team: string;
  organization: string;
  board: string;
  startDate: Date;
  endDate: Date;
  goal?: string;
  isActive: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  emoji: string;
  workspace: string;
  team: string;
  organization: string;
  status: 'active' | 'completed' | 'archived';
}

export interface TasksBoard {
  columns: {
    backlog: Task[];
    todo: Task[];
    in_progress: Task[];
    review: Task[];
    done: Task[];
    blocked?: Task[];
    deferred?: Task[];
    cancelled?: Task[];
  };
}

export interface TaskComment {
  content: string;
  author: string; // This is the user ID
  createdAt?: Date;
}

export interface TaskAttachment {
  filename: string;
  url: string;
  uploadedBy?: string; // This is the user ID
  uploadedAt?: Date;
}

export interface TaskCustomField {
  key: string;
  value: string | number | boolean | Date | object | null;
}

export interface ITask {
  _id?: string;
  taskCode?: string;
  title: string;
  description: string | null;
  project: string;
  workspace: string;
  organization?: string;
  team?: string;
  board?: string;
  epic?: string | null;
  status: TaskStatusEnumType;
  priority: TaskPriorityEnumType;
  assignedTo: string | string[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  createdBy?: string;
  startDate?: Date | null;
  dueDate: Date | null;
  sprint?: string | null;
  parent?: string | null;
  isSubtask?: boolean;
  dependsOn?: string[] | [];
  customFields?: TaskCustomField[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateTaskPayload {
  workspaceId: string;
  projectId: string;
  data: {
    title: string;
    description: string;
    status: TaskStatusEnumType;
    priority: TaskPriorityEnumType;
    assignedTo: string;
    dueDate: string;
  };
}

export interface ICreateTaskFormValues {
  title: string;
  description: string;
  projectId: string;
  status: TaskStatusEnumType;
  priority: TaskPriorityEnumType;
  assignedTo: string;
  dueDate: Date;
}