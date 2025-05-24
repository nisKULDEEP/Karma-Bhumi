import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';
import { z } from 'zod';
import {
  deleteTimeEntry,
  getProjectTimeSummary,
  getUserTimeEntries,
  startTimeTracking,
  stopTimeTracking,
  updateTimeEntry
} from '../services/time-tracking.service';
import { getMemberRoleInWorkspace } from '../services/member.service';
import { Permissions } from '../enums/role.enum';
import { roleGuard } from '../utils/roleGuard';

// Schema for starting time tracking
const startTimeTrackingSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string(),
  startTime: z.string().transform(val => new Date(val)).optional(),
  billable: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

// Schema for updating time entry
const updateTimeEntrySchema = z.object({
  description: z.string().optional(),
  startTime: z.string().transform(val => new Date(val)).optional(),
  endTime: z.string().transform(val => new Date(val)).optional(),
  duration: z.number().optional(), // in seconds
  billable: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

// Schema for date range
const dateRangeSchema = z.object({
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val))
});

/**
 * Start time tracking for a task or project
 */
export const startTimeTrackingController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = z.string().parse(req.params.workspaceId);
    const userId = req.user?._id;
    
    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.TRACK_TIME]);
    
    // Validate request data
    const data = startTimeTrackingSchema.parse(req.body);
    
    const { timeEntry } = await startTimeTracking(userId, workspaceId, data);
    
    return res.status(HTTPSTATUS.CREATED).json({
      message: 'Time tracking started successfully',
      timeEntry
    });
  }
);

/**
 * Stop active time tracking
 */
export const stopTimeTrackingController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = z.string().parse(req.params.workspaceId);
    const timeEntryId = req.params.timeEntryId;
    const userId = req.user?._id;
    
    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.TRACK_TIME]);
    
    const { timeEntry } = await stopTimeTracking(userId, workspaceId, timeEntryId);
    
    return res.status(HTTPSTATUS.OK).json({
      message: 'Time tracking stopped successfully',
      timeEntry
    });
  }
);

/**
 * Update a time entry
 */
export const updateTimeEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const timeEntryId = z.string().parse(req.params.timeEntryId);
    const userId = req.user?._id;
    
    // No need to check workspace permission since we're checking ownership of the time entry
    
    // Validate request data
    const updates = updateTimeEntrySchema.parse(req.body);
    
    const { timeEntry } = await updateTimeEntry(userId, timeEntryId, updates);
    
    return res.status(HTTPSTATUS.OK).json({
      message: 'Time entry updated successfully',
      timeEntry
    });
  }
);

/**
 * Delete a time entry
 */
export const deleteTimeEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const timeEntryId = z.string().parse(req.params.timeEntryId);
    const userId = req.user?._id;
    
    // No need to check workspace permission since we're checking ownership of the time entry
    
    await deleteTimeEntry(userId, timeEntryId);
    
    return res.status(HTTPSTATUS.OK).json({
      message: 'Time entry deleted successfully'
    });
  }
);

/**
 * Get time entries for current user
 */
export const getUserTimeEntriesController = asyncHandler(
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
    
    // Optional filters
    const projectId = req.query.projectId as string | undefined;
    const taskId = req.query.taskId as string | undefined;
    
    const result = await getUserTimeEntries(
      userId,
      workspaceId,
      startDate,
      endDate,
      projectId,
      taskId
    );
    
    return res.status(HTTPSTATUS.OK).json({
      message: 'Time entries fetched successfully',
      ...result
    });
  }
);

/**
 * Get time summary for a project
 */
export const getProjectTimeSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = z.string().parse(req.params.projectId);
    const workspaceId = req.query.workspaceId as string;
    const userId = req.user?._id;
    
    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_TIME_REPORTS]);
    
    // Optional date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (req.query.startDate && req.query.endDate) {
      const dateRange = dateRangeSchema.parse({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      });
      
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }
    
    const summary = await getProjectTimeSummary(projectId, startDate, endDate);
    
    return res.status(HTTPSTATUS.OK).json({
      message: 'Project time summary fetched successfully',
      summary
    });
  }
);