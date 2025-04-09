import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import customerRoutes from './routes/customer';
import driverRoutes from './routes/driver';
import paymentRoutes from './routes/paymentRoutes';
import locationRoutes from './routes/locationRoutes';
import jobRoutes from './routes/job';
import biddingRoutes from './routes/bidding';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';
import { WebSocketServer } from './websocket/server';
import { createServer } from 'http';
import { config } from './config/config';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? true  // Allow all origins in development
    : config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger for requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes); // Add payment routes - public for handling redirects

// Protected routes - require authentication
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/customer', authMiddleware, customerRoutes);
app.use('/api/driver', authMiddleware, driverRoutes);
app.use('/api/jobs', authMiddleware, jobRoutes);
app.use('/api/bidding', biddingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    time: new Date().toISOString()
  });
});

// Root API information
app.get('/api', (req, res) => {
  res.json({
    name: 'Truck Booking API',
    version: '1.0.0',
    description: 'Backend API for the truck booking application',
    documentation: '/api/docs',
    endpoints: [
      '/api/auth',
      '/api/admin',
      '/api/customer',
      '/api/driver',
      '/api/payments',
    ]
  });
});

// Register routes
app.use('/api/location', locationRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Initialize server
const server = createServer(app);

// Initialize WebSocket server (after HTTP server is created)
let wss: WebSocketServer;

// Connect to database and start server
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected successfully');
    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`API available at http://localhost:${port}/api`);
      logger.info(`API also available at http://172.20.30.126:${port}/api`);
      
      // Initialize WebSocket server after HTTP server is running
      wss = new WebSocketServer(server);
      logger.info('🔌 WebSocket server initialized');
    });
  })
  .catch((error) => {
    logger.error('Error connecting to database:', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down server...');
  if (wss) {
    wss.close();
  }
  server.close(() => {
    logger.info('Server shut down');
    process.exit(0);
  });
}); 