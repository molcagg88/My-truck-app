import { Request, Response, NextFunction } from 'express';
import { DriverService } from '../services/driverService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error';

export class DriverController {
  static async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      // Mock data for driver locations
      const locations = Array.from({ length: 5 }, (_, i) => ({
        driverId: `driver-${i + 1}`,
        name: `Driver ${i + 1}`,
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1
        },
        status: ['active', 'on_break', 'off_duty'][Math.floor(Math.random() * 3)],
        lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 30 * 60 * 1000)).toISOString()
      }));
      
      res.status(200).json({
        status: 'success',
        data: locations
      });
    } catch (error) {
      logger.error(`Error fetching driver locations: ${(error as Error).message}`);
      next(error);
    }
  }

  static async getAllDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      // Mock data for drivers
      const drivers = Array.from({ length: 10 }, (_, i) => ({
        id: `driver-${i + 1}`,
        name: `Driver ${i + 1}`,
        email: `driver${i + 1}@example.com`,
        phone: `+1-555-${100 + i}`,
        status: status || ['active', 'on_break', 'off_duty'][Math.floor(Math.random() * 3)],
        joinedAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
        completedJobs: Math.floor(Math.random() * 100)
      }));

      res.status(200).json({
        status: 'success',
        results: drivers.length,
        totalPages: 3,
        currentPage: page,
        data: drivers
      });
    } catch (error) {
      logger.error(`Error fetching drivers: ${(error as Error).message}`);
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'on_break', 'off_duty', 'inactive'].includes(status)) {
        return next(new AppError('Invalid status provided', 400));
      }

      // Mock driver status update
      const driver = {
        id,
        name: `Driver ${id.slice(-1)}`,
        status,
        updatedAt: new Date().toISOString()
      };

      res.status(200).json({
        status: 'success',
        data: driver
      });
    } catch (error) {
      logger.error(`Error updating driver status: ${(error as Error).message}`);
      next(error);
    }
  }

  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      const driver = await DriverService.updateLocation(id, {
        latitude,
        longitude,
        timestamp: new Date()
      });

      res.json({
        status: 'success',
        data: driver
      });
    } catch (error) {
      logger.error(`Error updating driver location: ${(error as Error).message}`);
      next(error);
    }
  }
} 