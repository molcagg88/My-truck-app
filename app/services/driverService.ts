import axios from 'axios';
import { getApiBaseUrl, handleApiError } from './apiUtils';
import storage from '../utils/storage';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config: any) => {
  try {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    console.error('Response interceptor error:', error);
    return Promise.reject(error);
  }
);

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'payment_pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  pickupLocation: string;
  destinationLocation: string;
  truckType: string;
  price: number;
  description?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  bids?: Bid[];
}

export interface Bid {
  id: string;
  orderId: string;
  driverId: string;
  originalPrice: number;
  proposedPrice: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  comment?: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
}

const driverService = {
  // Get driver dashboard stats
  getStats: async () => {
    try {
      const response = await api.get('/driver/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch driver stats');
    }
  },

  // Get available orders
  getAvailableOrders: async () => {
    try {
      const response = await api.get('/orders/available');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch available orders');
    }
  },

  // Get active jobs
  getActiveJobs: async () => {
    try {
      const response = await api.get('/driver/jobs/active');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch active jobs');
    }
  },

  // Get job history
  getJobHistory: async (page: number = 1, limit: number = 10) => {
    try {
      const response = await api.get(`/driver/jobs/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch job history');
    }
  },

  // Get job details
  getJobDetails: async (jobId: string) => {
    try {
      const response = await api.get(`/driver/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch job details');
    }
  },

  // Update job status
  updateJobStatus: async (jobId: string, status: string) => {
    try {
      const response = await api.patch(`/driver/jobs/${jobId}/status`, { status });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to update job status');
    }
  },

  // Update location
  updateLocation: async (latitude: number, longitude: number) => {
    try {
      const response = await api.post('/driver/location', { latitude, longitude });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to update location');
    }
  },

  // Place a bid on an order
  placeBid: async (orderId: string, bidData: {
    proposedPrice: number;
    comment?: string;
  }) => {
    try {
      const response = await api.post(`/orders/${orderId}/bids`, bidData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to place bid');
    }
  },

  // Accept a job
  acceptJob: async (jobId: string) => {
    try {
      const response = await api.post(`/driver/jobs/${jobId}/accept`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to accept job');
    }
  },

  // Reject a job
  rejectJob: async (jobId: string) => {
    try {
      const response = await api.post(`/driver/jobs/${jobId}/reject`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to reject job');
    }
  },

  // Complete a job
  completeJob: async (jobId: string) => {
    try {
      const response = await api.post(`/driver/jobs/${jobId}/complete`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to complete job');
    }
  },

  // Get earnings
  getEarnings: async (startDate?: string, endDate?: string) => {
    try {
      const response = await api.get('/driver/earnings', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch earnings');
    }
  }
};

export default driverService; 