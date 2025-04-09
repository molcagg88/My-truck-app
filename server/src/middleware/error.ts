import { Request, Response, NextFunction } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { logger } from '../utils/logger';
import sentry from '../config/sentry';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Simplified error handler that always returns an AppError
export function handleDatabaseError(error: any): AppError {
  // Handle entity not found errors
  if (error instanceof EntityNotFoundError) {
    return new AppError('Resource not found', 404);
  }
  
  // Handle query failed errors with PostgreSQL codes
  if (error instanceof QueryFailedError) {
    const pgError = error as any;
    
    if (pgError.code === '23505') {
      return new AppError(`Duplicate entry: ${pgError.detail || 'A record with the same key already exists'}`, 400);
    }
    
    if (pgError.code === '23503') {
      return new AppError(`Related record not found: ${pgError.detail || 'A required related record does not exist'}`, 400);
    }
    
    if (pgError.code === '42P01') {
      logger.error(`Database schema error: ${pgError.message}`);
      return new AppError('Internal server error', 500);
    }
    
    logger.error(`Query failed: ${pgError.message}`, { stack: pgError.stack });
    return new AppError('Database query failed', 500);
  }
  
  // Default error handling
  logger.error(`Database error: ${error.message}`, { stack: error.stack });
  return new AppError('Database operation failed', 500);
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error to Sentry
  sentry.captureException(err, {
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Handle TypeORM errors
  if (err.name === 'QueryFailedError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Database operation failed',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Token expired',
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Handle unknown errors
  console.error('Error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}; 