import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.middleware';
import {
  deleteTimeEntryController,
  getProjectTimeSummaryController,
  getUserTimeEntriesController,
  startTimeTrackingController,
  stopTimeTrackingController,
  updateTimeEntryController
} from '../controllers/time-tracking.controller';

const timeTrackingRoutes = Router();

// All routes require authentication
timeTrackingRoutes.use(isAuthenticated);

// User time entries
timeTrackingRoutes.get('/workspace/:workspaceId/entries', getUserTimeEntriesController);

// Start time tracking
timeTrackingRoutes.post('/workspace/:workspaceId/start', startTimeTrackingController);

// Stop time tracking
timeTrackingRoutes.patch('/workspace/:workspaceId/stop', stopTimeTrackingController);
timeTrackingRoutes.patch('/workspace/:workspaceId/stop/:timeEntryId', stopTimeTrackingController);

// Update time entry
timeTrackingRoutes.patch('/entry/:timeEntryId', updateTimeEntryController);

// Delete time entry
timeTrackingRoutes.delete('/entry/:timeEntryId', deleteTimeEntryController);

// Project time summary
timeTrackingRoutes.get('/project/:projectId/summary', getProjectTimeSummaryController);

export default timeTrackingRoutes;