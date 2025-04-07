import express from 'express';
import biddingController from '../controllers/biddingController';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Driver routes
router.post('/create', checkRole(['driver']), biddingController.createBid);
router.get('/driver/bids', checkRole(['driver']), biddingController.getBidsByDriverId);

// Customer routes (only job owners can see bids for their jobs)
router.get('/job/:jobId', biddingController.getBidsByJobId);
router.post('/:bidId/accept', biddingController.acceptBid);
router.post('/:bidId/decline', biddingController.declineBid);
router.post('/:bidId/counter', biddingController.counterBid);

export default router; 