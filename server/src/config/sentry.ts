import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from the correct path
config({
  path: path.resolve(__dirname, '../../.env')
});

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('SENTRY_DSN:', process.env.SENTRY_DSN ? 'Found' : 'Not found');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ENABLE_SENTRY_IN_DEV:', process.env.ENABLE_SENTRY_IN_DEV);

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENABLE_SENTRY = process.env.NODE_ENV === 'production' || process.env.ENABLE_SENTRY_IN_DEV === 'true';

const sentry = {
  init: () => {
    if (!SENTRY_DSN) {
      console.log('Sentry DSN not found. Sentry is disabled.');
      return;
    }

    if (!ENABLE_SENTRY) {
      console.log('Sentry is disabled in development mode');
      return;
    }

    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        integrations: [
          nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of transactions
        profilesSampleRate: 1.0, // Capture 100% of profiles
      });

      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  },

  setUserContext: (userId: string, email?: string, username?: string) => {
    if (!ENABLE_SENTRY) return;
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  },

  clearUserContext: () => {
    if (!ENABLE_SENTRY) return;
    Sentry.setUser(null);
  },

  captureException: (error: Error, context?: Record<string, any>) => {
    if (!ENABLE_SENTRY) return;
    Sentry.captureException(error, { extra: context });
  },

  captureMessage: (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
    if (!ENABLE_SENTRY) return;
    Sentry.captureMessage(message, { level, extra: context });
  },
};

export default sentry; 