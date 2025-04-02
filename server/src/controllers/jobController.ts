import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/jobService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error';

export class JobController {
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await JobService.getStats();
      res.json(stats);
    } catch (error) {
      logger.error(`Error fetching job stats: ${(error as Error).message}`);
      next(error);
    }
  }

  getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
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

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['completed', 'in-progress', 'pending', 'cancelled'].includes(status)) {
        return next(new AppError('Invalid status provided', 400));
      }

      const job = await JobService.updateStatus(id, status);

      res.json({
        status: 'success',
        data: job
      });
    } catch (error) {
      logger.error(`Error updating job status: ${(error as Error).message}`);
      next(error);
    }
  }

  assignDriver = async (req: Request, res: Response, next: NextFunction) => {
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
} 