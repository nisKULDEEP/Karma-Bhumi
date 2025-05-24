import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';
import { z } from 'zod';
import { createTaskDependency, getProjectGanttData, removeTaskDependency, updateTaskGanttDates } from '../services/gantt.service';
import { getMemberRoleInWorkspace } from '../services/member.service';
import { Permissions } from '../enums/role.enum';
import { roleGuard } from '../utils/roleGuard';

// Schema for task date updates
const taskDateUpdateSchema = z.object({
  taskId: z.string(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val))
});

// Schema for task dependency links
const taskDependencySchema = z.object({
  sourceTaskId: z.string(),
  targetTaskId: z.string()
});

/**
 * Get Gantt chart data for a project
 */
export const getProjectGanttDataController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = z.string().parse(req.params.projectId);
    const userId = req.user?._id;
    const workspaceId = req.query.workspaceId as string;

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const ganttData = await getProjectGanttData(projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Project Gantt data fetched successfully',
      ganttData
    });
  }
);

/**
 * Update a task's dates in the Gantt chart
 */
export const updateTaskDatesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { taskId, startDate, endDate } = taskDateUpdateSchema.parse(req.body);
    const userId = req.user?._id;
    const workspaceId = req.query.workspaceId as string;

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { task } = await updateTaskGanttDates(taskId, startDate, endDate);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Task dates updated successfully',
      task
    });
  }
);

/**
 * Create a dependency link between tasks
 */
export const createTaskDependencyController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sourceTaskId, targetTaskId } = taskDependencySchema.parse(req.body);
    const userId = req.user?._id;
    const workspaceId = req.query.workspaceId as string;

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const result = await createTaskDependency(sourceTaskId, targetTaskId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Task dependency created successfully',
      link: result.link
    });
  }
);

/**
 * Remove a dependency link between tasks
 */
export const removeTaskDependencyController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sourceTaskId, targetTaskId } = taskDependencySchema.parse(req.body);
    const userId = req.user?._id;
    const workspaceId = req.query.workspaceId as string;

    // Check user's permission in the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    await removeTaskDependency(sourceTaskId, targetTaskId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Task dependency removed successfully'
    });
  }
);