/**
 * Simple script to create a test user directly
 * This is a workaround for environments where running npm scripts is restricted
 */
require('dotenv').config();
const { AppDataSource } = require('../dist/config/database');
const { UserRoles } = require('../dist/types/enums');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('Starting test user creation...');
    
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
      console.log('Database connection initialized.');
    }
    
    const userRepository = AppDataSource.getRepository('User');
    
    // Check if test user already exists
    const existingUser = await userRepository.findOne({ 
      where: { email: 'customer@test.com' } 
    });
    
    if (existingUser) {
      console.log('Test user already exists with ID:', existingUser.id);
      return existingUser;
    }
    
    // Create a new test user
    const user = userRepository.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+251912345678',
      role: UserRoles.CUSTOMER,
      isPhoneVerified: true,
      isEmailVerified: true
    });
    
    const savedUser = await userRepository.save(user);
    console.log('Test user created successfully with ID:', savedUser.id);
    
    return savedUser;
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Execute the function
createTestUser()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 