import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error';

export class PaymentController {
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await PaymentService.getStats();
      res.json(stats);
    } catch (error) {
      logger.error(`Error fetching payment stats: ${(error as Error).message}`);
      next(error);
    }
  }

  getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await PaymentService.getAllPayments({ 
        status: status as string,
        page, 
        limit 
      });

      res.json({
        status: 'success',
        results: result.payments.length,
        total: result.total,
        data: result.payments
      });
    } catch (error) {
      logger.error(`Error fetching payments: ${(error as Error).message}`);
      next(error);
    }
  }

  getPaymentDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const payment = await PaymentService.getPaymentDetails(id);

      res.json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      logger.error(`Error fetching payment details: ${(error as Error).message}`);
      next(error);
    }
  }

  processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (!action || !['approve', 'reject', 'refund'].includes(action)) {
        return next(new AppError('Invalid action provided', 400));
      }

      const payment = await PaymentService.processPayment(id, action);

      res.json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      logger.error(`Error processing payment: ${(error as Error).message}`);
      next(error);
    }
  }
} 