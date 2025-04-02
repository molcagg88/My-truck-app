import { AppError } from '../middleware/error';
import { AppDataSource } from '../config/database';
import { Payment } from '../entities/Payment';
import { ActivityService } from './activityService';

interface PaymentStats {
  total: number;
  pending: number;
  processed: number;
  failed: number;
  totalAmount: number;
}

interface PaymentQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export class PaymentService {
  private static paymentRepository = AppDataSource.getRepository(Payment);

  static async getStats(): Promise<PaymentStats> {
    const [
      total,
      pending,
      processed,
      failed,
      totalAmount
    ] = await Promise.all([
      this.paymentRepository.count(),
      this.paymentRepository.count({ where: { status: 'pending' } }),
      this.paymentRepository.count({ where: { status: 'processed' } }),
      this.paymentRepository.count({ where: { status: 'failed' } }),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: 'processed' })
        .getRawOne()
        .then(result => result?.total || 0)
    ]);

    return {
      total,
      pending,
      processed,
      failed,
      totalAmount: Number(totalAmount)
    };
  }

  static async getAllPayments(query: PaymentQuery): Promise<{ payments: Payment[]; total: number }> {
    const { status, page = 1, limit = 10 } = query;
    
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.job', 'job')
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      queryBuilder.where('payment.status = :status', { status });
    }

    const [payments, total] = await queryBuilder.getManyAndCount();
    return { payments, total };
  }

  static async getPaymentDetails(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['job']
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  static async processPayment(paymentId: string, action: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['job']
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (!['approve', 'reject', 'refund'].includes(action)) {
      throw new AppError('Invalid action', 400);
    }

    if (payment.status === 'processed' && action !== 'refund') {
      throw new AppError('Payment has already been processed', 400);
    }

    payment.status = action === 'approve' ? 'processed' : 'failed';
    await this.paymentRepository.save(payment);

    await ActivityService.logActivity(
      'payment_processed',
      `Payment ${paymentId} ${action}ed`,
      { paymentId, action, jobId: payment.jobId }
    );

    return payment;
  }
}