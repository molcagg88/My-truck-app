import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/jobService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error';
import { JobStatus } from '../types/enums';

export class JobController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await JobService.getStats();
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error(`Error fetching job stats: ${(error as Error).message}`);
      next(error);
    }
  }

  static async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await JobService.getAllJobs({ 
        status: status as string,
        page, 
        limit 
      });

      res.json({
        status: 'success',
        results: result.jobs.length,
        total: result.total,
        data: result.jobs
      });
    } catch (error) {
      logger.error(`Error fetching jobs: ${(error as Error).message}`);
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate the status is one of the enum values
      if (!status || !Object.values(JobStatus).includes(status as JobStatus)) {
        return next(new AppError(
          `Invalid status provided. Must be one of: ${Object.values(JobStatus).join(', ')}`,
          400
        ));
      }

      const job = await JobService.updateStatus(id, status as JobStatus);

      res.json({
        status: 'success',
        data: job
      });
    } catch (error) {
      logger.error(`Error updating job status: ${(error as Error).message}`);
      next(error);
    }
  }

  static async assignDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { driverId } = req.body;

      if (!driverId) {
        return next(new AppError('Driver ID is required', 400));
      }

      const job = await JobService.assignDriver(id, driverId);

      res.json({
        status: 'success',
        data: job
      });
    } catch (error) {
      logger.error(`Error assigning driver: ${(error as Error).message}`);
      next(error);
    }
  }

  static async getJobDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return next(new AppError('Job ID is required', 400));
      }

      const job = await JobService.getJobById(id);

      res.json({
        status: 'success',
        data: job
      });
    } catch (error) {
      logger.error(`Error fetching job details: ${(error as Error).message}`);
      next(error);
    }
  }

  static async getJobTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return next(new AppError('Job ID is required', 400));
      }

      const job = await JobService.getJobById(id);
      
      if (!job) {
        return next(new AppError('Job not found', 404));
      }
      
      // Convert statusTimestamps to a timeline format
      const timeline = [];
      
      if (job.statusTimestamps) {
        for (const [status, timestamp] of Object.entries(job.statusTimestamps)) {
          timeline.push({
            status,
            timestamp: new Date(timestamp),
            label: JobController.getStatusLabel(status as JobStatus)
          });
        }
      }
      
      // Sort by timestamp
      timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      res.json({
        status: 'success',
        data: {
          jobId: job.id,
          currentStatus: job.status,
          timeline
        }
      });
    } catch (error) {
      logger.error(`Error fetching job timeline: ${(error as Error).message}`);
      next(error);
    }
  }
  
  // Helper to get a user-friendly label for each status
  private static getStatusLabel(status: JobStatus): string {
    const statusLabels = {
      [JobStatus.PENDING]: 'Job Created',
      [JobStatus.ACTIVE]: 'Driver Assigned',
      [JobStatus.PICKUP_ARRIVED]: 'Driver Arrived at Pickup',
      [JobStatus.PICKUP_COMPLETED]: 'Pickup Completed',
      [JobStatus.DELIVERY_ARRIVED]: 'Driver Arrived at Delivery',
      [JobStatus.COMPLETED]: 'Job Completed',
      [JobStatus.CANCELLED]: 'Job Cancelled'
    };
    
    return statusLabels[status] || status;
  }
} 