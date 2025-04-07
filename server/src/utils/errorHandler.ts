import { Response } from 'express';

/**
 * Standardized error response handler
 */
export const handleErrorResponse = (res: Response, error: any, defaultMessage: string = 'An unexpected error occurred') => {
  console.error('Error:', error);
  
  // Check if it's a known error type with specific handling
  if (error.name === 'EntityNotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors || [],
    });
  }
  
  // Handle database constraint errors
  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this data already exists',
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: error.message || defaultMessage,
  });
}; 