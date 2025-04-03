import axios from 'axios';
import { getApiBaseUrl } from './apiUtils';
import * as storage from '../utils/storage';

// Create axios instance with base URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  async (config) => {
    console.log(`API Request to: ${config.url}`);
    const token = await storage.getToken();
    
    if (token) {
      // Verify token has the expected JWT format (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn(`WARNING: Token doesn't have expected JWT format (has ${parts.length} parts instead of 3)`);
      }
      
      console.log(`Adding authorization header with token: ${token.substring(0, 20)}...`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found, request sent without authorization header');
    }
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// API service
export const apiService = {
  // Jobs
  getJobs: async (): Promise<Job[]> => {
    const response = await api.get('/jobs');
    return response.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: Partial<Job>): Promise<Job> => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  updateJob: async (id: string, data: Partial<Job>): Promise<Job> => {
    const response = await api.patch(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  // Payments
  getPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/payments');
    return response.data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  createPayment: async (data: Partial<Payment>): Promise<Payment> => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  // Drivers
  getDrivers: async (): Promise<Driver[]> => {
    const response = await api.get('/drivers');
    return response.data;
  },

  getDriverById: async (id: string): Promise<Driver> => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  updateDriver: async (id: string, data: Partial<Driver>): Promise<Driver> => {
    const response = await api.patch(`/drivers/${id}`, data);
    return response.data;
  }
};

export default apiService; 