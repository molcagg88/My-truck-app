import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';
import { UserRoles } from '../types/enums';

// Extend Express Request interface
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      role: string;
    };

    if (decoded.role !== 'ADMIN') {
      throw new AppError('Unauthorized access', 403);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const verifyToken = async (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      role: string;
    };
  } catch (error) {
    throw new AppError('Invalid token', 401);
  }
};

// Middleware to restrict access to specific roles
export const restrictTo = (...roles: UserRoles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated. Please log in to get access.', 401));
    }
    
    if (!roles.includes(req.user.role as UserRoles)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

// Check for specific permissions
export const hasPermission = (_requiredPermission: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }

    // For admin, grant all permissions
    if (req.user.role === UserRoles.ADMIN) {
      return next();
    }

    // TODO: Implement permission checking logic here
    // Example with a permissions table
    // const userPermissions = await PermissionService.getUserPermissions(req.user.id);
    // if (!userPermissions.includes(requiredPermission)) {
    //   return next(new AppError('You do not have permission to perform this action', 403));
    // }

    // For now, just allow all authenticated users
    next();
  };
}; 