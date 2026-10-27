import { Router } from 'express';
import { joinQueue, myBookings, getBooking, cancelBooking } from '../controllers/queueController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/security.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';

const router = Router();
const bookingLimiter = rateLimit({ windowMs: 60 * 1000, max: config.bookingRateLimit, key: (req) => req.user.id });

router.post('/', requireRole('tourist'), bookingLimiter, h(joinQueue));   // book (tourists only)
router.get('/mine', requireAuth, h(myBookings));                          // my booking history
router.get('/:bookingId', requireAuth, h(getBooking));                    // owner or admin
router.delete('/:bookingId', requireAuth, h(cancelBooking));              // owner (admins: see adminRoutes)

export default router;
