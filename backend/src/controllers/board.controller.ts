import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createBoardSchema,
  boardIdSchema,
  updateBoardSchema,
  moveTaskSchema,
  reorderTasksSchema,
} from "../validation/board.validation";
import {
  createBoardService,
  getBoardsService,
  getBoardByIdService,
  updateBoardService,
  deleteBoardService,
  getBoardKanbanViewService,
  getBoardListViewService,
  getBoardGanttViewService,
  moveTaskBetweenColumnsService,
  reorderTasksService,
} from "../services/board.service";
import { HTTPSTATUS } from "../config/http.config";
import { BoardType } from "../models/board.model";

// Create a new board
export const createBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const teamId = req.params.teamId;
    const organizationId = req.params.organizationId;
    
    const boardData = createBoardSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_BOARD]);

    const { board } = await createBoardService(
      workspaceId,
      projectId,
      teamId,
      organizationId,
      userId,
      boardData
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Board created successfully",
      board,
    });
  }
);

// Get all boards for a project
export const getBoardsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { boards } = await getBoardsService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Boards fetched successfully",
      boards,
    });
  }
);

// Get a board by ID
export const getBoardByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const boardId = boardIdSchema.parse(req.params.boardId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { board } = await getBoardByIdService(workspaceId, projectId, boardId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Board fetched successfully",
      board,
    });
  }
);

// Update a board
export const updateBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const boardId = boardIdSchema.parse(req.params.boardId);
    
    const updateData = updateBoardSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_BOARD]);

    const { board } = await updateBoardService(
      workspaceId, 
      projectId, 
      boardId, 
      updateData
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Board updated successfully",
      board,
    });
  }
);

// Delete a board
export const deleteBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const boardId = boardIdSchema.parse(req.params.boardId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_BOARD]);

    await deleteBoardService(workspaceId, projectId, boardId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Board deleted successfully",
    });
  }
);

// Get Kanban view for a board
export const getBoardKanbanViewController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const boardId = boardIdSchema.parse(req.params.boardId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { boardView } = await getBoardKanbanViewService(
      workspaceId,
      projectId,
      boardId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Kanban board view fetched successfully",
      boardView,
    });
  }
);

// Get List view for a board
export const getBoardListViewController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const boardId = boardIdSchema.parse(req.params.boardId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { boardView } = await getBoardListViewService(
      workspaceId,
      projectId,
      boardId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "List board view fetched successfully",
      boardView,
    });
  }
);

// Get Gantt view for a board
export const getBoardGanttViewController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const boardId = boardIdSchema.parse(req.params.boardId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { boardView } = await getBoardGanttViewService(
      workspaceId,
      projectId,
      boardId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Gantt board view fetched successfully",
      boardView,
    });
  }
);

// Move a task between columns (change status)
export const moveTaskBetweenColumnsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    
    const moveData = moveTaskSchema.parse(req.body);
    const { taskId, source, destination, newIndex } = moveData;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { task } = await moveTaskBetweenColumnsService(
      workspaceId,
      projectId,
      taskId,
      source.droppableId,
      destination.droppableId,
      newIndex
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task moved successfully",
      task,
    });
  }
);

// Reorder tasks within a column
export const reorderTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    
    const reorderData = reorderTasksSchema.parse(req.body);
    const { columnId, taskIds } = reorderData;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const result = await reorderTasksService(
      workspaceId,
      projectId,
      columnId,
      taskIds
    );

    return res.status(HTTPSTATUS.OK).json(result);
  }
);