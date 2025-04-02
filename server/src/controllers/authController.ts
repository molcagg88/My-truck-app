import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error';
import { UserRoles } from '../types/enums';

// Demo users (in a real app, these would be in a database)
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    role: UserRoles.ADMIN,
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'manager@example.com',
    password: 'manager123',
    role: UserRoles.MANAGER,
    name: 'Manager User'
  },
  {
    id: '3',
    email: 'driver@example.com',
    password: 'driver123',
    role: UserRoles.DRIVER,
    name: 'Driver User'
  },
  {
    id: '4',
    email: 'user@example.com',
    password: 'user123',
    role: UserRoles.CUSTOMER,
    name: 'Regular User'
  }
];

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
      }
      
      // Find user by email
      const user = DEMO_USERS.find(u => u.email === email);
      
      // Check if user exists and password is correct
      if (!user || user.password !== password) {
        return next(new AppError('Incorrect email or password', 401));
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      // Remove password from output
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        status: 'success',
        token,
        data: {
          user: userWithoutPassword
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  }
  
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return next(new AppError('Please provide a token', 400));
      }
      
      // Verify the token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
      } catch (err) {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
      
      // Find the user by id
      const user = DEMO_USERS.find(u => u.id === decoded.id);
      
      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }
      
      // Generate a new token
      const newToken = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.status(200).json({
        status: 'success',
        token: newToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      next(error);
    }
  }
} 