import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
  createSubtaskSchema,
  epicIdSchema,
  boardIdSchema,
} from "../validation/task.validation";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  addTaskCommentService,
  assignTaskService,
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  getTaskCommentsService,
  getTasksBoardService,
  updateTaskService,
  updateTaskStatusService,
  createSubtaskService,
  getTasksByBoardService,
  getTasksByEpicService,
  getSubtasksService,
  moveTaskToBoardService,
  moveTaskToEpicService,
} from "../services/task.service";
import { HTTPSTATUS } from "../config/http.config";
import { Types } from "mongoose";

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const teamId = req.params.teamId;
    const organizationId = req.params.organizationId;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    // Ensure customFields value is always present and required by type
    if (body.customFields) {
      body.customFields = body.customFields.map((field: any) => ({
        key: field.key,
        value: field.value !== undefined ? field.value : null,
      })) as { key: string; value: any }[];
    }

    const { task } = await createTaskService(
      workspaceId,
      projectId,
      userId,
      body as {
        title: string;
        description?: string;
        priority: string;
        status: string;
        assignedTo?: string[];
        startDate?: string;
        dueDate?: string;
        epic?: string;
        board: string;
        parent?: string;
        customFields?: { key: string; value: any }[];
      },
      teamId,
      organizationId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task created successfully",
      task,
    });
  }
);

// New controller to create subtasks
export const createSubtaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createSubtaskSchema.parse(req.body);
    const parentTaskId = taskIdSchema.parse(req.params.taskId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_SUBTASK]);

    // Ensure customFields value is always present and required by type
    if (body.customFields) {
      body.customFields = body.customFields.map((field: any) => ({
        key: field.key,
        value: field.value !== undefined ? field.value : null,
      })) as { key: string; value: any }[];
    }

    const { subtask } = await createSubtaskService(
      workspaceId,
      projectId,
      parentTaskId,
      userId,
      body as {
        title: string;
        description?: string;
        priority: string;
        status: string;
        assignedTo?: string[];
        startDate?: string;
        dueDate?: string;
        customFields?: { key: string; value: any }[];
        parent: string;
      }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Subtask created successfully",
      subtask,
    });
  }
);

// Get subtasks for a parent task
export const getSubtasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const parentTaskId = taskIdSchema.parse(req.params.taskId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { subtasks } = await getSubtasksService(
      workspaceId,
      projectId,
      parentTaskId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Subtasks fetched successfully",
      subtasks,
    });
  }
);

// Get tasks by board
export const getTasksByBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const boardId = boardIdSchema.parse(req.params.boardId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { tasks } = await getTasksByBoardService(
      workspaceId,
      projectId,
      boardId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Board tasks fetched successfully",
      tasks,
    });
  }
);

// Get tasks by epic
export const getTasksByEpicController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const epicId = epicIdSchema.parse(req.params.epicId) || "";
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { tasks } = await getTasksByEpicService(
      workspaceId,
      projectId,
      epicId as string // force as string
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Epic tasks fetched successfully",
      tasks,
    });
  }
);

// Move task to another board
export const moveTaskToBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const taskId = taskIdSchema.parse(req.params.taskId);
    const boardId = boardIdSchema.parse(req.params.boardId) || "";
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { task } = await moveTaskToBoardService(
      workspaceId,
      projectId,
      taskId,
      boardId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task moved to board successfully",
      task,
    });
  }
);

// Move task to epic
export const moveTaskToEpicController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const taskId = taskIdSchema.parse(req.params.taskId);
    const epicId = epicIdSchema.parse(req.params.epicId) || "";
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { task } = await moveTaskToEpicService(
      workspaceId,
      projectId,
      taskId,
      epicId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task moved to epic successfully",
      task,
    });
  }
);

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = updateTaskSchema.parse(req.body);

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    // Ensure required fields are present
    if (body.title === undefined) {
      throw new Error("Title is required for updating a task");
    }
    if (body.customFields) {
      body.customFields = body.customFields.map((field: any) => ({
        key: field.key,
        value: field.value !== undefined ? field.value : null,
      })) as { key: string; value: any }[];
    }

    const { updatedTask } = await updateTaskService(
      workspaceId,
      projectId,
      taskId,
      body as {
        title: string;
        description?: string;
        priority: string;
        status: string;
        assignedTo?: string[] | null;
        dueDate?: string;
        customFields?: { key: string; value: any }[];
      }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  }
);

export const getAllTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status
        ? (req.query.status as string)?.split(",")
        : undefined,
      priority: req.query.priority
        ? (req.query.priority as string)?.split(",")
        : undefined,
      assignedTo: req.query.assignedTo
        ? (req.query.assignedTo as string)?.split(",")
        : undefined,
      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate as string | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getAllTasksService(workspaceId, filters, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "All tasks fetched successfully",
      ...result,
    });
  }
);

export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const task = await getTaskByIdService(workspaceId, projectId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task fetched successfully",
      task,
    });
  }
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_TASK]);

    await deleteTaskService(workspaceId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task deleted successfully",
    });
  }
);


export const updateTaskStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { status } = req.body;
    
    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { updatedTask } = await updateTaskStatusService(
      workspaceId,
      projectId,
      taskId,
      status
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  }
);

export const getTasksBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { columns } = await getTasksBoardService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Tasks board fetched successfully",
      columns,
    });
  }
);

export const addTaskCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { content } = req.body;
    
    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.COMMENT_ON_TASK]);

    const { comment } = await addTaskCommentService(
      workspaceId,
      projectId,
      taskId,
      userId,
      content
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Comment added successfully",
      comment,
    });
  }
);

export const getTaskCommentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    
    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { comments } = await getTaskCommentsService(taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comments fetched successfully",
      comments,
    });
  }
);

// Modified to support multiple assignees
export const assignTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { assigneeIds } = req.body; // Now expects an array of assignee IDs
    
    const taskId = new Types.ObjectId(taskIdSchema.parse(req.params.id));
    const projectId = new Types.ObjectId(projectIdSchema.parse(req.params.projectId));
    const workspaceId = new Types.ObjectId(workspaceIdSchema.parse(req.params.workspaceId));

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId.toString());
    roleGuard(role, [Permissions.ASSIGN_TASK]);

    const { task } = await assignTaskService(
      workspaceId,
      projectId,
      taskId,
      assigneeIds,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task assigned successfully",
      task,
    });
  }
);