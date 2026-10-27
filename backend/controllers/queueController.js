import { validateBookingInput } from '../models/Booking.js';
import { createBooking, findBooking, listBookingsForUser, changeStatus, withQueueInfo } from '../services/queueService.js';

// POST /api/queue   { destinationId, numberOfPeople, requestId }   (tourists only)
export async function joinQueue(req, res) {
  const input = req.body || {};

  // Business rules are checked on the server (max 4 people etc.)
  const error = validateBookingInput(input);
  if (error) return res.status(400).json({ error });

  const { booking, duplicate } = await createBooking({
    user: req.user,
    destinationId: String(input.destinationId),
    numberOfPeople: Number(input.numberOfPeople),
    requestId: String(input.requestId),
  });
  res.status(duplicate ? 200 : 201).json({ ...booking, duplicate });
}

// GET /api/queue/mine   (booking history of the logged-in tourist)
export async function myBookings(req, res) {
  res.json(await listBookingsForUser(req.user.id));
}

// Tourists may only see their own bookings; admins may see all
async function findAllowedBooking(req, res) {
  const booking = await findBooking(req.params.bookingId);
  if (!booking || (req.user.role !== 'admin' && booking.userId !== req.user.id)) {
    res.status(404).json({ error: `Booking ${req.params.bookingId} was not found.` });
    return null;
  }
  return booking;
}

// GET /api/queue/:bookingId
export async function getBooking(req, res) {
  const booking = await findAllowedBooking(req, res);
  if (booking) res.json(await withQueueInfo(booking));
}

// DELETE /api/queue/:bookingId   (owner cancels; admins use the admin endpoint with a reason)
export async function cancelBooking(req, res) {
  const booking = await findAllowedBooking(req, res);
  if (!booking) return;
  res.json(await changeStatus(booking.bookingId, 'CANCELLED', req.user, { reason: (req.body || {}).reason }));
}
