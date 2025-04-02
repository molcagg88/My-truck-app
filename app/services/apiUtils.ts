import { AxiosError } from 'axios';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// Handle API errors consistently
export const handleApiError = (error: any, defaultMessage: string): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.message || defaultMessage;
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || defaultMessage;
  }
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

export const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // In development, use platform-specific URLs
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000/api';
    }
    return 'http://localhost:3000/api';
  }
  
  // In production, use the actual API URL
  return Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.com/api';
};

const apiUtils = {
  handleApiError,
  formatApiResponse,
  formatValidationErrors,
  getApiBaseUrl
};

export default apiUtils; 