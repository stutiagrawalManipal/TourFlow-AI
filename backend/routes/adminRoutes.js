import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import {
  stats,
  listBookings,
  lookupBooking,
  updateBookingStatus,
  destinationQueue,
  crowdOverview,
  changeDestinationSettings,
  getDestinationContent,
  putDestinationContent,
  putDestinationImages,
  auditLog,
} from '../controllers/adminController.js';

const router = Router();

// Every admin route needs a logged-in user whose role (from the database) is 'admin'
router.use(requireRole('admin'));

router.get('/stats', h(stats));
router.get('/bookings', h(listBookings));
router.get('/bookings/lookup/:code', h(lookupBooking));
router.post('/bookings/:bookingId/:action', h(updateBookingStatus)); // check-in | check-out | cancel | no-show
router.get('/queue/:destinationId', h(destinationQueue));
router.get('/crowd', h(crowdOverview));
router.patch('/destinations/:destinationId/settings', h(changeDestinationSettings));
router.get('/destinations/:destinationId/content', h(getDestinationContent));
router.put('/destinations/:destinationId/content', h(putDestinationContent));
router.put('/destinations/:destinationId/images', h(putDestinationImages));
router.get('/audit', h(auditLog));

export default router;
