import axios from 'axios';
import { getApiBaseUrl } from './apiUtils';
import storage from '../utils/storage';

interface Bid {
  id: string;
  jobId: string;
  driverId: string;
  originalPrice: number;
  proposedPrice: number;
  status: "pending" | "accepted" | "declined" | "countered";
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
}

interface CreateBidParams {
  jobId: string;
  proposedPrice: number;
  comment?: string;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
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

const biddingService = {
  async createBid(params: CreateBidParams): Promise<Bid> {
    try {
      const response = await api.post('/bidding/create', params);
      return response.data.data;
    } catch (error) {
      console.error('Error creating bid:', error);
      throw error;
    }
  },

  async getBidsByJobId(jobId: string): Promise<Bid[]> {
    try {
      const response = await api.get(`/bidding/job/${jobId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting bids for job:', error);
      throw error;
    }
  },

  async getMyBids(): Promise<Bid[]> {
    try {
      const response = await api.get('/bidding/driver/bids');
      return response.data.data;
    } catch (error) {
      console.error('Error getting driver bids:', error);
      throw error;
    }
  },

  async acceptBid(bidId: string): Promise<Bid> {
    try {
      const response = await api.post(`/bidding/${bidId}/accept`);
      return response.data.data;
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  },

  async declineBid(bidId: string): Promise<Bid> {
    try {
      const response = await api.post(`/bidding/${bidId}/decline`);
      return response.data.data;
    } catch (error) {
      console.error('Error declining bid:', error);
      throw error;
    }
  },

  async counterBid(bidId: string, counterPrice: number): Promise<Bid> {
    try {
      const response = await api.post(`/bidding/${bidId}/counter`, { counterPrice });
      return response.data.data;
    } catch (error) {
      console.error('Error countering bid:', error);
      throw error;
    }
  },
};

export default biddingService; 