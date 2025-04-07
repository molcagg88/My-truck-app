import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import storage from '../utils/storage';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.accountCreated': 'Account created successfully',
    'auth.passwordReset': 'Password reset instructions sent to your email',

    // Orders
    'orders.create': 'Create Order',
    'orders.edit': 'Edit Order',
    'orders.delete': 'Delete Order',
    'orders.status': 'Status',
    'orders.pickupLocation': 'Pickup Location',
    'orders.destination': 'Destination',
    'orders.truckType': 'Truck Type',
    'orders.price': 'Price',
    'orders.description': 'Description',
    'orders.pending': 'Pending',
    'orders.paymentPending': 'Payment Pending',
    'orders.accepted': 'Accepted',
    'orders.inProgress': 'In Progress',
    'orders.completed': 'Completed',
    'orders.cancelled': 'Cancelled',

    // Bids
    'bids.place': 'Place Bid',
    'bids.edit': 'Edit Bid',
    'bids.delete': 'Delete Bid',
    'bids.accept': 'Accept Bid',
    'bids.decline': 'Decline Bid',
    'bids.counter': 'Counter Bid',
    'bids.originalPrice': 'Original Price',
    'bids.proposedPrice': 'Proposed Price',
    'bids.comment': 'Comment',
    'bids.pending': 'Pending',
    'bids.accepted': 'Accepted',
    'bids.declined': 'Declined',
    'bids.countered': 'Countered',

    // Payments
    'payments.pay': 'Pay Now',
    'payments.verify': 'Verify Payment',
    'payments.pending': 'Payment Pending',
    'payments.completed': 'Payment Completed',
    'payments.failed': 'Payment Failed',
    'payments.refunded': 'Payment Refunded',
    'payments.method': 'Payment Method',
    'payments.telebirr': 'Telebirr',
    'payments.card': 'Credit Card',
    'payments.bankTransfer': 'Bank Transfer',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Mark All as Read',
    'notifications.clearAll': 'Clear All',
    'notifications.noNotifications': 'No notifications',
    'notifications.newBid': 'New bid received',
    'notifications.bidAccepted': 'Your bid was accepted',
    'notifications.bidDeclined': 'Your bid was declined',
    'notifications.paymentReceived': 'Payment received',
    'notifications.orderCompleted': 'Order completed',
    'notifications.orderCancelled': 'Order cancelled',

    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.role': 'Role',
    'profile.customer': 'Customer',
    'profile.driver': 'Driver',
    'profile.admin': 'Admin',
    'profile.rating': 'Rating',
    'profile.totalOrders': 'Total Orders',
    'profile.activeOrders': 'Active Orders',
    'profile.completedOrders': 'Completed Orders',
    'profile.totalEarnings': 'Total Earnings',
  },
  am: {
    // Add Amharic translations here
  },
};

interface LanguageContextType {
  language: string;
  isRTL: boolean;
  t: (key: string) => string;
  changeLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const storedLanguage = await storage.getLanguagePreference();
      if (storedLanguage) {
        setLanguage(storedLanguage);
        setIsRTL(storedLanguage === 'am');
      } else {
        const systemLanguage = Localization.locale.split('-')[0];
        setLanguage(systemLanguage);
        setIsRTL(systemLanguage === 'am');
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const changeLanguage = async (lang: string) => {
    try {
      setLanguage(lang);
      setIsRTL(lang === 'am');
      await storage.setLanguagePreference(lang);
      I18nManager.forceRTL(lang === 'am');
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const value = {
    language,
    isRTL,
    t,
    changeLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 