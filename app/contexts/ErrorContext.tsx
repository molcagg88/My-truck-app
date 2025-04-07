import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from './LanguageContext';

interface ErrorContextType {
  error: string | null;
  setError: (error: string | null) => void;
  handleError: (error: unknown, defaultMessage?: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleError = useCallback((error: unknown, defaultMessage?: string) => {
    console.error('Error:', error);

    let errorMessage = defaultMessage || t('common.error');

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }

    setError(errorMessage);
    Alert.alert(t('common.error'), errorMessage, [
      { text: t('common.ok'), onPress: () => setError(null) },
    ]);
  }, [t]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    error,
    setError,
    handleError,
    clearError,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}; 