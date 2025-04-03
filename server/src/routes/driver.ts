import express from 'express';
import { JobController } from '../controllers/jobController';
import { DriverController } from '../controllers/driverController';
import { restrictTo } from '../middleware/auth';
import { UserRoles } from '../types/enums';

const router = express.Router();
const jobController = new JobController();
const driverController = new DriverController();

// Ensure all routes are restricted to drivers only
router.use(restrictTo(UserRoles.DRIVER));

// Driver job management
router.get('/jobs', jobController.getAllJobs);
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

router.patch('/jobs/:id/status', jobController.updateStatus);

// Driver status and location management
router.patch('/status', async (req, res) => {
  const { status } = req.body;
  res.json({
    status: 'success',
    data: {
      id: 'driver-1',
      status,
      updatedAt: new Date().toISOString()
    }
  });
});

router.post('/location', async (req, res) => {
  const { latitude, longitude } = req.body;
  res.json({
    status: 'success',
    data: {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    }
  });
});

// Driver earnings
router.get('/earnings', async (req, res) => {
  res.json({
    status: 'success',
    data: {
      today: {
        amount: 120.50,
        jobs: 5
      },
      week: {
        amount: 750.75,
        jobs: 28
      },
      month: {
        amount: 3250.25,
        jobs: 115
      }
    }
  });
});

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