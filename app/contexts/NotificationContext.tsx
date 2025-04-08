import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import storage from '../utils/storage';
import { getApiBaseUrl } from '../services/apiUtils';
import axios from 'axios';

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  date: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Create API instance for notifications
  const notificationApi = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to add auth token
  notificationApi.interceptors.request.use(async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch notifications from the server
      const response = await notificationApi.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any): Promise<void> => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Send immediately
      });

      const newNotification: Notification = {
        id: notificationId,
        title,
        body,
        data,
        date: new Date().toISOString(),
        read: false,
      };

      // Update local state
      setNotifications(prev => [...prev, newNotification]);
      
      // Send to server
      await notificationApi.post('/notifications', newNotification);
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      // Update local state
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
      
      // Update on server
      await notificationApi.patch(`/notifications/${notificationId}`, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      // Update local state
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      setNotifications(updatedNotifications);
      
      // Update on server
      await notificationApi.patch('/notifications/mark-all-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const clearNotifications = async (): Promise<void> => {
    try {
      // Update local state
      setNotifications([]);
      
      // Update on server
      await notificationApi.delete('/notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  };

  const value = {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}; 