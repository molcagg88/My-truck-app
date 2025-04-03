import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserRoles } from '../types/enums';
import bcrypt from 'bcryptjs';

/**
 * This script creates a test user for development purposes
 * Run this script to create a customer user for testing
 */
export const createTestUser = async () => {
  try {
    console.log('Starting test user creation...');
    
    // Initialize the database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
      console.log('Database connection initialized.');
    }
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if test user already exists
    const existingUser = await userRepository.findOne({ 
      where: { email: 'customer@test.com' } 
    });
    
    if (existingUser) {
      console.log('Test user already exists with ID:', existingUser.id);
      return existingUser;
    }
    
    // Create a new test user
    const user = new User();
    user.name = 'Test Customer';
    user.email = 'customer@test.com';
    user.password = await bcrypt.hash('password123', 10);
    user.phone = '+251912345678';
    user.role = UserRoles.CUSTOMER;
    user.isPhoneVerified = true;
    user.isEmailVerified = true;
    
    const savedUser = await userRepository.save(user);
    console.log('Test user created successfully with ID:', savedUser.id);
    
    return savedUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    // Don't close the connection if it might be used elsewhere
    // If running this script directly, uncomment the next line
    // await AppDataSource.destroy();
  }
};

// Run the script if executed directly (not imported)
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('Test user creation completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test user creation failed:', error);
      process.exit(1);
    });
} 