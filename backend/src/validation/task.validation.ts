import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";

export const titleSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().trim().optional();

// Updated to support multiple assignees
export const assignedToSchema = z.array(z.string().trim().min(1)).optional();

export const prioritySchema = z.enum(
  Object.values(TaskPriorityEnum) as [string, ...string[]]
);

export const statusSchema = z.enum(
  Object.values(TaskStatusEnum) as [string, ...string[]]
);

export const dueDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      return !val || !isNaN(Date.parse(val));
    },
    {
      message: "Invalid date format. Please provide a valid date string.",
    }
  );

export const startDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      return !val || !isNaN(Date.parse(val));
    },
    {
      message: "Invalid date format. Please provide a valid date string.",
    }
  );

export const customFieldSchema = z.array(
  z.object({
    key: z.string().trim().min(1),
    value: z.any(),
  })
).optional();

export const taskIdSchema = z.string().trim().min(1);
export const epicIdSchema = z.string().trim().min(1).optional();
export const boardIdSchema = z.string().trim().min(1);
export const parentIdSchema = z.string().trim().min(1).optional();

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  startDate: startDateSchema,
  dueDate: dueDateSchema,
  epic: epicIdSchema,
  board: boardIdSchema,
  parent: parentIdSchema,
  customFields: customFieldSchema,
});

export const updateTaskSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema,
  priority: prioritySchema.optional(),
  status: statusSchema.optional(),
  assignedTo: assignedToSchema,
  startDate: startDateSchema,
  dueDate: dueDateSchema,
  epic: epicIdSchema,
  customFields: customFieldSchema,
});

export const createSubtaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  startDate: startDateSchema,
  dueDate: dueDateSchema,
  parent: z.string().trim().min(1),
  customFields: customFieldSchema,
});
