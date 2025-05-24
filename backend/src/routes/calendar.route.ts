import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.middleware';
import { 
  getUserCalendarEventsController, 
  updateTaskCalendarDatesController 
} from '../controllers/calendar.controller';

const calendarRoutes = Router();

// All routes require authentication
calendarRoutes.use(isAuthenticated);

// Get calendar events for current user in a workspace
calendarRoutes.get('/workspace/:workspaceId/events', getUserCalendarEventsController);

// Update task dates from calendar
calendarRoutes.patch('/workspace/:workspaceId/task/dates', updateTaskCalendarDatesController);

export default calendarRoutes;