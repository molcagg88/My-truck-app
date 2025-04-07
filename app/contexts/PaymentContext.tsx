import React, { createContext, useContext, useState } from 'react';
import { payments } from '../services/api';
import { useError } from './ErrorContext';
import { useLanguage } from './LanguageContext';
import { FEATURES } from '../config';

interface PaymentContextType {
  isLoading: boolean;
  error: string | null;
  initiatePayment: (orderId: string, amount: number) => Promise<void>;
  verifyPayment: (orderId: string, paymentId: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useError();
  const { t } = useLanguage();

  const initiatePayment = async (orderId: string, amount: number) => {
    try {
      setIsLoading(true);
      if (FEATURES.TELEBIRR_INTEGRATION) {
        // Real Telebirr integration would go here
        throw new Error('Telebirr integration not implemented');
      } else {
        // Development mode: Simulate payment
        const paymentData = {
          amount,
          currency: 'ETB',
          method: 'development',
          status: 'pending'
        };
        await payments.create(orderId, paymentData);
      }
    } catch (error) {
      handleError(error, t('payments.initiateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (orderId: string, paymentId: string) => {
    try {
      setIsLoading(true);
      if (FEATURES.TELEBIRR_INTEGRATION) {
        // Real Telebirr verification would go here
        throw new Error('Telebirr integration not implemented');
      } else {
        // Development mode: Simulate payment verification
        await payments.verify(orderId, paymentId);
      }
    } catch (error) {
      handleError(error, t('payments.verifyError'));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    error,
    initiatePayment,
    verifyPayment,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 