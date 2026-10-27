import {
  findDestinationById,
  settingsOf,
  updateSettings,
  updateContent,
  updateImages,
  findDestinations,
  MAX_IMAGES,
} from '../services/destinationService.js';
import { getQueueStats, getCrowdInfo } from '../services/crowdService.js';
import { findBookingForAdmin, changeStatus, getDestinationQueue, listBookingsForAdmin } from '../services/queueService.js';
import { getStats } from '../services/statsService.js';
import { listAudit } from '../services/auditService.js';
import { destinationName, clean, toAdminContent } from '../models/Destination.js';

const STATUSES = ['WAITING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'];

async function destinationOr404(req, res) {
  const row = await findDestinationById(req.params.destinationId);
  if (!row) res.status(404).json({ error: 'Destination not found.' });
  return row;
}

// GET /api/admin/stats
export async function stats(req, res) {
  res.json(await getStats());
}

// GET /api/admin/bookings?search=&status=&destinationId=
export async function listBookings(req, res) {
  const { search = '', status = '', destinationId = '' } = req.query;
  if (status && !STATUSES.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  res.json(await listBookingsForAdmin({ search: String(search).slice(0, 100), status, destinationId }));
}

// GET /api/admin/bookings/lookup/:code   (booking ID, pass code or QR text)
export async function lookupBooking(req, res) {
  const booking = await findBookingForAdmin(req.params.code);
  if (!booking) return res.status(404).json({ error: 'No booking matches that ID, pass code or QR text.' });
  res.json(booking);
}

const STATUS_ACTIONS = { 'check-in': 'CHECKED_IN', 'check-out': 'CHECKED_OUT', cancel: 'CANCELLED', 'no-show': 'NO_SHOW' };

// POST /api/admin/bookings/:bookingId/(check-in|check-out|cancel|no-show)   { reason?, override? }
export async function updateBookingStatus(req, res) {
  const newStatus = STATUS_ACTIONS[req.params.action];
  if (!newStatus) return res.status(404).json({ error: 'Unknown action.' });
  const { reason = null, override = false } = req.body || {};
  const booking = await changeStatus(req.params.bookingId, newStatus, req.user, { reason, override: override === true });
  res.json(booking);
}

// GET /api/admin/queue/:destinationId   (waiting list in FIFO order + people inside)
export async function destinationQueue(req, res) {
  const row = await destinationOr404(req, res);
  if (!row) return;
  const [queue, queueStats] = await Promise.all([getDestinationQueue(row.id), getQueueStats([row.id])]);
  res.json({
    destinationId: row.id,
    destinationName: destinationName(row.dataset, row.id),
    crowd: getCrowdInfo(row, queueStats.get(row.id)),
    settings: settingsOf(row),
    ...queue,
  });
}

// GET /api/admin/crowd   (crowd estimate of every destination)
export async function crowdOverview(req, res) {
  const [rows, queueStats] = await Promise.all([findDestinations(), getQueueStats()]);
  res.json(
    rows.map((row) => ({
      destinationId: row.id,
      destinationName: destinationName(row.dataset, row.id),
      state: clean(row.dataset.state),
      imageCount: Array.isArray(row.images) ? row.images.length : 0,
      ...getCrowdInfo(row, queueStats.get(row.id)),
    }))
  );
}

// PATCH /api/admin/destinations/:destinationId/settings   { queueOpen, entryRatePerMinute, maxQueuePeople, notice }
export async function changeDestinationSettings(req, res) {
  const row = await destinationOr404(req, res);
  if (!row) return;
  res.json(await updateSettings(row.id, req.body || {}, req.user));
}

// GET /api/admin/destinations/:destinationId/content   (editable content incl. unverified drafts)
export async function getDestinationContent(req, res) {
  const row = await destinationOr404(req, res);
  if (row) res.json({ ...toAdminContent(row), maxImages: MAX_IMAGES });
}

// PUT /api/admin/destinations/:destinationId/content
export async function putDestinationContent(req, res) {
  const row = await destinationOr404(req, res);
  if (!row) return;
  res.json(toAdminContent(await updateContent(row.id, req.body || {}, req.user)));
}

// PUT /api/admin/destinations/:destinationId/images   { images: [...] }
export async function putDestinationImages(req, res) {
  const row = await destinationOr404(req, res);
  if (!row) return;
  res.json(toAdminContent(await updateImages(row.id, (req.body || {}).images, req.user)));
}

// GET /api/admin/audit?action=&target=&actor=&before=
export async function auditLog(req, res) {
  const { action, target, actor, before, limit } = req.query;
  res.json(await listAudit({ action, targetId: target, actor, before, limit }));
}
