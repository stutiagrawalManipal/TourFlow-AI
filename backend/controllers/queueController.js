import { validateBookingInput } from '../models/Booking.js';
import { findDestinationById } from '../services/destinationService.js';
import { createBooking, findBooking, listBookingsForUser, changeStatus, withQueueInfo, QueueError } from '../services/queueService.js';

function sendError(res, err) {
  if (err instanceof QueueError) return res.status(err.status).json({ error: err.message, ...err.extra });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

// POST /api/queue   { destinationId, numberOfPeople, requestId }   (tourists only)
export function joinQueue(req, res) {
  const input = req.body || {};

  // Business rules are checked on the server (max 4 people etc.)
  const error = validateBookingInput(input);
  if (error) return res.status(400).json({ error });

  const destination = findDestinationById(input.destinationId);
  if (!destination) return res.status(404).json({ error: `Destination ${input.destinationId} was not found.` });

  try {
    const { booking, duplicate } = createBooking({
      user: req.user,
      destination,
      numberOfPeople: input.numberOfPeople,
      requestId: input.requestId,
    });
    res.status(duplicate ? 200 : 201).json({ ...withQueueInfo(booking), duplicate });
  } catch (err) {
    sendError(res, err);
  }
}

// GET /api/queue/mine
export function myBookings(req, res) {
  res.json(listBookingsForUser(req.user.id));
}

// Tourists may only see their own bookings; admins may see all
function findAllowedBooking(req, res) {
  const booking = findBooking(req.params.bookingId);
  if (!booking || (req.user.role !== 'admin' && booking.userId !== req.user.id)) {
    res.status(404).json({ error: `Booking ${req.params.bookingId} was not found.` });
    return null;
  }
  return booking;
}

// GET /api/queue/:bookingId
export function getBooking(req, res) {
  const booking = findAllowedBooking(req, res);
  if (booking) res.json(withQueueInfo(booking));
}

// DELETE /api/queue/:bookingId   (owner cancels)
export function cancelBooking(req, res) {
  const booking = findAllowedBooking(req, res);
  if (!booking) return;
  try {
    const role = booking.userId === req.user.id ? 'owner' : req.user.role;
    res.json(withQueueInfo(changeStatus(booking.bookingId, 'CANCELLED', { user: req.user, role })));
  } catch (err) {
    sendError(res, err);
  }
}

export { sendError };
