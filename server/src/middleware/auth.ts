import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';
import { UserRoles } from '../types/enums';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import { config } from '../config/config';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 * This is an alias of authMiddleware for clearer naming
 */
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const jwtSecret = config.jwtSecret || process.env.JWT_SECRET as string;
      
      // Verify token and get decoded data
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (error: any) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token found in header or invalid format');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token (first 20 chars):', token.substring(0, 20) + '...');
    
    if (!token) {
      console.log('Token is empty after extraction');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const jwtSecret = config.jwtSecret || process.env.JWT_SECRET as string;
      console.log('Using JWT secret (first 5 chars):', jwtSecret.substring(0, 5) + '...');
      
      // Check token format before verification
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format: Expected 3 parts (header.payload.signature), got', parts.length);
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      // Verify token and get decoded data
      const decoded = jwt.verify(token, jwtSecret) as any;
      console.log('Token decoded successfully, user ID:', decoded.id);
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });
      
      if (!user) {
        console.log('User not found in database:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('User found:', user.id);
      req.user = user;
      next();
    } catch (error: any) {
      console.error('JWT verification error:', error.message);
      // Check if token format appears to be malformed
      if (error.message === 'jwt malformed') {
        console.log('Token does not have the expected JWT format. Token structure check:');
        const parts = token.split('.');
        console.log(`Token has ${parts.length} parts. Expected: 3 (header.payload.signature)`);
        // Do not log the actual token parts for security
      }
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const verifyToken = async (token: string) => {
  try {
    const secret = config.jwtSecret || process.env.JWT_SECRET;
    
    if (!secret) {
      console.error('JWT_SECRET environment variable is not set!');
      throw new AppError('Server configuration error', 500);
    }
    
    // Check if token has valid JWT format (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error(`Invalid token format: token has ${parts.length} parts, expected 3`);
      throw new AppError('Invalid token format', 401);
    }
    
    return jwt.verify(token, secret) as {
      id: string;
      role: UserRoles;
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Token verification error:', error);
    throw new AppError('Invalid token', 401);
  }
};

// Middleware to restrict access to specific roles
export const restrictTo = (...roles: UserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated. Please log in to get access.', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

// Check for specific permissions
export const hasPermission = (_requiredPermission: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
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