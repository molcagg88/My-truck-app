import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  LANGUAGE_PREFERENCE: '@language_preference',
  ACTIVE_ORDERS: '@active_orders',
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

  // User data management (only basic session info)
  async setUserData(userData: any): Promise<void> {
    try {
      // Only store minimal user data needed for session management
      const minimalUserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(minimalUserData));
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

  // Language preference
  async setLanguagePreference(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, language);
    } catch (error) {
      console.error('Error saving language preference:', error);
      throw error;
    }
  }

  async getLanguagePreference(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
    } catch (error) {
      console.error('Error getting language preference:', error);
      return null;
    }
  }

  // Active orders management
  async getActiveOrdersCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ORDERS);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting active orders count:', error);
      return 0;
    }
  }

  async setActiveOrdersCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ORDERS, count.toString());
    } catch (error) {
      console.error('Error saving active orders count:', error);
      throw error;
    }
  }

  async incrementActiveOrdersCount(): Promise<number> {
    try {
      const currentCount = await this.getActiveOrdersCount();
      const newCount = currentCount + 1;
      await this.setActiveOrdersCount(newCount);
      return newCount;
    } catch (error) {
      console.error('Error incrementing active orders count:', error);
      throw error;
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