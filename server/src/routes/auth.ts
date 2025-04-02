import express from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();

// Authentication routes
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

export default router; 