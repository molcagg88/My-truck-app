import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { CustomerController } from '../controllers/customer';

const router = Router();
const customerController = new CustomerController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Stats
router.get('/stats', customerController.getStats);

// Orders
router.get('/orders/active', customerController.getActiveOrders);
router.get('/orders/history', customerController.getOrderHistory);
router.get('/orders/:id', customerController.getOrderDetails);
router.post('/orders', customerController.createOrder);
router.post('/orders/:id/cancel', customerController.cancelOrder);
router.post('/orders/:id/rate', customerController.rateOrder);

// Locations
router.get('/locations/search', customerController.searchLocations);
router.get('/locations/saved', customerController.getSavedLocations);
router.post('/locations/saved', customerController.saveLocation);
router.delete('/locations/saved/:id', customerController.deleteSavedLocation);

// Truck Types
router.get('/truck-types', customerController.getTruckTypes);

// Payment related routes
router.get('/payments/pending', customerController.getPendingPayments);

export default router; 