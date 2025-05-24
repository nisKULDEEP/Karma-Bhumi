import { Router } from "express";
import {
  addTasksToSprintController,
  completeSprintController,
  createSprintController,
  deleteSprintController,
  getActiveSprintController,
  getSprintByIdController,
  getSprintsController,
  removeTaskFromSprintController,
  startSprintController,
  updateSprintController,
} from "../controllers/sprint.controller";

const sprintRoutes = Router();

// Create a new sprint
sprintRoutes.post(
  "/workspace/:workspaceId/project/:projectId/create",
  createSprintController
);

// Get all sprints for a project
sprintRoutes.get(
  "/workspace/:workspaceId/project/:projectId/all",
  getSprintsController
);

// Get active sprint for a project
sprintRoutes.get(
  "/workspace/:workspaceId/project/:projectId/active",
  getActiveSprintController
);

// Get sprint by ID
sprintRoutes.get(
  "/workspace/:workspaceId/project/:projectId/:sprintId",
  getSprintByIdController
);

// Update sprint
sprintRoutes.put(
  "/workspace/:workspaceId/project/:projectId/:sprintId/update",
  updateSprintController
);

// Start sprint
sprintRoutes.patch(
  "/workspace/:workspaceId/project/:projectId/:sprintId/start",
  startSprintController
);

// Complete sprint
sprintRoutes.patch(
  "/workspace/:workspaceId/project/:projectId/:sprintId/complete",
  completeSprintController
);

// Delete sprint
sprintRoutes.delete(
  "/workspace/:workspaceId/project/:projectId/:sprintId/delete",
  deleteSprintController
);

// Add tasks to sprint
sprintRoutes.post(
  "/workspace/:workspaceId/project/:projectId/:sprintId/tasks/add",
  addTasksToSprintController
);

// Remove task from sprint
sprintRoutes.delete(
  "/workspace/:workspaceId/project/:projectId/:sprintId/tasks/:taskId/remove",
  removeTaskFromSprintController
);

export default sprintRoutes;