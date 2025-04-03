import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'adminToken';

const storage = {
  getToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      console.log("getToken called, token:", token ? `${token.substring(0, 20)}...` : "null");
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  setToken: async (token: string): Promise<void> => {
    try {
      console.log("setToken called, token:", token ? `${token.substring(0, 20)}...` : "null");
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log("Token saved successfully");
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  },

  removeToken: async (): Promise<void> => {
    try {
      console.log("removeToken called");
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log("Token removed successfully");
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }
};

export default storage;
export const { getToken, setToken, removeToken } = storage; 