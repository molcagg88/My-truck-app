import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import customerRoutes from './routes/customer';
import driverRoutes from './routes/driver';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/customer', authMiddleware, customerRoutes);
app.use('/api/driver', authMiddleware, driverRoutes);

// API health check and documentation
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API information
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Truck App API',
    version: '1.0.0',
    endpoints: [
      { path: '/api/auth', description: 'Authentication endpoints' },
      { path: '/api/admin', description: 'Admin management endpoints' },
      { path: '/api/customer', description: 'Customer service endpoints' },
      { path: '/api/driver', description: 'Driver service endpoints' },
      { path: '/api/health', description: 'API health check' }
    ]
  });
});

// Handle 404 routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected successfully');
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`API available at http://localhost:${port}/api`);
    });
  })
  .catch((error) => {
    logger.error('Error connecting to database:', error);
  }); 