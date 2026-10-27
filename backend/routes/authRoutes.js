import { Router } from 'express';
import { register, touristLogin, adminLogin, me, logoutUser, updateProfile, updatePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/security.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: config.authRateLimit, message: 'Too many attempts from this network. Please wait 15 minutes.' });

router.post('/register', authLimiter, h(register));          // tourists only
router.post('/login', authLimiter, h(touristLogin));         // tourist login
router.post('/admin/login', authLimiter, h(adminLogin));     // separate admin login
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, h(updateProfile));
router.post('/change-password', requireAuth, authLimiter, h(updatePassword));
router.post('/logout', requireAuth, h(logoutUser));

export default router;
