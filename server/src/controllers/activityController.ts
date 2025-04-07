import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activityService';
import { logger } from '../utils/logger';

export class ActivityController {
  static async getRecentActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 10;
      
      // Mock data for recent activities
      const activities = Array.from({ length: limit }, (_, i) => {
        const types = ['job_created', 'job_completed', 'payment_received', 'driver_assigned', 'status_changed'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let details;
        switch (type) {
          case 'job_created':
            details = { jobId: `job-${i + 1}`, customerName: `Customer ${i + 1}` };
            break;
          case 'job_completed':
            details = { jobId: `job-${i + 1}`, driverId: `driver-${Math.floor(Math.random() * 5) + 1}` };
            break;
          case 'payment_received':
            details = { paymentId: `payment-${i + 1}`, amount: `$${(Math.random() * 200 + 50).toFixed(2)}` };
            break;
          case 'driver_assigned':
            details = { jobId: `job-${i + 1}`, driverId: `driver-${Math.floor(Math.random() * 5) + 1}` };
            break;
          case 'status_changed':
            details = { 
              entityId: `${Math.random() > 0.5 ? 'job' : 'driver'}-${i + 1}`, 
              oldStatus: 'pending', 
              newStatus: 'active' 
            };
            break;
          default:
            details = {};
        }
        
        return {
          id: `activity-${i + 1}`,
          type,
          details,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 48 * 60 * 60 * 1000)).toISOString(),
          user: `user-${Math.floor(Math.random() * 3) + 1}`
        };
      });
      
      res.status(200).json({
        status: 'success',
        results: activities.length,
        data: activities
      });
    } catch (error) {
      logger.error(`Error fetching recent activities: ${(error as Error).message}`);
      next(error);
    }
  }
} 