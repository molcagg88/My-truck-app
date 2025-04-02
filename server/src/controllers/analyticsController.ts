import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error';
import { JobStatus, PaymentStatus } from '../types/enums';

export class AnalyticsController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeRange = 'week' } = req.query;

      // This would normally fetch from a database or analytics service
      // Here we're using mock data
      
      let data;
      switch (timeRange) {
        case 'day':
          data = generateDailyAnalytics();
          break;
        case 'week':
          data = generateWeeklyAnalytics();
          break;
        case 'month':
          data = generateMonthlyAnalytics();
          break;
        case 'year':
          data = generateYearlyAnalytics();
          break;
        default:
          return next(new AppError('Invalid time range. Use day, week, month, or year.', 400));
      }

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      console.error(`Error fetching analytics: ${(error as Error).message}`);
      next(error);
    }
  }
}

// Helper functions to generate mock analytics data

function generateDailyAnalytics() {
  const hourlyData = [];
  const now = new Date();
  
  // Generate data for last 24 hours
  for (let i = 0; i < 24; i++) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    
    hourlyData.push({
      timestamp: hour.toISOString(),
      jobsCreated: Math.floor(Math.random() * 5),
      jobsCompleted: Math.floor(Math.random() * 3),
      revenue: parseFloat((Math.random() * 300 + 50).toFixed(2))
    });
  }
  
  return {
    timeRange: 'day',
    data: hourlyData.reverse(),
    summary: calculateSummary(hourlyData)
  };
}

function generateWeeklyAnalytics() {
  const dailyData = [];
  const now = new Date();
  
  // Generate data for last 7 days
  for (let i = 0; i < 7; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    
    dailyData.push({
      timestamp: day.toISOString(),
      jobsCreated: Math.floor(Math.random() * 15 + 5),
      jobsCompleted: Math.floor(Math.random() * 12 + 3),
      revenue: parseFloat((Math.random() * 1200 + 300).toFixed(2))
    });
  }
  
  return {
    timeRange: 'week',
    data: dailyData.reverse(),
    summary: calculateSummary(dailyData)
  };
}

function generateMonthlyAnalytics() {
  const weeklyData = [];
  const now = new Date();
  
  // Generate data for last 4 weeks
  for (let i = 0; i < 4; i++) {
    const week = new Date(now);
    week.setDate(week.getDate() - (i * 7));
    week.setHours(0, 0, 0, 0);
    
    weeklyData.push({
      timestamp: week.toISOString(),
      jobsCreated: Math.floor(Math.random() * 80 + 20),
      jobsCompleted: Math.floor(Math.random() * 70 + 15),
      revenue: parseFloat((Math.random() * 5000 + 2000).toFixed(2))
    });
  }
  
  return {
    timeRange: 'month',
    data: weeklyData.reverse(),
    summary: calculateSummary(weeklyData)
  };
}

function generateYearlyAnalytics() {
  const monthlyData = [];
  const now = new Date();
  
  // Generate data for last 12 months
  for (let i = 0; i < 12; i++) {
    const month = new Date(now);
    month.setMonth(month.getMonth() - i);
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    
    monthlyData.push({
      timestamp: month.toISOString(),
      jobsCreated: Math.floor(Math.random() * 300 + 100),
      jobsCompleted: Math.floor(Math.random() * 280 + 80),
      revenue: parseFloat((Math.random() * 20000 + 8000).toFixed(2))
    });
  }
  
  return {
    timeRange: 'year',
    data: monthlyData.reverse(),
    summary: calculateSummary(monthlyData)
  };
}

function calculateSummary(data: any[]) {
  const totalJobs = data.reduce((sum, item) => sum + item.jobsCreated, 0);
  const completedJobs = data.reduce((sum, item) => sum + item.jobsCompleted, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  
  return {
    totalJobs,
    completedJobs,
    completionRate: totalJobs ? Math.round((completedJobs / totalJobs) * 100) : 0,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    averageRevenuePerJob: completedJobs ? parseFloat((totalRevenue / completedJobs).toFixed(2)) : 0
  };
} 