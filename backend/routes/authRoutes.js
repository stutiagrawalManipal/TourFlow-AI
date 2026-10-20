import { Router } from 'express';
import { register, touristLogin, adminLogin, me, logoutUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);          // tourists only
router.post('/login', touristLogin);         // tourist login
router.post('/admin/login', adminLogin);     // separate admin login
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logoutUser);

export default router;
