import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role.enum";
import { HTTPSTATUS } from "../config/http.config";
import { z } from "zod";
import {
  addTasksToSprintService,
  completeSprintService,
  createSprintService,
  deleteSprintService,
  getActiveSprintService,
  getSprintByIdService,
  getSprintsService,
  removeTaskFromSprintService,
  startSprintService,
  updateSprintService,
} from "../services/sprint.service";

// Validation schemas
const createSprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  goal: z.string().optional(),
});

const updateSprintSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  goal: z.string().optional(),
});

const sprintIdSchema = z.string().min(1, "Sprint ID is required");

const addTasksToSprintSchema = z.object({
  taskIds: z.array(z.string()).min(1, "At least one task ID is required"),
});

// Controllers
export const createSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const body = createSprintSchema.parse(req.body);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]); // Using same permission as task creation

    // Ensure dates are converted to Date objects
    const sprintData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };

    const { sprint } = await createSprintService(
      userId,
      workspaceId,
      projectId,
      sprintData // Pass the converted data
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Sprint created successfully",
      sprint,
    });
  }
);

export const getSprintsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { sprints } = await getSprintsService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprints retrieved successfully",
      sprints,
    });
  }
);

export const getSprintByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { sprint, tasks } = await getSprintByIdService(
      workspaceId,
      projectId,
      sprintId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprint retrieved successfully",
      sprint,
      tasks,
    });
  }
);

export const updateSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const body = updateSprintSchema.parse(req.body);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]); // Using same permission as task editing

    // Convert dates only if they exist
    const updateData = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const { sprint } = await updateSprintService(
      workspaceId,
      projectId,
      sprintId,
      updateData // Pass the potentially converted data
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprint updated successfully",
      sprint,
    });
  }
);

export const startSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_PROJECT]);

    const { sprint } = await startSprintService(
      workspaceId,
      projectId,
      sprintId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprint started successfully",
      sprint,
    });
  }
);

export const completeSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_PROJECT]);

    const result = await completeSprintService(
      workspaceId,
      projectId,
      sprintId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const deleteSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_TASK]); // Using same permission as task deletion

    const result = await deleteSprintService(
      workspaceId,
      projectId,
      sprintId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const addTasksToSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const { taskIds } = addTasksToSprintSchema.parse(req.body);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const result = await addTasksToSprintService(
      workspaceId,
      projectId,
      sprintId,
      taskIds
    );

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const removeTaskFromSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const taskId = z.string().parse(req.params.taskId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const result = await removeTaskFromSprintService(
      workspaceId,
      projectId,
      sprintId,
      taskId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const getActiveSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { activeSprint, tasks } = await getActiveSprintService(
      workspaceId,
      projectId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: activeSprint 
        ? "Active sprint retrieved successfully" 
        : "No active sprint found",
      activeSprint,
      tasks,
    });
  }
);