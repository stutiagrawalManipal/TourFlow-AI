import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import {
  stats,
  listBookings,
  lookupBooking,
  updateBookingStatus,
  destinationQueue,
  crowdOverview,
  changeDestinationSettings,
} from '../controllers/adminController.js';

const router = Router();

// Every admin route needs a logged-in user whose role (from the database) is 'admin'
router.use(requireRole('admin'));

router.get('/stats', stats);
router.get('/bookings', listBookings);
router.get('/bookings/lookup/:code', lookupBooking);
router.post('/bookings/:bookingId/:action', updateBookingStatus); // check-in | check-out | cancel
router.get('/queue/:destinationId', destinationQueue);
router.get('/crowd', crowdOverview);
router.patch('/destinations/:destinationId/settings', changeDestinationSettings);

export default router;
