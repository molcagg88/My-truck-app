import { AppDataSource } from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function resetDatabase() {
  try {
    // Get the database path
    const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
    
    // Delete the existing database file if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Existing database file deleted');
    }
    
    // Create the data directory if it doesn't exist
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('Database connection established');
    
    // Run migrations
    await AppDataSource.runMigrations();
    console.log('Database migrations completed');
    
    // Close the connection
    await AppDataSource.destroy();
    console.log('Database connection closed');
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset function
resetDatabase(); 