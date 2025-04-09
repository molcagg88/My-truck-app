import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserRoles } from '../types/enums';
import { AppError } from '../middleware/error';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  private generateToken(user: User): string {
    try {
      console.log(`Generating token for user: ${user.id}`);
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        console.error('JWT_SECRET environment variable is not set!');
        throw new Error('Server configuration error: JWT_SECRET not set');
      }
      
      console.log(`Using secret (first 5 chars): ${secret.substring(0, 5)}...`);
      
      // Create JWT payload
      const payload = {
        id: user.id,
        role: user.role,
      };
      
      console.log('Creating JWT with payload:', payload);
      
      // Sign token with secret - Remove any custom token creation logic
      // and rely fully on the jwt.sign method
      const token = jwt.sign(payload, secret, { expiresIn: '24h' });
      
      console.log(`Generated token (first 20 chars): ${token.substring(0, 20)}...`);
      
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        phone,
        role: UserRoles.CUSTOMER,
      });

      await this.userRepository.save(user);

      // Generate token
      const token = this.generateToken(user);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = this.generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  getMe = async (req: Request, res: Response) => {
    try {
      const user = await this.userRepository.findOne({ where: { id: req.user?.id } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      const { name, email, phone, role, vehicleInfo } = req.body;
      const user = await this.userRepository.findOne({ where: { id: req.user?.id } });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Update basic profile fields if provided
      user.name = name || user.name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      
      // Allow role updates (validate role value first)
      if (role && Object.values(UserRoles).includes(role as UserRoles)) {
        console.log(`Updating user role from ${user.role} to ${role}`);
        user.role = role as UserRoles;
      }
      
      // For driver-specific info, we would save to a Driver entity
      // This is a placeholder for the actual implementation
      if (role === UserRoles.DRIVER && vehicleInfo) {
        console.log('Saving driver vehicle information:', vehicleInfo);
        // In a real implementation, save to Driver entity
      }

      await this.userRepository.save(user);

      // Generate a new token with the updated user information
      // This ensures the token contains the latest role
      const token = this.generateToken(user);

      res.json({
        message: 'Profile updated successfully',
        token, // Send the new token to the client
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await this.userRepository.findOne({ where: { id: req.user?.id } });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await this.userRepository.findOne({ where: { email } });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // TODO: Implement password reset token generation and email sending
      // For now, just return success
      res.json({ message: 'Password reset instructions sent to email' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { newPassword } = req.body;

      // TODO: Implement password reset token verification
      // For now, just return success
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  // Admin only methods
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'email', 'name', 'role', 'createdAt'],
      });
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userRepository.findOne({
        where: { id: req.params.id },
        select: ['id', 'email', 'name', 'role', 'createdAt'],
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({ user });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const { name, role } = req.body;
      const user = await this.userRepository.findOne({ where: { id: req.params.id } });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.name = name || user.name;
      if (role) {
        user.role = role as UserRoles;
      }

      await this.userRepository.save(user);

      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userRepository.findOne({ where: { id: req.params.id } });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      await this.userRepository.remove(user);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  // Phone verification methods
  
  // Send OTP to phone number
  sendOTP = async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required' 
        });
      }

      // Normalize phone number to ensure consistency
      const normalizedPhone = this.normalizePhoneNumber(phone);
      console.log(`Sending OTP to normalized phone: ${normalizedPhone}`);
      
      // Check if we're in development mode
      const isDevMode = process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_DEV_MODE === 'true';
      
      if (isDevMode) {
        // In development mode, simulate OTP sending
        console.log(`[DEV] Sending OTP to ${normalizedPhone}`);
        
        // Return success with the normalized phone to ensure consistency in the client
        return res.json({
          success: true,
          message: 'OTP sent successfully (Development Mode)',
          data: {
            otpId: 'dev-otp-id',
            expiresIn: 300, // 5 minutes
            phone: normalizedPhone,
            // In dev mode, include the test OTP code
            testOtp: '123456'
          }
        });
      } else {
        // In production mode, validate GeezSMS API key
        const geezSmsApiKey = process.env.GEEZSMS_API_KEY;
        if (!geezSmsApiKey || geezSmsApiKey === 'your_api_key_here') {
          console.error('GeezSMS API key not configured');
          return res.status(500).json({
            success: false,
            message: 'SMS service not configured properly'
          });
        }
        
        // TODO: Implement actual GeezSMS API call here
        // For now, return an error
        return res.status(500).json({
          success: false,
          message: 'SMS service not implemented yet'
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Helper method to normalize phone numbers
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return "";
    
    // Clean the input - remove spaces, dashes, parentheses, etc.
    const cleaned = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
    
    // If phone already has a + prefix, assume it's in international format
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // Handle Ethiopian numbers specifically
    if (cleaned.startsWith('251')) {
      return `+${cleaned}`;
    }
    
    if (cleaned.startsWith('0')) {
      // Converting Ethiopian local format (0xx...) to international
      return `+251${cleaned.substring(1)}`;
    }
    
    // If it's a 9-digit number, assume it's Ethiopian without the 0 prefix
    if (/^9\d{8}$/.test(cleaned)) {
      return `+251${cleaned}`;
    }
    
    // If no specific format is recognized, ensure + prefix
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  // Verify OTP and login/register user
  verifyOTP = async (req: Request, res: Response) => {
    try {
      const { phone, otp, name } = req.body;
      console.log('verifyOTP request:', { phone, otp, name });
      
      if (!phone || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number and OTP are required' 
        });
      }

      // In production, validate against actual OTP
      // This would be your actual OTP verification logic
      // For now we're just keeping this simple
      if (otp !== '123456') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid OTP code' 
        });
      }

      // Check if user exists with this phone
      let user = await this.userRepository.findOne({ where: { phone } });
      const isNewUser = !user;
      console.log('User exists?', !isNewUser, user?.id);

      if (!user) {
        // Create a new user with minimal info - will complete profile later
        user = this.userRepository.create({
          phone,
          // Use name if provided, otherwise use a temporary placeholder
          name: name || 'New User',
          isPhoneVerified: true,
          // Generate a unique email based on phone number
          email: `user_${phone.replace(/[^0-9]/g, '')}@example.com`,
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
          role: UserRoles.CUSTOMER
        });
        
        await this.userRepository.save(user);
        console.log('New user created:', user.id);
      } else {
        // Update existing user's phone verification status and name if provided
        user.isPhoneVerified = true;
        
        // Only update name if provided and current name is empty or null
        if (name && (!user.name || user.name.trim() === '')) {
          user.name = name;
        }
        
        // Mark the last login time
        user.lastLoginAt = new Date();
        
        await this.userRepository.save(user);
        console.log('Existing user updated:', user.id);
      }

      // Generate token
      console.log('Generating token for user:', user.id);
      const token = this.generateToken(user);
      
      const responseObj = {
        success: true,
        message: isNewUser ? 'Account created successfully' : 'Login successful',
        isNewUser,
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role
        }
      };
      
      console.log('Response object (without token):', { ...responseObj, token: '[REDACTED]' });
      
      res.json(responseObj);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify OTP' 
      });
    }
  };

  // Check if a phone number exists
  checkPhoneExists = async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required' 
        });
      }
      
      const user = await this.userRepository.findOne({ where: { phone } });
      
      res.json({
        success: true,
        exists: !!user,
        message: user ? 'Phone number is registered' : 'Phone number is not registered'
      });
    } catch (error) {
      console.error('Error checking phone:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to check phone number' 
      });
    }
  };
} 