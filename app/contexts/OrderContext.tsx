import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { orders, bids } from '../services/api';
import { useError } from './ErrorContext';
import { useLanguage } from './LanguageContext';

interface OrderContextType {
  orders: any[];
  availableOrders: any[];
  isLoading: boolean;
  error: string | null;
  createOrder: (orderData: any) => Promise<void>;
  getOrders: () => Promise<void>;
  getAvailableOrders: () => Promise<void>;
  placeBid: (orderId: string, bidData: any) => Promise<void>;
  acceptBid: (bidId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [availableOrdersList, setAvailableOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useError();
  const { t } = useLanguage();

  const createOrder = async (orderData: any) => {
    try {
      setIsLoading(true);
      const newOrder = await orders.create(orderData);
      setOrdersList(prev => [...prev, newOrder]);
    } catch (error) {
      handleError(error, t('orders.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  const getOrders = async () => {
    try {
      setIsLoading(true);
      const data = user?.role === 'driver' 
        ? await orders.getDriverOrders()
        : await orders.getCustomerOrders();
      setOrdersList(data);
    } catch (error) {
      handleError(error, t('orders.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orders.getAvailableOrders();
      setAvailableOrdersList(data);
    } catch (error) {
      handleError(error, t('orders.fetchAvailableError'));
    } finally {
      setIsLoading(false);
    }
  };

  const placeBid = async (orderId: string, bidData: any) => {
    try {
      setIsLoading(true);
      const newBid = await bids.create(orderId, bidData);
      setAvailableOrdersList(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, bids: [...(order.bids || []), newBid] }
            : order
        )
      );
    } catch (error) {
      handleError(error, t('bids.placeError'));
    } finally {
      setIsLoading(false);
    }
  };

  const acceptBid = async (bidId: string) => {
    try {
      setIsLoading(true);
      const updatedOrder = await bids.accept(bidId);
      setOrdersList(prev => 
        prev.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    } catch (error) {
      handleError(error, t('bids.acceptError'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setIsLoading(true);
      const updatedOrder = await orders.update(orderId, { status });
      setOrdersList(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
    } catch (error) {
      handleError(error, t('orders.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getOrders();
      if (user.role === 'driver') {
        getAvailableOrders();
      }
    }
  }, [user]);

  const value = {
    orders: ordersList,
    availableOrders: availableOrdersList,
    isLoading,
    error,
    createOrder,
    getOrders,
    getAvailableOrders,
    placeBid,
    acceptBid,
    updateOrderStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}; 