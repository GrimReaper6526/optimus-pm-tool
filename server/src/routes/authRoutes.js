import { Router } from 'express';
import { register, login, logout, refresh, getMe, updateProfile } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export { router as authRoutes };
