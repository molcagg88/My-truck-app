import { Request, Response, NextFunction } from 'express';
import { EarningService } from '../services/earningService';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';

export class EarningController {
  /**
   * Get earnings for a driver with optional filters
   */
  static async getDriverEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.params.driverId || req.user?.id;
      
      if (!driverId) {
        throw new AppError('Driver ID is required', 400);
      }

      const { startDate, endDate, type, isPaid } = req.query;
      
      const query = {
        driverId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        type: type as "job_payment" | "bonus" | "adjustment" | "tip" | undefined,
        isPaid: isPaid === 'true' ? true : isPaid === 'false' ? false : undefined
      };

      const earnings = await EarningService.getDriverEarnings(query);
      
      return res.status(200).json({
        status: 'success',
        data: {
          earnings
        }
      });
    } catch (error) {
      logger.error('Failed to get driver earnings', error);
      return next(error);
    }
  }

  /**
   * Get earnings summary for a driver
   */
  static async getEarningsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.params.driverId || req.user?.id;
      
      if (!driverId) {
        throw new AppError('Driver ID is required', 400);
      }

      const { period = 'month' } = req.query;
      
      const summary = await EarningService.getEarningsSummary(
        driverId,
        period as 'day' | 'week' | 'month' | 'year'
      );
      
      return res.status(200).json({
        status: 'success',
        data: {
          summary
        }
      });
    } catch (error) {
      logger.error('Failed to get earnings summary', error);
      return next(error);
    }
  }

  /**
   * Mark earnings as paid (admin only)
   */
  static async markAsPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const { earningIds } = req.body;
      
      if (!earningIds || !Array.isArray(earningIds) || earningIds.length === 0) {
        throw new AppError('Earning IDs array is required', 400);
      }

      await EarningService.markAsPaid(earningIds);
      
      return res.status(200).json({
        status: 'success',
        message: 'Earnings marked as paid'
      });
    } catch (error) {
      logger.error('Failed to mark earnings as paid', error);
      return next(error);
    }
  }

  /**
   * Add a bonus to driver's earnings (admin only)
   */
  static async addBonus(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId, amount, type = 'bonus', description } = req.body;
      
      if (!driverId || !amount) {
        throw new AppError('Driver ID and amount are required', 400);
      }

      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400);
      }

      const earning = await EarningService.addBonus(
        driverId, 
        amount, 
        type as 'bonus' | 'adjustment' | 'tip',
        description
      );
      
      return res.status(201).json({
        status: 'success',
        data: {
          earning
        }
      });
    } catch (error) {
      logger.error('Failed to add bonus', error);
      return next(error);
    }
  }
} 