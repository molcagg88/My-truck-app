import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { UserRoles } from '../types/enums';

/**
 * Middleware to check if a user has one of the required roles
 * @param allowedRoles Array of roles that are allowed to access the route
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists on the request (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated. Please log in to get access.'
      });
    }
    
    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    
    // If role is allowed, continue to the next middleware/controller
    next();
  };
}; 