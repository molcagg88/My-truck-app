import { AppError } from '../middleware/error';
import { AppDataSource } from '../config/database';
import { Driver } from '../entities/Driver';
import { ActivityService } from './activityService';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface DriverQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export class DriverService {
  private static driverRepository = AppDataSource.getRepository(Driver);

  static async getLocations(): Promise<Location[]> {
    const drivers = await this.driverRepository.find({
      where: [
        { status: 'available' },
        { status: 'busy' }
      ],
      select: ['currentLocation']
    });

    return drivers
      .map(driver => driver.currentLocation)
      .filter((location): location is Location => location !== null);
  }

  static async getAllDrivers(query: DriverQuery): Promise<{ drivers: Driver[]; total: number }> {
    const { status, page = 1, limit = 10 } = query;
    
    const queryBuilder = this.driverRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.jobs', 'jobs')
      .orderBy('driver.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      queryBuilder.where('driver.status = :status', { status });
    }

    const [drivers, total] = await queryBuilder.getManyAndCount();
    return { drivers, total };
  }

  static async updateStatus(driverId: string, status: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['jobs']
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    if (!['available', 'busy', 'offline'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    // Check if driver has active jobs when going offline
    if (status === 'offline' && driver.jobs.some(job => job.status === 'active')) {
      throw new AppError('Cannot go offline with active jobs', 400);
    }

    driver.status = status as Driver['status'];
    await this.driverRepository.save(driver);

    await ActivityService.logActivity(
      'driver_status_changed',
      `Driver ${driverId} status changed to ${status}`,
      { driverId, oldStatus: driver.status, newStatus: status }
    );

    return driver;
  }

  static async updateLocation(driverId: string, location: Location): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId }
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    if (!location || !location.latitude || !location.longitude) {
      throw new AppError('Invalid location data', 400);
    }

    driver.currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date()
    };

    await this.driverRepository.save(driver);
    return driver;
  }
} 