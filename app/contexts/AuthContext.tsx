import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, users } from '../services/api';
import { useError } from './ErrorContext';
import { useLanguage } from './LanguageContext';
import { FEATURES } from '../config';
import storage from '../utils/storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'driver' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  rating?: number;
  totalRatings?: number;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useError();
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        const userData = await users.getProfile();
        setUser(userData);
      }
    } catch (error) {
      // Silent error - just means user is not authenticated
      await storage.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await auth.login(email, password);
      await storage.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      handleError(error, t('auth.loginError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await auth.register(userData);
      
      if (FEATURES.OTP_AUTHENTICATION) {
        // Real OTP authentication would go here
        throw new Error('OTP authentication not implemented');
      } else {
        // Development mode: Auto-verify email
        await auth.verifyEmail('development-token');
        await storage.setToken(response.token);
        setUser(response.user);
      }
    } catch (error) {
      handleError(error, t('auth.registerError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await storage.removeToken();
      setUser(null);
    } catch (error) {
      handleError(error, t('auth.logoutError'));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      await auth.verifyEmail(token);
      if (user) {
        setUser({ ...user, isEmailVerified: true });
      }
    } catch (error) {
      handleError(error, t('auth.verifyEmailError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      await auth.requestPasswordReset(email);
    } catch (error) {
      handleError(error, t('auth.requestPasswordResetError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await auth.resetPassword(token, newPassword);
    } catch (error) {
      handleError(error, t('auth.resetPasswordError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: any) => {
    try {
      setIsLoading(true);
      const updatedUser = await users.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      handleError(error, t('auth.updateProfileError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 