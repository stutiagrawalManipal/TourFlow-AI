import { getDb } from '../db/store.js';
import { findDestinationById, getSettings, updateSettings, getAllDestinations } from '../services/destinationService.js';
import { getCrowdInfo } from '../services/crowdService.js';
import { findBooking, changeStatus, withQueueInfo } from '../services/queueService.js';
import { getStats } from '../services/statsService.js';
import { clean } from '../models/Destination.js';
import { sendError } from './queueController.js';

// Admin view of a booking includes who booked it
function withUser(booking) {
  const user = getDb().users.find((u) => u.id === booking.userId);
  return { ...withQueueInfo(booking), user: user ? { name: user.name, email: user.email } : null };
}

// GET /api/admin/stats
export function stats(req, res) {
  res.json(getStats());
}

// GET /api/admin/bookings?search=&status=&destinationId=
export function listBookings(req, res) {
  const search = String(req.query.search || '').trim().toLowerCase();
  const { status, destinationId } = req.query;
  const users = new Map(getDb().users.map((u) => [u.id, u]));

  const result = getDb()
    .bookings.filter((b) => {
      if (status && b.status !== status) return false;
      if (destinationId && b.destinationId !== String(destinationId)) return false;
      if (!search) return true;
      const user = users.get(b.userId);
      return [b.bookingId, b.pass.code, b.destinationName, user?.name, user?.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200)
    .map(withUser);
  res.json(result);
}

// GET /api/admin/bookings/lookup/:code   (booking ID, pass code or QR text)
export function lookupBooking(req, res) {
  const booking = findBooking(req.params.code);
  if (!booking) return res.status(404).json({ error: 'No booking matches that ID or pass code.' });
  res.json(withUser(booking));
}

const STATUS_ACTIONS = { 'check-in': 'CHECKED_IN', 'check-out': 'CHECKED_OUT', cancel: 'CANCELLED' };

// POST /api/admin/bookings/:bookingId/(check-in|check-out|cancel)
export function updateBookingStatus(req, res) {
  const newStatus = STATUS_ACTIONS[req.params.action];
  if (!newStatus) return res.status(404).json({ error: 'Unknown action.' });
  try {
    const booking = changeStatus(req.params.bookingId, newStatus, { user: req.user, role: 'admin' });
    res.json(withUser(booking));
  } catch (err) {
    sendError(res, err);
  }
}

// GET /api/admin/queue/:destinationId   (waiting list in FIFO order + people inside)
export function destinationQueue(req, res) {
  const record = findDestinationById(req.params.destinationId);
  if (!record) return res.status(404).json({ error: 'Destination not found.' });
  const bookings = getDb().bookings.filter((b) => b.destinationId === String(record.id));
  res.json({
    destinationId: String(record.id),
    destinationName: clean(record.destination_name),
    crowd: getCrowdInfo(record),
    settings: getSettings(record.id),
    waiting: bookings.filter((b) => b.status === 'WAITING').sort((a, b) => a.ticketNumber - b.ticketNumber).map(withUser),
    inside: bookings.filter((b) => b.status === 'CHECKED_IN').sort((a, b) => a.checkedInAt.localeCompare(b.checkedInAt)).map(withUser),
  });
}

// GET /api/admin/crowd   (crowd estimate of every destination)
export function crowdOverview(req, res) {
  res.json(
    getAllDestinations().map((record) => ({
      destinationId: String(record.id),
      destinationName: clean(record.destination_name),
      state: clean(record.state),
      ...getCrowdInfo(record),
    }))
  );
}

// PATCH /api/admin/destinations/:destinationId/settings   { queueOpen, entryRatePerMinute, notice }
export function changeDestinationSettings(req, res) {
  const record = findDestinationById(req.params.destinationId);
  if (!record) return res.status(404).json({ error: 'Destination not found.' });
  const { errors, settings } = updateSettings(record.id, req.body || {});
  if (errors) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });
  res.json(settings);
}
