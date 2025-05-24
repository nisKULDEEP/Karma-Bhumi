import { Router } from "express";
import {
  addTaskCommentController,
  assignTaskController,
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getTaskByIdController,
  getTaskCommentsController,
  getTasksBoardController,
  updateTaskController,
  updateTaskStatusController,
  createSubtaskController,
  getSubtasksController,
  getTasksByBoardController,
  getTasksByEpicController,
  moveTaskToBoardController,
  moveTaskToEpicController,
} from "../controllers/task.controller";

const taskRoutes = Router();

// Task Creation and Management
taskRoutes.post(
  "/project/:projectId/workspace/:workspaceId/organization/:organizationId/team/:teamId/create",
  createTaskController
);

taskRoutes.post(
  "/project/:projectId/workspace/:workspaceId/task/:taskId/subtask",
  createSubtaskController
);

taskRoutes.get(
  "/project/:projectId/workspace/:workspaceId/task/:taskId/subtasks",
  getSubtasksController
);

// Task Updates and Deletion
taskRoutes.delete("/:id/workspace/:workspaceId/delete", deleteTaskController);

taskRoutes.put(
  "/:id/project/:projectId/workspace/:workspaceId/update",
  updateTaskController
);

taskRoutes.patch(
  "/:id/workspace/:workspaceId/project/:projectId/status",
  updateTaskStatusController
);

// Task Assignment
taskRoutes.patch(
  "/:id/workspace/:workspaceId/project/:projectId/assign",
  assignTaskController
);

// Task Viewing and Filtering
taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);

taskRoutes.get(
  "/:id/project/:projectId/workspace/:workspaceId",
  getTaskByIdController
);

// Board and Epic Management
taskRoutes.get(
  "/workspace/:workspaceId/project/:projectId/board",
  getTasksBoardController
);

taskRoutes.get(
  "/workspace/:workspaceId/project/:projectId/board/:boardId/tasks",
  getTasksByBoardController
);

taskRoutes.get(
  "/workspace/:workspaceId/project/:projectId/epic/:epicId/tasks",
  getTasksByEpicController
);

taskRoutes.patch(
  "/workspace/:workspaceId/project/:projectId/task/:taskId/board/:boardId/move",
  moveTaskToBoardController
);

taskRoutes.patch(
  "/workspace/:workspaceId/project/:projectId/task/:taskId/epic/:epicId/move",
  moveTaskToEpicController
);

// Comments
taskRoutes.post(
  "/:id/workspace/:workspaceId/project/:projectId/comments",
  addTaskCommentController
);

taskRoutes.get(
  "/:id/workspace/:workspaceId/project/:projectId/comments",
  getTaskCommentsController
);

export default taskRoutes;
