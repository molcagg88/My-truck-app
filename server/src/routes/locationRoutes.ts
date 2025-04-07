import { Router } from 'express';
import { updateLocation, getUserLocation, getNearbyUsers } from '../controllers/locationController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/location/update
 * @desc Update user location
 * @access Private
 */
router.post('/update', authenticateJWT, updateLocation);

/**
 * @route GET /api/location/user/:userId
 * @desc Get user's current location
 * @access Private
 */
router.get('/user/:userId', authenticateJWT, getUserLocation);

/**
 * @route GET /api/location/nearby
 * @desc Get nearby users of a specific type
 * @access Private
 */
router.get('/nearby', authenticateJWT, getNearbyUsers);

export default router; 