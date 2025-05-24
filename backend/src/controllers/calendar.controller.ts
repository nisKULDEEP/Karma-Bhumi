import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';
import { z } from 'zod';
import { getUserCalendarEvents, updateTaskCalendarDates } from '../services/calendar.service';
import { getMemberRoleInWorkspace } from '../services/member.service';
import { Permissions } from '../enums/role.enum';
import { roleGuard } from '../utils/roleGuard';

// Schema for date range
const dateRangeSchema = z.object({
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val))
});

// Schema for task date updates
const taskDateUpdateSchema = z.object({
  taskId: z.string(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val))
});

/**
 * Get calendar events for the current user
 */
export const getUserCalendarEventsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = z.string().parse(req.params.workspaceId);
    const userId = req.user?._id;
    
    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);
    
    // Validate date range
    const { startDate, endDate } = dateRangeSchema.parse({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    });
    
    const { events } = await getUserCalendarEvents(userId, workspaceId, startDate, endDate);
    
    return res.status(HTTPSTATUS.OK).json({
      message: 'Calendar events fetched successfully',
      events
    });
  }
);

/**
 * Update a task's dates from the calendar
 */
export const updateTaskCalendarDatesController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = z.string().parse(req.params.workspaceId);
    const userId = req.user?._id;
    
    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);
    
    // Validate task update data
    const { taskId, startDate, endDate } = taskDateUpdateSchema.parse(req.body);
    
    const { task } = await updateTaskCalendarDates(taskId, startDate, endDate);
    
    return res.status(HTTPSTATUS.OK).json({
      message: 'Task dates updated successfully',
      task
    });
  }
);