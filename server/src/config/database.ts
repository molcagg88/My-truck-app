import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { Job } from '../entities/Job';
import { Payment } from '../entities/Payment';
import { Driver } from '../entities/Driver';
import { Activity } from '../entities/Activity';

// Load environment variables
dotenv.config();

// Database type (postgres or sqlite)
const dbType = process.env.DB_TYPE || 'sqlite';

let AppDataSource: DataSource;

if (dbType === 'postgres') {
  // PostgreSQL configuration
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbUsername = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbName = process.env.DB_NAME || 'truck_app';

  console.log(`Connecting to PostgreSQL database at ${dbHost}:${dbPort}/${dbName}`);

  AppDataSource = new DataSource({
    type: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbName,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: [Job, Payment, Driver, Activity],
    migrations: ['src/migrations/*.ts'],
    connectTimeoutMS: 10000,
    extra: {
      family: 4 // Force IPv4 for Windows systems
    }
  });
} else {
  // SQLite configuration (default for development)
  const dbPath = path.join(__dirname, '..', '..', 'data', 'database.sqlite');
  
  console.log(`Using SQLite database at ${dbPath}`);
  
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: dbPath,
    synchronize: true,
    logging: process.env.NODE_ENV !== 'production',
    entities: [Job, Payment, Driver, Activity],
    migrations: ['src/migrations/*.ts']
  });
}

export { AppDataSource };

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    
    // More helpful error messages based on error type
    const err = error as { code?: string };
    if (err.code === 'ECONNREFUSED') {
      console.error(`
      🚨 Database connection refused! 
      
      Please make sure:
        1. Database server is running
        2. The connection details are correct
      `);
    } else if (err.code === 'SQLITE_CANTOPEN') {
      console.error(`
      🚨 Cannot open SQLite database file! 
      
      Please make sure:
        1. The application has write permissions to the data directory
        2. The path exists
      `);
    }
    
    throw error;
  }
};