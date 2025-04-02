import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = '@auth_token';

// Token management
export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
    throw error;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
}

// Token validation
export const isTokenValid = async () => {
  try {
    const token = await getToken();
    if (!token) return false;
    
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// User role management
export const getUserRole = async () => {
  try {
    const token = await getToken();
    if (!token) return null;
    
    const decoded = jwtDecode<{ role: string }>(token);
    return decoded.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const isAdmin = async () => {
  const role = await getUserRole();
  return role === 'admin';
};

const auth = {
  setToken,
  getToken,
  removeToken,
  isTokenValid,
  getUserRole,
  isAdmin
};

export default auth; 