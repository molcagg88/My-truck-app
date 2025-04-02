import axios from 'axios';
import { getToken } from '../../app/utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // You might want to redirect to login or refresh token here
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Admin stats
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Recent activity
  getRecentActivity: async (limit: number = 10) => {
    const response = await api.get(`/admin/activity?limit=${limit}`);
    return response.data;
  },

  // Jobs
  getJobs: async () => {
    const response = await api.get('/admin/jobs');
    return response.data;
  },

  // Payments
  getPayments: async () => {
    const response = await api.get('/admin/payments');
    return response.data;
  },

  // Drivers
  getDrivers: async () => {
    const response = await api.get('/admin/drivers');
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  }
};

export default apiService; 