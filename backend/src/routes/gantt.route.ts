import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.middleware';
import { 
  createTaskDependencyController, 
  getProjectGanttDataController, 
  removeTaskDependencyController, 
  updateTaskDatesController 
} from '../controllers/gantt.controller';

const ganttRoutes = Router();

// All routes require authentication
ganttRoutes.use(isAuthenticated);

// Get Gantt data for a project
ganttRoutes.get('/project/:projectId', getProjectGanttDataController);

// Update task dates
ganttRoutes.patch('/task/dates', updateTaskDatesController);

// Task dependencies
ganttRoutes.post('/task/dependency', createTaskDependencyController);
ganttRoutes.delete('/task/dependency', removeTaskDependencyController);

export default ganttRoutes;