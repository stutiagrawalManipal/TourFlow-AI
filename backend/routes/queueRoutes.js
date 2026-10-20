import { Router } from 'express';
import { joinQueue, myBookings, getBooking, cancelBooking } from '../controllers/queueController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireRole('tourist'), joinQueue);          // book (tourists only)
router.get('/mine', requireAuth, myBookings);                 // my bookings
router.get('/:bookingId', requireAuth, getBooking);           // owner or admin
router.delete('/:bookingId', requireAuth, cancelBooking);     // owner or admin

export default router;
