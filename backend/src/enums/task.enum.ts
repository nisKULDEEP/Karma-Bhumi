export const TaskStatusEnum = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  READY: "READY",
  DONE: "DONE",
  BLOCKED: "BLOCKED",
  CANCELLED: "CANCELLED",
  DEFERRED: "DEFERRED",
} as const;

export const TaskPriorityEnum = {
  LOWEST: "LOWEST",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  HIGHEST: "HIGHEST",
  URGENT: "URGENT",
} as const;

export type TaskStatusEnumType = keyof typeof TaskStatusEnum;
export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;
