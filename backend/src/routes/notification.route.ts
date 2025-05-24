import { Router } from "express";
import {
  getUserNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from '../controllers/notification.controller';

const notificationRoutes = Router();

// Apply authentication middleware to all notification routes
// notificationRoutes.use(authenticate);

// Get user's notifications
notificationRoutes.get('/', getUserNotificationsController);

// Mark a notification as read
notificationRoutes.patch('/:id/read', markNotificationAsReadController);

// Mark all notifications as read
notificationRoutes.patch('/read-all', markAllNotificationsAsReadController);

export default notificationRoutes;