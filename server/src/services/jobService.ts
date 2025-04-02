import { AppError } from '../middleware/error';
import { AppDataSource } from '../config/database';
import { Job } from '../entities/Job';
import { Driver } from '../entities/Driver';
import { ActivityService } from './activityService';

interface JobStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

interface JobQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export class JobService {
  private static jobRepository = AppDataSource.getRepository(Job);
  private static driverRepository = AppDataSource.getRepository(Driver);

  static async getStats(): Promise<JobStats> {
    const [
      total,
      active,
      completed,
      cancelled,
      revenue
    ] = await Promise.all([
      this.jobRepository.count(),
      this.jobRepository.count({ where: { status: 'active' } }),
      this.jobRepository.count({ where: { status: 'completed' } }),
      this.jobRepository.count({ where: { status: 'cancelled' } }),
      this.jobRepository
        .createQueryBuilder('job')
        .select('SUM(job.amount)', 'total')
        .where('job.status = :status', { status: 'completed' })
        .getRawOne()
        .then(result => result?.total || 0)
    ]);

    return {
      total,
      active,
      completed,
      cancelled,
      revenue: Number(revenue)
    };
  }

  static async getAllJobs(query: JobQuery): Promise<{ jobs: Job[]; total: number }> {
    const { status, page = 1, limit = 10 } = query;
    
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.driver', 'driver')
      .leftJoinAndSelect('job.payment', 'payment')
      .orderBy('job.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      queryBuilder.where('job.status = :status', { status });
    }

    const [jobs, total] = await queryBuilder.getManyAndCount();
    return { jobs, total };
  }

  static async updateStatus(jobId: string, status: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ 
      where: { id: jobId },
      relations: ['driver']
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (!['pending', 'active', 'completed', 'cancelled'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    job.status = status as Job['status'];
    await this.jobRepository.save(job);

    await ActivityService.logActivity(
      'job_updated',
      `Job ${jobId} status updated to ${status}`,
      { jobId, oldStatus: job.status, newStatus: status }
    );

    return job;
  }

  static async assignDriver(jobId: string, driverId: string): Promise<Job> {
    const [job, driver] = await Promise.all([
      this.jobRepository.findOne({ where: { id: jobId } }),
      this.driverRepository.findOne({ where: { id: driverId } })
    ]);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    if (driver.status !== 'available') {
      throw new AppError('Driver is not available', 400);
    }

    job.driver = driver;
    job.status = 'active';
    await this.jobRepository.save(job);

    driver.status = 'busy';
    await this.driverRepository.save(driver);

    await ActivityService.logActivity(
      'job_updated',
      `Job ${jobId} assigned to driver ${driverId}`,
      { jobId, driverId }
    );

    return job;
  }
} 