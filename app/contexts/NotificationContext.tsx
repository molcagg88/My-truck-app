import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import storage from '../utils/storage';

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
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  registerForPushNotifications: () => Promise<string | null>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (user) {
      loadNotifications();
      configureNotifications();
    }
  }, [user]);

  const configureNotifications = () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  const loadNotifications = async () => {
    try {
      const storedNotifications = await storage.getNotifications();
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const registerForPushNotifications = async (): Promise<string | null> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'Push notifications are required for this app.');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
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

      setNotifications(prev => [...prev, newNotification]);
      await storage.setNotifications([...notifications, newNotification]);
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
      await storage.setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      setNotifications(updatedNotifications);
      await storage.setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const clearNotifications = async (): Promise<void> => {
    try {
      setNotifications([]);
      await storage.setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    registerForPushNotifications,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 