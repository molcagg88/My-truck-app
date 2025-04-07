import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

interface Config {
  jwtSecret: string;
  port: number;
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  wsPort: number;
  corsOrigin: string[];
}

export const config: Config = {
  jwtSecret: process.env.JWT_SECRET || 'your-default-jwt-secret-for-development',
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'truck_app',
  },
  wsPort: parseInt(process.env.WS_PORT || '3001', 10),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
}; 