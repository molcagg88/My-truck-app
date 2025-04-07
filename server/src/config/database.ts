import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { Order } from '../entities/Order';
import { User } from '../entities/User';
import { Location } from '../entities/Location';
import { TruckType } from '../entities/TruckType';
import { Payment } from '../models/Payment';
import { Bid } from '../entities/Bid';

// Load environment variables
dotenv.config();

// Database type (postgres or sqlite)
const dbType = process.env.DB_TYPE || 'postgres';

let AppDataSource: DataSource;

if (dbType === 'postgres') {
  // PostgreSQL configuration
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '4060', 10);
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
    synchronize: true,
    logging: true,
    entities: [Order, User, Location, TruckType, Payment, Bid],
    migrations: ['src/migrations/*.ts'],
    connectTimeoutMS: 2000,
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  });
} else {
  // SQLite configuration (fallback for development)
  const dbPath = path.join(__dirname, '..', '..', 'data', 'database.sqlite');
  
  console.log(`Using SQLite database at ${dbPath}`);
  
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: dbPath,
    synchronize: true,
    logging: true,
    entities: [Order, User, Location, TruckType, Payment, Bid],
    migrations: ['src/migrations/*.ts']
  });
}

export { AppDataSource };

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
    
    // Log all registered entities
    const entityMetadatas = AppDataSource.entityMetadatas;
    console.log('Registered entities:');
    entityMetadatas.forEach(metadata => {
      console.log(`- ${metadata.name}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    
    // More helpful error messages based on error type
    const err = error as { code?: string };
    if (err.code === 'ECONNREFUSED') {
      console.error(`
      🚨 Database connection refused! 
      
      Please make sure:
        1. PostgreSQL server is running
        2. The connection details are correct:
           - Host: ${process.env.DB_HOST}
           - Port: ${process.env.DB_PORT}
           - Database: ${process.env.DB_NAME}
           - Username: ${process.env.DB_USERNAME}
        3. The database exists
        4. The user has proper permissions
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