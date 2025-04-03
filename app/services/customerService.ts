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
api.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    return config;
  } catch (error) {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Handle unauthorized access
      await storage.removeToken();
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  pickupLocation: string;
  destinationLocation: string;
  truckType: string;
  price: number;
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
}

export interface CustomerStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export interface TruckType {
  id: string;
  name: string;
  capacity: string;
  basePrice: number;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const customerService = {
  // Get customer dashboard stats
  getStats: async (): Promise<CustomerStats> => {
    const response = await api.get('/customer/stats');
    return response.data;
  },

  // Get active orders
  getActiveOrders: async (): Promise<Order[]> => {
    const response = await api.get('/customer/orders/active');
    return response.data;
  },

  // Get order history
  getOrderHistory: async (page: number = 1, limit: number = 10): Promise<Order[]> => {
    const response = await api.get(`/customer/orders/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/customer/orders/${orderId}`);
    return response.data;
  },

  // Get available truck types
  getTruckTypes: async (): Promise<TruckType[]> => {
    const response = await api.get('/customer/truck-types');
    return response.data;
  },

  // Search locations
  searchLocations: async (query: string): Promise<Location[]> => {
    const response = await api.get(`/customer/locations/search?q=${query}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: {
    pickupLocation: string;
    destinationLocation: string;
    truckType: string;
    description?: string;
  }): Promise<Order> => {
    const response = await api.post('/customer/orders', orderData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<void> => {
    await api.post(`/customer/orders/${orderId}/cancel`);
  },

  // Rate order
  rateOrder: async (orderId: string, rating: number, comment?: string): Promise<void> => {
    await api.post(`/customer/orders/${orderId}/rate`, { rating, comment });
  },

  // Get saved locations
  getSavedLocations: async (): Promise<Location[]> => {
    const response = await api.get('/customer/locations/saved');
    return response.data;
  },

  // Save location
  saveLocation: async (location: Omit<Location, 'id'>): Promise<Location> => {
    const response = await api.post('/customer/locations/saved', location);
    return response.data;
  },

  // Delete saved location
  deleteSavedLocation: async (locationId: string): Promise<void> => {
    await api.delete(`/customer/locations/saved/${locationId}`);
  }
};

export default customerService; 