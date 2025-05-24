// Notification type definitions
export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  relatedTo?: {
    taskId?: string;
    projectId?: string;
    workspaceId?: string;
    commentId?: string;
    userId?: string;
  };
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  WORKSPACE_INVITATION = 'WORKSPACE_INVITATION',
  PROJECT_CREATED = 'PROJECT_CREATED',
  DUE_DATE_REMINDER = 'DUE_DATE_REMINDER',
  TASK_MENTION = 'TASK_MENTION',
  USER_MENTION = 'USER_MENTION',
}