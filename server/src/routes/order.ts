import { Router } from 'express';
import { OrderController } from '../controllers/order';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Create new order
router.post('/', authMiddleware, OrderController.createOrder);

// Get order by ID
router.get('/:id', authMiddleware, OrderController.getOrder);

// Get customer's orders
router.get('/customer/orders', authMiddleware, OrderController.getCustomerOrders);

// Get driver's orders
router.get('/driver/orders', authMiddleware, OrderController.getDriverOrders);

// Get available orders for drivers
router.get('/available', authMiddleware, OrderController.getAvailableOrders);

// Place a bid on an order
router.post('/:orderId/bids', authMiddleware, OrderController.placeBid);

// Accept a bid
router.post('/bids/:bidId/accept', authMiddleware, OrderController.acceptBid);

// Complete payment for an order
router.post('/:orderId/payment', authMiddleware, OrderController.completePayment);

// Update order status
router.patch('/:orderId/status', authMiddleware, OrderController.updateStatus);

// Cancel order
router.post('/:orderId/cancel', authMiddleware, OrderController.cancelOrder);

export default router; 