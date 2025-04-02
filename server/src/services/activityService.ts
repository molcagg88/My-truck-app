import { AppDataSource } from '../config/database';
import { Activity } from '../entities/Activity';

export class ActivityService {
  private static activityRepository = AppDataSource.getRepository(Activity);

  static async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return this.activityRepository.find({
      order: { timestamp: 'DESC' },
      take: limit
    });
  }

  static async logActivity(
    type: Activity['type'],
    description: string,
    metadata: Record<string, any>
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      type,
      description,
      metadata,
      timestamp: new Date()
    });

    return this.activityRepository.save(activity);
  }
} 