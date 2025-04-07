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
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    profileImage?: string;
    licensePlate?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
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

export interface TruckType {
  id: string;
  name: string;
  description: string;
  capacity: string;
  pricePerKm: number;
  image?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface CustomerStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
}

const customerService = {
  // Get customer dashboard stats
  getStats: async (): Promise<CustomerStats> => {
    try {
      const response = await api.get('/customer/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch customer stats');
    }
  },

  // Get active orders
  getActiveOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/customer/orders/active');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch active orders');
    }
  },

  // Get order history
  getOrderHistory: async (page: number = 1, limit: number = 10): Promise<Order[]> => {
    try {
      const response = await api.get(`/customer/orders/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch order history');
    }
  },

  // Get order details
  getOrderDetails: async (orderId: string): Promise<Order> => {
    try {
      const response = await api.get(`/customer/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch order details');
    }
  },

  // Get available truck types
  getTruckTypes: async (): Promise<TruckType[]> => {
    try {
      const response = await api.get('/customer/truck-types');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch truck types');
    }
  },

  // Search locations
  searchLocations: async (query: string): Promise<Location[]> => {
    try {
      const response = await api.get(`/customer/locations/search?q=${query}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to search locations');
    }
  },

  // Create new order
  createOrder: async (orderData: {
    pickupLocation: string;
    destinationLocation: string;
    truckType: string;
    description?: string;
    price: number;
  }): Promise<Order> => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create order');
    }
  },

  // Get order by ID
  getOrder: async (orderId: string): Promise<Order> => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch order');
    }
  },

  // Get customer's orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/orders/customer/orders');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch orders');
    }
  },

  // Get available orders for drivers
  getAvailableOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/orders/available');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch available orders');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to update order status');
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<Order> => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to cancel order');
    }
  },

  // Accept bid
  acceptBid: async (bidId: string): Promise<Order> => {
    try {
      const response = await api.post(`/orders/bids/${bidId}/accept`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to accept bid');
    }
  },

  // Reject bid
  rejectBid: async (bidId: string): Promise<Order> => {
    try {
      const response = await api.post(`/orders/bids/${bidId}/reject`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to reject bid');
    }
  },

  // Complete job payment
  completeJobPayment: async (jobId: string, paymentMethod: string): Promise<boolean> => {
    try {
      const response = await api.post(`/payments/job/${jobId}/complete`, { paymentMethod });
      return response.data.status === 'success';
    } catch (error) {
      throw handleApiError(error, 'Failed to process payment');
    }
  },

  // Get pending payments
  getPendingPayments: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/customer/payments/pending');
      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch pending payments');
    }
  }
};

export default customerService; 