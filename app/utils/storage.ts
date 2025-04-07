import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  ACTIVE_ORDERS: '@active_orders',
  COMPLETED_ORDERS: '@completed_orders',
  NOTIFICATIONS: '@notifications',
} as const;

class Storage {
  // Token management
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  // User data management
  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  }

  // Orders management
  async setActiveOrders(orders: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving active orders:', error);
      throw error;
    }
  }

  async getActiveOrders(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting active orders:', error);
      return [];
    }
  }

  async setCompletedOrders(orders: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving completed orders:', error);
      throw error;
    }
  }

  async getCompletedOrders(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting completed orders:', error);
      return [];
    }
  }

  // Notifications management
  async setNotifications(notifications: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
      throw error;
    }
  }

  async getNotifications(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Clear all storage
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

const storage = new Storage();
export default storage; 