import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Initialize Sentry
export const initSentry = () => {
  // Only initialize in production or if explicitly enabled in development
  if (__DEV__ && !Constants.expoConfig?.extra?.enableSentryInDev) {
    console.log('Sentry is disabled in development mode');
    return;
  }

  Sentry.init({
    dsn: Constants.expoConfig?.extra?.sentryDsn || 'YOUR_SENTRY_DSN',
    // Enable performance monitoring
    enableAutoSessionTracking: true,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Set profilesSampleRate to 1.0 to profile all transactions
    // We recommend adjusting this value in production
    profilesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Set environment
    environment: __DEV__ ? 'development' : 'production',
    // Enable native crash handling
    enableNative: true,
    // Enable native symbol upload
    enableNativeCrashHandling: true,
    // Set release and distribution
    release: Constants.expoConfig?.version || '1.0.0',
    dist: Constants.expoConfig?.runtimeVersion || '1',
    // Set platform
    platform: Platform.OS,
  });

  // Set user context when available
  const setUserContext = (userId: string, email?: string, username?: string) => {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  };

  // Clear user context on logout
  const clearUserContext = () => {
    Sentry.setUser(null);
  };

  // Capture exception with additional context
  const captureException = (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureException(error);
    });
  };

  // Capture message with additional context
  const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureMessage(message, level);
    });
  };

  return {
    setUserContext,
    clearUserContext,
    captureException,
    captureMessage,
  };
};

// Export a default instance for easy import
export default initSentry(); 