import { z } from "zod";
import { BoardType } from "../models/board.model";

export const boardIdSchema = z.string().min(1);

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum([BoardType.KANBAN, BoardType.LIST, BoardType.GANTT]),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  type: z.enum([BoardType.KANBAN, BoardType.LIST, BoardType.GANTT]).optional(),
});

export const moveTaskSchema = z.object({
  taskId: z.string(),
  source: z.object({
    droppableId: z.string(),
    index: z.number(),
  }),
  destination: z.object({
    droppableId: z.string(),
    index: z.number(),
  }),
  newIndex: z.number(),
});

export const reorderTasksSchema = z.object({
  columnId: z.string(),
  taskIds: z.array(z.string()),
});