import { Router } from 'express';
import { UserRoles } from '../types/enums';
import { authMiddleware, restrictTo } from '../middleware/auth';
import { AuthController } from '../controllers/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/send-otp', authController.sendOTP);
router.post('/check-phone', authController.checkPhoneExists);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get('/me', authController.getMe);
router.patch('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);

// Admin only routes
router.get('/users', restrictTo(UserRoles.ADMIN), authController.getAllUsers);
router.get('/users/:id', restrictTo(UserRoles.ADMIN), authController.getUserById);
router.patch('/users/:id', restrictTo(UserRoles.ADMIN), authController.updateUser);
router.delete('/users/:id', restrictTo(UserRoles.ADMIN), authController.deleteUser);

export default router; 