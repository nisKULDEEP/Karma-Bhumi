import mongoose, { Types } from 'mongoose';
import NotificationModel, { NotificationType } from '../models/notification.model';
import UserModel from '../models/user.model';
import TaskModel from '../models/task.model';
import { getSocketServer } from '../config/socket.config';
import { NotFoundException } from '../utils/appError';
import { ErrorCodeEnum } from '../enums/error-code.enum';


export const createNotification = async ({
  recipientId,
  senderId,
  type,
  taskId,
  projectId,
  workspaceId,
  content,
}: {
  recipientId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: NotificationType;
  taskId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  workspaceId: Types.ObjectId;
  content: string;
}) => {
  // Don't create notification if sender is recipient
  if (recipientId === senderId) {
    return null;
  }

  const notification = new NotificationModel({
    recipient: recipientId,
    sender: senderId,
    type,
    task: taskId,
    project: projectId,
    workspace: workspaceId,
    content,
  });

  await notification.save();

  // Populate sender info for real-time notification
  const populatedNotification = await NotificationModel.findById(notification._id)
    .populate('sender', 'name email avatar')
    .populate('task', 'title');

  // Emit real-time notification to the user
  const io = getSocketServer();
  io.to(`user:${recipientId}`).emit('notification', populatedNotification);

  return notification;
};

export const getUserNotificationsService = async (userId: string) => {
  const notifications = await NotificationModel.find({ recipient: userId })
    .populate('sender', 'name email avatar')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(30);  // Limit to most recent 30 notifications
  
  return { notifications };
};

export const markNotificationAsReadService = async (notificationId: string, userId: string) => {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );

  return { notification };
};

export const markAllNotificationsAsReadService = async (userId: string) => {
  await NotificationModel.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );

  return { success: true };
};

export const extractMentionsFromComment = (commentContent: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(commentContent)) !== null) {
    mentions.push(match[1]); // Push the username without the @ symbol
  }
  
  return mentions;
};

export const processCommentNotifications = async (
  commentContent: string,
  senderId: Types.ObjectId,
  taskId: Types.ObjectId,
  projectId: Types.ObjectId,
  workspaceId: string
) => {
  try {
    // Get task details to check assignee and creator
    const task = await TaskModel.findById(taskId);
    if (!task) return;

    const sender = await UserModel.findById(senderId);
    if (!sender) return;

    const notificationsToCreate = [];

    // 1. Notify task assignee if exists and not the commenter
    if (task.assignedTo && task.assignedTo.toString() !== senderId.toString()) {
      notificationsToCreate.push({
        recipientId: task.assignedTo,
        senderId,
        type: NotificationType.TASK_COMMENT,
        taskId,
        projectId,
        workspaceId,
        content: `${sender.name} commented on task "${task.title}" assigned to you`,
      });
    }

    // 2. Notify task creator if not the commenter
    if (task.createdBy.toString() !== senderId.toString()) {
      notificationsToCreate.push({
        recipientId: task.createdBy.toString(),
        senderId,
        type: NotificationType.TASK_COMMENT,
        taskId,
        projectId,
        workspaceId,
        content: `${sender.name} commented on task "${task.title}" you created`,
      });
    }

    // 3. Process @mentions
    const mentionedUsernames = extractMentionsFromComment(commentContent);
    
    if (mentionedUsernames.length > 0) {
      // Find users by their usernames
      const mentionedUsers = await UserModel.find({
        username: { $in: mentionedUsernames }
      });
      
      for (const user of mentionedUsers) {
        // Don't notify if it's the commenter
        const userId = (user._id as mongoose.Types.ObjectId).toString();
        if (userId !== senderId.toString()) {
          notificationsToCreate.push({
            recipientId: userId,
            senderId,
            type: NotificationType.MENTION,
            taskId,
            projectId,
            workspaceId,
            content: `${sender.name} mentioned you in a comment on task "${task.title}"`,
          });
        }
      }
    }

    // Create all notifications
    await Promise.all(notificationsToCreate.map((n:any) => createNotification(n)));
  } catch (error) {
    console.error('Error processing comment notifications:', error);
  }
};

