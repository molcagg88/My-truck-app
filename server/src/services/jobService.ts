import { AppError } from '../middleware/error';
import { AppDataSource } from '../config/database';
import { Job } from '../entities/Job';
import { Driver } from '../entities/Driver';
import { ActivityService } from './activityService';
import { EarningService } from './earningService';
import { JobStatus } from '../types/enums';
import { logger } from '../utils/logger';

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

// Define the allowed status transitions
const STATUS_TRANSITIONS = {
  [JobStatus.PENDING]: [JobStatus.ACTIVE, JobStatus.CANCELLED],
  [JobStatus.ACTIVE]: [JobStatus.PICKUP_ARRIVED, JobStatus.CANCELLED],
  [JobStatus.PICKUP_ARRIVED]: [JobStatus.PICKUP_COMPLETED, JobStatus.CANCELLED],
  [JobStatus.PICKUP_COMPLETED]: [JobStatus.DELIVERY_ARRIVED, JobStatus.CANCELLED],
  [JobStatus.DELIVERY_ARRIVED]: [JobStatus.COMPLETED, JobStatus.CANCELLED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.CANCELLED]: []
};

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
      this.jobRepository.count({ 
        where: [
          { status: JobStatus.ACTIVE },
          { status: JobStatus.PICKUP_ARRIVED },
          { status: JobStatus.PICKUP_COMPLETED },
          { status: JobStatus.DELIVERY_ARRIVED }
        ]
      }),
      this.jobRepository.count({ where: { status: JobStatus.COMPLETED } }),
      this.jobRepository.count({ where: { status: JobStatus.CANCELLED } }),
      this.jobRepository
        .createQueryBuilder('job')
        .select('SUM(job.amount)', 'total')
        .where('job.status = :status', { status: JobStatus.COMPLETED })
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

  static async updateStatus(jobId: string, newStatus: JobStatus): Promise<Job> {
    const job = await this.jobRepository.findOne({ 
      where: { id: jobId },
      relations: ['driver']
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    const currentStatus = job.status;

    // Check if the status transition is valid
    if (!STATUS_TRANSITIONS[currentStatus].includes(newStatus)) {
      throw new AppError(
        `Invalid status transition. Cannot change from ${currentStatus} to ${newStatus}`,
        400
      );
    }

    // Handle specific status transitions
    try {
      await this.handleStatusTransition(job, newStatus);

      // Update job status
      job.status = newStatus;
      
      // Add timestamp for the current status
      const statusTimestamps = job.statusTimestamps || {};
      statusTimestamps[newStatus] = new Date();
      job.statusTimestamps = statusTimestamps;
      
      await this.jobRepository.save(job);

      // Log the activity
      await ActivityService.logActivity(
        'job_updated',
        `Job ${jobId} status updated from ${currentStatus} to ${newStatus}`,
        { jobId, oldStatus: currentStatus, newStatus }
      );

      // Special handling for completed jobs
      if (newStatus === JobStatus.COMPLETED) {
        try {
          await EarningService.createJobEarning(jobId);
        } catch (error) {
          logger.error(`Failed to create earning for completed job ${jobId}`, error);
          // Don't fail the status update if earnings creation fails
        }
      }

      return job;
    } catch (error) {
      logger.error(`Error updating job status: ${error.message}`, error);
      throw new AppError(`Failed to update job status: ${error.message}`, 500);
    }
  }

  /**
   * Handle specific logic for each status transition
   */
  private static async handleStatusTransition(job: Job, newStatus: JobStatus): Promise<void> {
    const driver = job.driver;
    
    if (!driver && newStatus !== JobStatus.CANCELLED && job.status === JobStatus.PENDING) {
      throw new AppError('Cannot update job status: No driver assigned', 400);
    }

    switch (newStatus) {
      case JobStatus.ACTIVE:
        // When a job becomes active, update driver status if needed
        if (driver && driver.status !== 'busy') {
          driver.status = 'busy';
          await this.driverRepository.save(driver);
        }
        break;
        
      case JobStatus.COMPLETED:
        // When a job is completed, make the driver available again
        if (driver) {
          driver.status = 'available';
          await this.driverRepository.save(driver);
        }
        break;
        
      case JobStatus.CANCELLED:
        // When a job is cancelled, make the driver available again if they were assigned
        if (driver) {
          driver.status = 'available';
          await this.driverRepository.save(driver);
        }
        break;
        
      // Other status transitions don't need special handling
      default:
        break;
    }
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

    if (job.status !== JobStatus.PENDING) {
      throw new AppError(`Cannot assign driver to job with status ${job.status}`, 400);
    }

    job.driver = driver;
    job.status = JobStatus.ACTIVE;
    
    // Initialize status timestamps
    const statusTimestamps = job.statusTimestamps || {};
    statusTimestamps[JobStatus.ACTIVE] = new Date();
    job.statusTimestamps = statusTimestamps;
    
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

  /**
   * Get job by ID with details
   */
  static async getJobById(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['driver', 'payment']
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    return job;
  }
} 