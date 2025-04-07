import axios, { AxiosError } from 'axios';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// Handle API errors consistently
export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred'): Error => {
  console.error('API Error:', error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Handle network errors
    if (!axiosError.response) {
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
      return new Error('Network error');
    }

    // Handle specific error status codes
    const status = axiosError.response.status;
    const data = axiosError.response.data as { message?: string };

    switch (status) {
      case 400:
        Alert.alert('Bad Request', data.message || 'Please check your input and try again.');
        break;
      case 401:
        Alert.alert('Unauthorized', 'Please login again to continue.');
        // You might want to handle logout here
        break;
      case 403:
        Alert.alert('Forbidden', 'You do not have permission to perform this action.');
        break;
      case 404:
        Alert.alert('Not Found', 'The requested resource was not found.');
        break;
      case 500:
        Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
        break;
      default:
        Alert.alert('Error', data.message || defaultMessage);
    }

    return new Error(data.message || defaultMessage);
  }

  // Handle non-Axios errors
  Alert.alert('Error', defaultMessage);
  return new Error(defaultMessage);
};

// Format API response data consistently
export const formatApiResponse = <T>(data: any): T => {
  // If the API returns a nested data object, extract it
  if (data && data.data) {
    return data.data as T;
  }
  return data as T;
};

// Format errors for form validation
export const formatValidationErrors = (error: AxiosError<any>) => {
  const errors: Record<string, string> = {};
  
  if (error.response?.data?.errors) {
    // Format validation errors from API
    const validationErrors = error.response.data.errors;
    
    if (Array.isArray(validationErrors)) {
      // Handle array of error objects
      validationErrors.forEach(err => {
        if (err.field && err.message) {
          errors[err.field] = err.message;
        }
      });
    } else if (typeof validationErrors === 'object') {
      // Handle object with field keys
      Object.keys(validationErrors).forEach(field => {
        errors[field] = validationErrors[field];
      });
    }
  }
  
  return errors;
};

// Get the base URL based on the environment
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    return 'http://localhost:3000/api';
  }
  return 'https://api.your-production-domain.com/api';
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get order status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#FFA500'; // Orange
    case 'payment_pending':
      return '#FFD700'; // Gold
    case 'accepted':
      return '#32CD32'; // Lime Green
    case 'in-progress':
      return '#4169E1'; // Royal Blue
    case 'completed':
      return '#008000'; // Green
    case 'cancelled':
      return '#FF0000'; // Red
    default:
      return '#808080'; // Gray
  }
};

// Get order status text
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'payment_pending':
      return 'Payment Pending';
    case 'accepted':
      return 'Accepted';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const apiUtils = {
  handleApiError,
  formatApiResponse,
  formatValidationErrors,
  getApiBaseUrl,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusText
};

export default apiUtils; 