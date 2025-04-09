// GeezSMS OTP verification service integration
import storage from '../utils/storage';
import { getApiBaseUrl } from './apiUtils';
import axios from 'axios';

interface SendOTPParams {
  phoneNumber: string;
  messageTemplate?: string;
}

interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    otpId?: string;
    expiresIn?: number;
  };
}

interface VerifyOTPParams {
  phoneNumber: string;
  otpCode: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Helper function to format phone numbers consistently
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  // Clean the input - remove spaces, dashes, parentheses, etc.
  const cleaned = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  // If phone already has a + prefix, assume it's in international format
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Handle Ethiopian numbers specifically
  if (cleaned.startsWith('251')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.startsWith('0')) {
    // Converting Ethiopian local format (0xx...) to international
    return `+251${cleaned.substring(1)}`;
  }
  
  // If it's a 9-digit number, assume it's Ethiopian without the 0 prefix
  if (/^9\d{8}$/.test(cleaned)) {
    return `+251${cleaned}`;
  }
  
  // If it's a 10-digit number and doesn't match other patterns,
  // it could be a complete local number (like US/Canada)
  if (cleaned.length === 10 && !/^0/.test(cleaned)) {
    return `+251${cleaned}`;
  }
  
  // If no specific format is recognized, preserve as is but ensure + prefix
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

const GEEZSMS_API_KEY = process.env.EXPO_PUBLIC_GEEZSMS_API_KEY;
const GEEZSMS_API_URL = "https://api.geezsms.com/v1";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

const geezSMSService = {
  formatPhoneNumber,
  
  async sendOTP(phoneNumber: string) {
    try {
      // Format the phone number to ensure consistency
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log("Sending OTP to", formattedPhone);
      
      // Make API request to send OTP
      const response = await api.post('/auth/send-otp', {
        phone: formattedPhone
      });
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Provide more specific error messages based on the error type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          error: error.response.data?.message || `Server error: ${error.response.status}`,
        };
      } else if (error.request) {
        // The request was made but no response was received
        return {
          success: false,
          error: "No response from server. Please check your internet connection.",
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          success: false,
          error: error.message || "Failed to send OTP. Please try again.",
        };
      }
    }
  },

  async verifyOTP(phoneNumber: string, otp: string, name?: string): Promise<ApiResponse> {
    try {
      // Format the phone number to ensure consistency
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log(`Verifying OTP for phone: ${formattedPhone}`);
      
      // Make the API request to verify OTP
      const response = await api.post('/auth/verify-otp', {
        phone: formattedPhone,
        otp,
        name
      });
      
      console.log(`Server response status: ${response.status}`);
      
      // If the server responds with success and token
      if (response.data.success && response.data.token) {
        // Ensure the token is a string and validate format
        const tokenString = String(response.data.token);
        console.log(`Received token (first 20 chars): ${tokenString.substring(0, 20)}...`);
        
        // Validate token format (should be in JWT format: header.payload.signature)
        const parts = tokenString.split('.');
        if (parts.length !== 3) {
          console.warn(`WARNING: Token does not have expected JWT format (has ${parts.length} parts)`);
          return {
            success: false,
            error: 'Invalid token format received from server'
          };
        }
        
        // Store the token securely
        try {
          await storage.setToken(tokenString);
          console.log('Token saved successfully');
        } catch (storageError) {
          console.error('Failed to save token:', storageError);
          throw new Error('Authentication failed: Unable to save credentials');
        }
        
        // Return success response
        return {
          success: true,
          message: "Authentication successful",
          data: {
            ...response.data,
            token: tokenString,
          },
        };
      }
      
      // If the API call was successful but authentication failed
      return {
        success: false,
        error: response.data.message || 'Authentication failed',
      };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify OTP',
      };
    }
  },
};

export default geezSMSService;
