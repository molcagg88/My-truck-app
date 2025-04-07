import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import * as telebirrPaymentController from '../controllers/telebirrPaymentController';
import * as paymentController from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Root payments endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Payment API is working'
  });
});

// Create a payment
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      message: 'Payment created',
      success: true
    });
  } catch (error) {
    next(error);
  }
});

// Telebirr payment endpoints
router.post('/telebirr/create', telebirrPaymentController.createPayment);
router.get('/telebirr/status/:outTradeNo', telebirrPaymentController.checkPaymentStatus);
router.get('/telebirr/success/:outTradeNo', telebirrPaymentController.successPage);
router.get('/telebirr/failure/:outTradeNo', telebirrPaymentController.failurePage);
router.get('/telebirr/cancel/:outTradeNo', telebirrPaymentController.cancelPage);

// Protected routes that require authentication
router.use(authMiddleware);

// Job Payment - used when a driver accepts a job and customer needs to pay
router.post('/job/:jobId/complete', paymentController.completeJobPayment);

// Get payment details
router.get('/details/:id', paymentController.getPaymentById);

// Get all payments for a user
router.get('/user', paymentController.getUserPayments);

export default router; 