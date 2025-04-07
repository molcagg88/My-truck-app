import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error';
import { AppDataSource } from '../config/database';
import { Payment } from '../entities/Payment';
import { Job } from '../entities/Job';
import { User } from '../entities/User';
import { JobStatus, PaymentStatus } from '../types/enums';

export class PaymentController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PaymentService.getStats();
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error(`Error fetching payment stats: ${(error as Error).message}`);
      next(error);
    }
  }

  static async getAllPayments(req: Request, res: Response, next: NextFunction) {
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

  static async getPaymentDetails(req: Request, res: Response, next: NextFunction) {
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

  static async processPayment(req: Request, res: Response, next: NextFunction) {
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

  static async completeJobPayment(req: Request, res: Response, next: NextFunction) {
    const { jobId } = req.params;
    const { paymentMethod } = req.body;

    try {
      // Check if job exists
      const jobRepository = AppDataSource.getRepository(Job);
      const job = await jobRepository.findOne({ 
        where: { id: jobId },
        relations: ['payment']
      });

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      // Verify job status
      if (job.status !== JobStatus.PAYMENT_PENDING) {
        throw new AppError('Job is not in payment pending status', 400);
      }

      // Verify user is the customer who created the job
      if (req.user?.id !== job.customerId) {
        throw new AppError('Unauthorized to complete this payment', 403);
      }

      // Update payment status
      const paymentRepository = AppDataSource.getRepository(Payment);
      let payment = job.payment;

      if (!payment) {
        // If payment record doesn't exist, create one
        payment = new Payment();
        payment.jobId = jobId;
        payment.amount = job.amount;
      }
      
      // Update payment details
      payment.status = PaymentStatus.COMPLETED;
      payment.metadata = {
        ...payment.metadata || {},
        paymentMethod,
        paidAt: new Date(),
        paidBy: req.user?.id
      };
      
      await paymentRepository.save(payment);

      // Update job status to ACTIVE
      job.status = JobStatus.ACTIVE;
      job.statusTimestamps = {
        ...job.statusTimestamps || {},
        [JobStatus.ACTIVE]: new Date()
      };
      
      await jobRepository.save(job);

      // Log the payment completion
      logger.info(`Payment completed for job ${jobId} using ${paymentMethod}`);

      return res.status(200).json({
        status: 'success',
        message: 'Payment completed successfully',
        data: {
          jobId,
          status: job.status,
          paymentStatus: payment.status
        }
      });
    } catch (error) {
      logger.error('Error completing job payment:', error);
      next(error);
    }
  }

  static async getPaymentById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment = await paymentRepository.findOne({
        where: { id },
        relations: ['job']
      });

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      return res.status(200).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      logger.error('Error fetching payment details:', error);
      next(error);
    }
  }

  static async getUserPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const paymentRepository = AppDataSource.getRepository(Payment);
      const payments = await paymentRepository
        .createQueryBuilder('payment')
        .innerJoin('payment.job', 'job')
        .where('job.customerId = :userId OR job.driverId = :userId', { userId })
        .orderBy('payment.createdAt', 'DESC')
        .getMany();

      return res.status(200).json({
        status: 'success',
        results: payments.length,
        data: payments
      });
    } catch (error) {
      logger.error('Error fetching user payments:', error);
      next(error);
    }
  }
} 