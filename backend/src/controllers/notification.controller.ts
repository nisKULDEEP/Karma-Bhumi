import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';
import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
} from '../services/notification.service';
import { z } from 'zod';

export const getUserNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { notifications } = await getUserNotificationsService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'User notifications fetched successfully',
      notifications,
    });
  }
);

export const markNotificationAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const notificationId = z.string().parse(req.params.id);

    const { notification } = await markNotificationAsReadService(notificationId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Notification marked as read',
      notification,
    });
  }
);

export const markAllNotificationsAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { success } = await markAllNotificationsAsReadService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'All notifications marked as read',
      success,
    });
  }
);