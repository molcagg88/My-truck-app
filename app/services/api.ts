import axios from 'axios';
import { API_URL } from '../config';
import storage from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
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
      await storage.removeToken();
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

export const orders = {
  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  update: async (id: string, orderData: any) => {
    const response = await api.patch(`/orders/${id}`, orderData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  getCustomerOrders: async () => {
    const response = await api.get('/orders/customer/orders');
    return response.data;
  },
  getDriverOrders: async () => {
    const response = await api.get('/orders/driver/orders');
    return response.data;
  },
  getAvailableOrders: async () => {
    const response = await api.get('/orders/available');
    return response.data;
  },
};

export const bids = {
  create: async (orderId: string, bidData: any) => {
    const response = await api.post(`/orders/${orderId}/bids`, bidData);
    return response.data;
  },
  accept: async (bidId: string) => {
    const response = await api.post(`/orders/bids/${bidId}/accept`);
    return response.data;
  },
  getByOrder: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/bids`);
    return response.data;
  },
};

export const payments = {
  create: async (orderId: string, paymentData: any) => {
    const response = await api.post(`/orders/${orderId}/payment`, paymentData);
    return response.data;
  },
  verify: async (orderId: string, paymentId: string) => {
    const response = await api.post(`/orders/${orderId}/payment/verify`, { paymentId });
    return response.data;
  },
};

export const users = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.patch('/users/profile', userData);
    return response.data;
  },
  updateLocation: async (locationData: any) => {
    const response = await api.post('/users/location', locationData);
    return response.data;
  },
};

export default api; 