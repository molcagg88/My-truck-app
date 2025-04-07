import express from 'express';
import { JobController } from '../controllers/jobController';
import { DriverController } from '../controllers/driverController';
import { EarningController } from '../controllers/earningController';
import { RatingController } from '../controllers/ratingController';
import { restrictTo } from '../middleware/auth';
import { UserRoles } from '../types/enums';

const router = express.Router();

// Ensure all routes are restricted to drivers only
router.use(restrictTo(UserRoles.DRIVER));

// Driver job management
router.get('/jobs', JobController.getAllJobs);
router.get('/jobs/:id', async (req, res) => {
  // Get job details for a specific job assigned to this driver
  const { id } = req.params;
  res.json({
    status: 'success',
    data: {
      id,
      customer: 'John Doe',
      pickup: '123 Main St',
      dropoff: '456 Elm St',
      status: 'in-progress',
      paymentStatus: 'pending',
      estimatedTime: '30 mins',
      orderDetails: {
        items: ['Furniture', 'Boxes'],
        specialInstructions: 'Handle with care'
      }
    }
  });
});

router.patch('/jobs/:id/status', JobController.updateStatus);

// Driver status and location management
router.patch('/status', DriverController.updateStatus);
router.post('/location', DriverController.updateLocation);

// Driver earnings
router.get('/earnings', EarningController.getDriverEarnings);
router.get('/earnings/summary', EarningController.getEarningsSummary);

// Driver ratings
router.get('/ratings', RatingController.getDriverRatings);
router.get('/ratings/summary', RatingController.getDriverRatingSummary);

// Driver profile
router.get('/profile', async (req, res) => {
  res.json({
    status: 'success',
    data: {
      id: 'driver-1',
      name: 'John Driver',
      email: 'driver@example.com',
      phone: '+1-555-123-4567',
      rating: 4.8,
      joinedDate: '2023-01-15',
      vehicleDetails: {
        model: 'Toyota Truck',
        licensePlate: 'ABC123',
        capacity: '2 tons'
      }
    }
  });
});

export default router; 