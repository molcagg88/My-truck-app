import express from 'express';
import { JobController } from '../controllers/jobController';
import { PaymentController } from '../controllers/paymentController';
import { DriverController } from '../controllers/driverController';
import { ActivityController } from '../controllers/activityController';
import { AnalyticsController } from '../controllers/analyticsController';
import { EarningController } from '../controllers/earningController';
import { RatingController } from '../controllers/ratingController';
import { validate, idSchema, paginationSchema, jobSchemas, paymentSchemas, driverSchemas } from '../middleware/validation';
import { restrictTo } from '../middleware/auth';
import { UserRoles } from '../types/enums';

const router = express.Router();

// Ensure all routes are restricted to admins and managers
router.use(restrictTo(UserRoles.ADMIN, UserRoles.MANAGER));

// Job routes
router.get('/jobs/stats', JobController.getStats);
router.get('/jobs', JobController.getAllJobs);
router.patch('/jobs/:id/status', JobController.updateStatus);
router.post('/jobs/:id/assign', JobController.assignDriver);

// Payment routes
router.get('/payments/stats', PaymentController.getStats);
router.get('/payments', PaymentController.getAllPayments);
router.get('/payments/:id', PaymentController.getPaymentDetails);
router.post('/payments/:id/process', PaymentController.processPayment);

// Driver routes
router.get('/drivers/locations', DriverController.getLocations);
router.get('/drivers', DriverController.getAllDrivers);
router.patch('/drivers/:id/status', DriverController.updateStatus);

// Activity routes
router.get('/activities/recent', ActivityController.getRecentActivities);

// Analytics routes
router.get('/analytics', AnalyticsController.getAnalytics);

// Driver management
router.get('/drivers/:driverId', async (req, res) => {
  // Detailed driver information for admin
  const { driverId } = req.params;
  res.json({
    status: 'success',
    data: {
      id: driverId,
      name: 'John Driver',
      email: 'driver@example.com',
      phone: '+1-555-123-4567',
      rating: 4.8,
      joinedDate: '2023-01-15',
      totalEarnings: 5678.90,
      completedJobs: 245,
      status: 'active',
      vehicleDetails: {
        model: 'Toyota Truck',
        licensePlate: 'ABC123',
        capacity: '2 tons',
        year: 2020
      }
    }
  });
});

// Earnings management
router.get('/drivers/:driverId/earnings', EarningController.getDriverEarnings);
router.get('/drivers/:driverId/earnings/summary', EarningController.getEarningsSummary);
router.post('/earnings/mark-paid', EarningController.markAsPaid);
router.post('/earnings/bonus', EarningController.addBonus);

// Ratings management
router.get('/drivers/:driverId/ratings', RatingController.getDriverRatings);
router.get('/drivers/:driverId/ratings/summary', RatingController.getDriverRatingSummary);

export default router; 