import express from 'express';
import { JobController } from '../controllers/jobController';
import { authenticateJWT, restrictTo } from '../middleware/auth';
import { UserRoles } from '../types/enums';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Public job routes (accessible to all authenticated users)
router.get('/:id', JobController.getJobDetails);
router.get('/:id/timeline', JobController.getJobTimeline);

// Admin-only routes
router.use(restrictTo(UserRoles.ADMIN));
router.get('/stats', JobController.getStats);
router.get('/', JobController.getAllJobs);
router.patch('/:id/status', JobController.updateStatus);
router.post('/:id/assign', JobController.assignDriver);

export default router; 