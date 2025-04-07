import { Request, Response, NextFunction } from 'express';
import { RatingService } from '../services/ratingService';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';

export class RatingController {
  /**
   * Submit a new rating for a driver
   */
  static async submitRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId, jobId, value, comment, categories } = req.body;
      const customerId = req.user?.id;
      
      if (!driverId || !value || !customerId) {
        throw new AppError('Driver ID, rating value, and customer ID are required', 400);
      }

      const rating = await RatingService.submitRating({
        driverId,
        jobId,
        customerId,
        value,
        comment,
        categories
      });
      
      return res.status(201).json({
        status: 'success',
        data: {
          rating
        }
      });
    } catch (error) {
      logger.error('Failed to submit rating', error);
      return next(error);
    }
  }

  /**
   * Get ratings for a specific driver
   */
  static async getDriverRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      const { limit } = req.query;
      
      if (!driverId) {
        throw new AppError('Driver ID is required', 400);
      }

      const ratings = await RatingService.getDriverRatings(
        driverId,
        limit ? parseInt(limit as string, 10) : undefined
      );
      
      return res.status(200).json({
        status: 'success',
        data: {
          ratings
        }
      });
    } catch (error) {
      logger.error('Failed to get driver ratings', error);
      return next(error);
    }
  }

  /**
   * Get rating summary for a driver
   */
  static async getDriverRatingSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      
      if (!driverId) {
        throw new AppError('Driver ID is required', 400);
      }

      const summary = await RatingService.getDriverRatingSummary(driverId);
      
      return res.status(200).json({
        status: 'success',
        data: {
          summary
        }
      });
    } catch (error) {
      logger.error('Failed to get driver rating summary', error);
      return next(error);
    }
  }
} 