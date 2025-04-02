import express from 'express';
import { JobController } from '../controllers/jobController';
import { PaymentController } from '../controllers/paymentController';
import { DriverController } from '../controllers/driverController';
import { ActivityController } from '../controllers/activityController';
import { AnalyticsController } from '../controllers/analyticsController';
import { validate, idSchema, paginationSchema, jobSchemas, paymentSchemas, driverSchemas } from '../middleware/validation';
import { restrictTo } from '../middleware/auth';
import { UserRoles } from '../types/enums';

const router = express.Router();
const jobController = new JobController();
const paymentController = new PaymentController();
const driverController = new DriverController();
const activityController = new ActivityController();

// Ensure all routes are restricted to admins and managers
router.use(restrictTo(UserRoles.ADMIN, UserRoles.MANAGER));

// Job routes
router.get('/jobs/stats', jobController.getStats);
router.get('/jobs', jobController.getAllJobs);
router.patch('/jobs/:id/status', jobController.updateStatus);
router.post('/jobs/:id/assign', jobController.assignDriver);

// Payment routes
router.get('/payments/stats', paymentController.getStats);
router.get('/payments', paymentController.getAllPayments);
router.get('/payments/:id', paymentController.getPaymentDetails);
router.post('/payments/:id/process', paymentController.processPayment);

// Driver routes
router.get('/drivers/locations', driverController.getLocations);
router.get('/drivers', driverController.getAllDrivers);
router.patch('/drivers/:id/status', driverController.updateStatus);

// Activity routes
router.get('/activities/recent', activityController.getRecentActivities);

// Analytics routes
router.get('/analytics', AnalyticsController.getAnalytics);

export default router; 