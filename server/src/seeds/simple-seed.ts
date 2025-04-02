import { AppDataSource } from '../config/database';
import { Driver } from '../entities/Driver';
import { DriverStatus } from '../types/enums';
import fs from 'fs';
import path from 'path';

// Ensure required directories exist
const ensureDirectories = () => {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Simple test to check if we can create a driver
export const simpleSeed = async () => {
  try {
    // Ensure directories exist
    ensureDirectories();

    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Database initialized successfully');

    // Create a simple driver
    const driver = new Driver();
    driver.name = "Test Driver";
    driver.status = DriverStatus.AVAILABLE;
    driver.currentLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      timestamp: new Date()
    };

    console.log('Saving test driver...');
    const savedDriver = await AppDataSource.getRepository(Driver).save(driver);
    console.log('Driver saved with ID:', savedDriver.id);

    // Close the connection
    await AppDataSource.destroy();
    console.log('Database connection closed');

    return true;
  } catch (error) {
    console.error('Error in simple seed:', error);
    throw error;
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  simpleSeed()
    .then(() => {
      console.log('Simple seed completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Simple seed failed:', error);
      process.exit(1);
    });
} 