import axios from 'axios';
import { getApiBaseUrl } from './apiUtils';
import storage from '../utils/storage';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await storage.removeToken();
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProfileUpdateResponse {
  message: string;
  token: string;
  user: User;
}

// Auth service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await storage.removeToken();
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      console.log("getCurrentUser called");
      const token = await storage.getToken();
      console.log("Token in getCurrentUser:", token ? `${token.substring(0, 20)}...` : "No token");
      
      if (!token) {
        console.log("No token found, returning null");
        return null;
      }
      
      const response = await api.get('/auth/me');
      console.log("getCurrentUser response:", response.data ? "Success" : "No data");
      return response.data.user;
    } catch (error) {
      console.error("getCurrentUser error:", error);
      return null;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<ProfileUpdateResponse> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  resendVerificationEmail: async (): Promise<void> => {
    await api.post('/auth/resend-verification');
  }
};

export default authService; 