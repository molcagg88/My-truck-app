import { Router } from 'express';
import { OrderController } from '../controllers/order';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create new order
router.post('/', authenticate, OrderController.createOrder);

// Get order by ID
router.get('/:id', authenticate, OrderController.getOrder);

// Get customer's orders
router.get('/customer/orders', authenticate, OrderController.getCustomerOrders);

// Get driver's orders
router.get('/driver/orders', authenticate, OrderController.getDriverOrders);

// Get available orders for drivers
router.get('/available', authenticate, OrderController.getAvailableOrders);

// Place a bid on an order
router.post('/:orderId/bids', authenticate, OrderController.placeBid);

// Accept a bid
router.post('/bids/:bidId/accept', authenticate, OrderController.acceptBid);

// Complete payment for an order
router.post('/:orderId/payment', authenticate, OrderController.completePayment);

// Update order status
router.patch('/:orderId/status', authenticate, OrderController.updateStatus);

// Cancel order
router.post('/:orderId/cancel', authenticate, OrderController.cancelOrder);

export default router; 