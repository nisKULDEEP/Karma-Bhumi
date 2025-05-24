import { useCallback, useEffect, useState } from 'react';
import { INotification } from '../types/notification.type';

// Mock API functions - replace with actual API calls
const fetchNotifications = async (): Promise<INotification[]> => {
  try {
    const response = await fetch('/api/notification');
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const data = await response.json();
    return data.notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/notification/${notificationId}/read`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/notification/read-all', {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from the server
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const notifs = await fetchNotifications();
      setNotifications(notifs);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    }
    
    return success;
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const success = await markAllNotificationsAsRead();
    
    if (success) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
    
    return success;
  }, []);

  // Get unread notifications count
  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Initial load of notifications
  useEffect(() => {
    loadNotifications();
    
    // Setup polling for new notifications every minute
    const intervalId = setInterval(loadNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications,
  };
};