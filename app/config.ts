// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Development mode flags
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Feature flags for development
export const FEATURES = {
  OTP_AUTHENTICATION: process.env.EXPO_PUBLIC_ENABLE_OTP_AUTHENTICATION === 'true',
  MAPS_INTEGRATION: process.env.EXPO_PUBLIC_ENABLE_MAPS_INTEGRATION === 'true',
  TELEBIRR_INTEGRATION: process.env.EXPO_PUBLIC_ENABLE_TELEBIRR_INTEGRATION === 'true',
}; 