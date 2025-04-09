import { Alert } from 'react-native';
import sentry from '../services/sentry';

/**
 * Global error handler for the app
 * Captures errors and reports them to Sentry
 */
export const handleError = (error: Error, context?: Record<string, any>) => {
  // Log the error to the console
  console.error('Error:', error);
  
  // Capture the error in Sentry if available
  if (sentry?.captureException) {
    sentry.captureException(error, context);
  }
  
  // Show a user-friendly error message
  Alert.alert(
    'Error',
    'An unexpected error occurred. Our team has been notified.',
    [{ text: 'OK' }]
  );
};

/**
 * Handle API errors specifically
 */
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  // Extract error message
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  // Capture the error in Sentry with API context if available
  if (sentry?.captureException) {
    sentry.captureException(error, {
      type: 'api_error',
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
    });
  }
  
  // Show a user-friendly error message
  Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
  
  return new Error(errorMessage);
};

/**
 * Handle network errors specifically
 */
export const handleNetworkError = (error: any) => {
  // Capture the error in Sentry if available
  if (sentry?.captureException) {
    sentry.captureException(error, {
      type: 'network_error',
      url: error.config?.url,
      method: error.config?.method,
    });
  }
  
  // Show a user-friendly error message
  Alert.alert(
    'Network Error',
    'Please check your internet connection and try again.',
    [{ text: 'OK' }]
  );
  
  return new Error('Network error');
}; 