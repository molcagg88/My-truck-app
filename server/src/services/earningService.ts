import { Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Earning } from '../entities/Earning';
import { Job } from '../entities/Job';
import { Driver } from '../entities/Driver';
import { AppError } from '../middleware/error';

interface EarningsQuery {
  driverId: string;
  startDate?: Date;
  endDate?: Date;
  type?: 'job_payment' | 'bonus' | 'adjustment' | 'tip';
  isPaid?: boolean;
}

interface EarningSummary {
  total: number;
  paid: number;
  pending: number;
  jobs: number;
  period: {
    start: Date;
    end: Date;
  };
  byType: {
    job_payment: number;
    bonus: number;
    tip: number;
    adjustment: number;
  };
}

export class EarningService {
  private static earningRepository = AppDataSource.getRepository(Earning);
  private static jobRepository = AppDataSource.getRepository(Job);
  private static driverRepository = AppDataSource.getRepository(Driver);

  /**
   * Create a new earning record when a job is completed
   */
  static async createJobEarning(jobId: string): Promise<Earning> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['driver']
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.status !== 'completed') {
      throw new AppError('Cannot create earning for a job that is not completed', 400);
    }

    if (!job.driver) {
      throw new AppError('Job has no assigned driver', 400);
    }

    // Create the earning record
    const earning = this.earningRepository.create({
      driverId: job.driver.id,
      jobId: job.id,
      amount: job.amount,
      type: 'job_payment',
      description: `Payment for job #${job.id}`,
      isPaid: false
    });

    return this.earningRepository.save(earning);
  }

  /**
   * Get earnings for a driver within a date range
   */
  static async getDriverEarnings(query: EarningsQuery): Promise<Earning[]> {
    const { driverId, startDate, endDate, type, isPaid } = query;

    const whereConditions: any = { driverId };

    if (startDate && endDate) {
      whereConditions.createdAt = Between(startDate, endDate);
    }

    if (type) {
      whereConditions.type = type;
    }

    if (isPaid !== undefined) {
      whereConditions.isPaid = isPaid;
    }

    return this.earningRepository.find({
      where: whereConditions,
      relations: ['job'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get earnings summary for a driver
   */
  static async getEarningsSummary(driverId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<EarningSummary> {
    // Check if driver exists
    const driver = await this.driverRepository.findOne({
      where: { id: driverId }
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Get all earnings for the period
    const earnings = await this.getDriverEarnings({
      driverId,
      startDate,
      endDate
    });

    // Calculate summary
    const jobCount = new Set(earnings.filter(e => e.jobId).map(e => e.jobId)).size;
    
    const totalAmount = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    const paidAmount = earnings.filter(e => e.isPaid).reduce((sum, earning) => sum + Number(earning.amount), 0);
    const pendingAmount = totalAmount - paidAmount;

    // Calculate by type
    const byType = {
      job_payment: 0,
      bonus: 0,
      tip: 0,
      adjustment: 0
    };

    for (const earning of earnings) {
      byType[earning.type] += Number(earning.amount);
    }

    return {
      total: totalAmount,
      paid: paidAmount,
      pending: pendingAmount,
      jobs: jobCount,
      period: {
        start: startDate,
        end: endDate
      },
      byType
    };
  }

  /**
   * Mark earnings as paid
   */
  static async markAsPaid(earningIds: string[]): Promise<Earning[]> {
    if (!earningIds.length) {
      throw new AppError('No earning IDs provided', 400);
    }

    const earnings = await this.earningRepository.find({
      where: earningIds.map(id => ({ id }))
    });

    if (earnings.length !== earningIds.length) {
      throw new AppError('Some earnings could not be found', 404);
    }

    // Mark all as paid
    for (const earning of earnings) {
      earning.isPaid = true;
      earning.paidAt = new Date();
    }

    return this.earningRepository.save(earnings);
  }

  /**
   * Add a bonus or adjustment to driver earnings
   */
  static async addBonus(
    driverId: string, 
    amount: number, 
    type: 'bonus' | 'adjustment' | 'tip', 
    description: string
  ): Promise<Earning> {
    if (amount <= 0) {
      throw new AppError('Amount must be greater than zero', 400);
    }

    const driver = await this.driverRepository.findOne({
      where: { id: driverId }
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    const earning = this.earningRepository.create({
      driverId,
      amount,
      type,
      description,
      isPaid: false
    });

    return this.earningRepository.save(earning);
  }
} 