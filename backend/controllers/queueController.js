import { validateBookingInput } from '../models/Booking.js';
import { findDestinationById } from '../services/destinationService.js';
import { addToQueue, getBookingStatus } from '../services/queueService.js';

// POST /api/queue   body: { destinationId, numberOfPeople }
export function joinQueue(req, res) {
  const { destinationId, numberOfPeople } = req.body || {};

  // Business rule check (max 4 people) happens here on the server
  const error = validateBookingInput({ destinationId, numberOfPeople });
  if (error) {
    return res.status(400).json({ error });
  }

  const destination = findDestinationById(destinationId);
  if (!destination) {
    return res.status(404).json({ error: `Destination ${destinationId} not found` });
  }

  const booking = addToQueue(destination, numberOfPeople);
  res.status(201).json(booking);
}

// GET /api/queue/:bookingId
export function getQueueStatus(req, res) {
  const booking = getBookingStatus(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ error: `Booking ${req.params.bookingId} not found` });
  }
  res.json(booking);
}
