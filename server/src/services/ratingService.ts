import { AppDataSource } from '../config/database';
import { Rating } from '../entities/Rating';
import { Driver } from '../entities/Driver';
import { Job } from '../entities/Job';
import { User } from '../entities/User';
import { AppError } from '../middleware/error';

interface RatingInput {
  driverId: string;
  jobId?: string;
  customerId: string;
  value: number;
  comment?: string;
  categories?: {
    punctuality?: number;
    service?: number;
    communication?: number;
    safety?: number;
    cleanliness?: number;
  };
}

interface RatingSummary {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  categories: {
    punctuality: number;
    service: number;
    communication: number;
    safety: number;
    cleanliness: number;
  };
  recent: Rating[];
}

export class RatingService {
  private static ratingRepository = AppDataSource.getRepository(Rating);
  private static driverRepository = AppDataSource.getRepository(Driver);
  private static jobRepository = AppDataSource.getRepository(Job);
  private static userRepository = AppDataSource.getRepository(User);

  /**
   * Submit a new rating for a driver
   */
  static async submitRating(ratingData: RatingInput): Promise<Rating> {
    const { driverId, jobId, customerId, value, comment, categories } = ratingData;

    // Validate rating value
    if (value < 1 || value > 5) {
      throw new AppError('Rating value must be between 1 and 5', 400);
    }

    // Check if driver exists
    const driver = await this.driverRepository.findOne({
      where: { id: driverId }
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    // Check if job exists if provided
    if (jobId) {
      const job = await this.jobRepository.findOne({
        where: { id: jobId, driverId }
      });

      if (!job) {
        throw new AppError('Job not found or does not belong to this driver', 404);
      }

      if (job.status !== 'completed') {
        throw new AppError('Cannot rate a job that is not completed', 400);
      }

      // Check if job was already rated
      const existingRating = await this.ratingRepository.findOne({
        where: { jobId, driverId }
      });

      if (existingRating) {
        throw new AppError('This job has already been rated', 400);
      }
    }

    // Create new rating
    const rating = this.ratingRepository.create({
      driverId,
      jobId,
      customerId,
      value,
      comment,
      categories
    });

    await this.ratingRepository.save(rating);

    // Update driver's average rating
    await this.updateDriverRating(driverId);

    return rating;
  }

  /**
   * Get ratings for a specific driver
   */
  static async getDriverRatings(driverId: string, limit = 10): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { driverId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  /**
   * Get rating summary for a driver
   */
  static async getDriverRatingSummary(driverId: string): Promise<RatingSummary> {
    // Check if driver exists
    const driver = await this.driverRepository.findOne({
      where: { id: driverId }
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    // Get all ratings for this driver
    const ratings = await this.ratingRepository.find({
      where: { driverId }
    });

    if (!ratings.length) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categories: {
          punctuality: 0,
          service: 0,
          communication: 0,
          safety: 0,
          cleanliness: 0
        },
        recent: []
      };
    }

    // Calculate average rating
    const totalValue = ratings.reduce((sum, rating) => sum + rating.value, 0);
    const average = totalValue / ratings.length;

    // Calculate distribution
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    ratings.forEach(rating => {
      distribution[rating.value as 1 | 2 | 3 | 4 | 5]++;
    });

    // Calculate category averages
    const categoryCounts = {
      punctuality: 0,
      service: 0,
      communication: 0,
      safety: 0,
      cleanliness: 0
    };
    
    const categoryTotals = {
      punctuality: 0,
      service: 0,
      communication: 0,
      safety: 0,
      cleanliness: 0
    };

    ratings.forEach(rating => {
      if (rating.categories) {
        if (rating.categories.punctuality) {
          categoryCounts.punctuality++;
          categoryTotals.punctuality += rating.categories.punctuality;
        }
        if (rating.categories.service) {
          categoryCounts.service++;
          categoryTotals.service += rating.categories.service;
        }
        if (rating.categories.communication) {
          categoryCounts.communication++;
          categoryTotals.communication += rating.categories.communication;
        }
        if (rating.categories.safety) {
          categoryCounts.safety++;
          categoryTotals.safety += rating.categories.safety;
        }
        if (rating.categories.cleanliness) {
          categoryCounts.cleanliness++;
          categoryTotals.cleanliness += rating.categories.cleanliness;
        }
      }
    });

    const categoryAverages = {
      punctuality: categoryCounts.punctuality ? categoryTotals.punctuality / categoryCounts.punctuality : 0,
      service: categoryCounts.service ? categoryTotals.service / categoryCounts.service : 0,
      communication: categoryCounts.communication ? categoryTotals.communication / categoryCounts.communication : 0,
      safety: categoryCounts.safety ? categoryTotals.safety / categoryCounts.safety : 0,
      cleanliness: categoryCounts.cleanliness ? categoryTotals.cleanliness / categoryCounts.cleanliness : 0
    };

    // Get most recent ratings
    const recentRatings = await this.ratingRepository.find({
      where: { driverId },
      order: { createdAt: 'DESC' },
      take: 5
    });

    return {
      average,
      total: ratings.length,
      distribution,
      categories: categoryAverages,
      recent: recentRatings
    };
  }

  /**
   * Update a driver's average rating
   */
  private static async updateDriverRating(driverId: string): Promise<void> {
    // Get all ratings for this driver
    const ratings = await this.ratingRepository.find({
      where: { driverId }
    });

    if (!ratings.length) {
      return;
    }

    // Calculate new average
    const totalValue = ratings.reduce((sum, rating) => sum + rating.value, 0);
    const average = parseFloat((totalValue / ratings.length).toFixed(2));

    // Update driver's rating
    await this.userRepository.update(
      { id: driverId }, 
      { rating: average }
    );
  }
} 