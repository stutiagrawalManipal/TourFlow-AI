import { randomBytes } from 'crypto';
import { getDb, transaction } from '../db/store.js';
import { BOOKING_STATUS, TRANSITIONS, isActive } from '../models/Booking.js';
import { clean } from '../models/Destination.js';
import { getSettings } from './destinationService.js';
import { getEntryRate, estimateWaitMinutes } from './crowdService.js';

/**
 * Queue service - one FIFO queue per destination.
 * - Each new booking gets the next ticket number of that destination's queue.
 * - Queue position = place among WAITING bookings ordered by ticket number,
 *   so it always matches the stored booking order.
 * - All changes happen inside transaction() with no awaits, so two requests
 *   arriving at the same time cannot get the same ticket number.
 */
export class QueueError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

function newId(prefix, length, existing) {
  let id;
  do {
    id = prefix + randomBytes(length).toString('hex').toUpperCase();
  } while (existing.has(id));
  return id;
}

function waitingQueue(bookings, destinationId) {
  return bookings
    .filter((b) => b.destinationId === destinationId && b.status === BOOKING_STATUS.WAITING)
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
}

// Booking + its current position and estimated wait
export function withQueueInfo(booking) {
  const bookings = getDb().bookings;
  if (booking.status !== BOOKING_STATUS.WAITING) {
    return { ...booking, queuePosition: null, peopleAhead: 0, estimatedWaitMinutes: 0 };
  }
  const queue = waitingQueue(bookings, booking.destinationId);
  const index = queue.findIndex((b) => b.bookingId === booking.bookingId);
  const peopleAhead = queue.slice(0, index).reduce((sum, b) => sum + b.numberOfPeople, 0);
  const entryRate = getEntryRate(booking.destinationId, bookings);
  return {
    ...booking,
    queuePosition: index + 1,
    peopleAhead,
    estimatedWaitMinutes: estimateWaitMinutes(peopleAhead, entryRate),
    entryRateMeasured: entryRate.measured,
  };
}

export function createBooking({ user, destination, numberOfPeople, requestId }) {
  const destinationId = String(destination.id);

  return transaction((db) => {
    // 1. Same request sent twice (double click / network retry) -> return the first booking
    if (requestId) {
      const repeat = db.bookings.find((b) => b.userId === user.id && b.requestId === requestId);
      if (repeat) return { booking: repeat, duplicate: true };
    }

    // 2. Queue closed by staff
    if (!getSettings(destinationId).queueOpen) {
      throw new QueueError(`The queue for ${clean(destination.destination_name)} is closed right now.`, 409);
    }

    // 3. One active booking per tourist per destination
    const existing = db.bookings.find((b) => b.userId === user.id && b.destinationId === destinationId && isActive(b));
    if (existing) {
      throw new QueueError(`You already have an active booking (${existing.bookingId}) for this destination.`, 409, {
        bookingId: existing.bookingId,
      });
    }

    // 4. Next ticket number for this queue (FIFO order)
    const ticketNumber = (db.queueCounters[destinationId] || 0) + 1;
    db.queueCounters[destinationId] = ticketNumber;

    const now = new Date().toISOString();
    const booking = {
      bookingId: newId('TF-', 3, new Set(db.bookings.map((b) => b.bookingId))),
      userId: user.id,
      destinationId,
      destinationName: clean(destination.destination_name),
      destinationLocation: [clean(destination.district), clean(destination.state)].filter(Boolean).join(', '),
      numberOfPeople: Number(numberOfPeople),
      ticketNumber,
      positionAtBooking: waitingQueue(db.bookings, destinationId).length + 1,
      status: BOOKING_STATUS.WAITING,
      requestId: requestId || null,
      // queue pass: the QR code contains the booking ID and this secret code
      pass: { code: randomBytes(4).toString('hex').toUpperCase(), issuedAt: now },
      createdAt: now,
      checkedInAt: null,
      checkedOutAt: null,
      cancelledAt: null,
      history: [{ status: BOOKING_STATUS.WAITING, at: now, by: user.id }],
    };
    db.bookings.push(booking);
    return { booking, duplicate: false };
  });
}

export function findBooking(bookingIdOrPassCode) {
  const key = String(bookingIdOrPassCode || '').trim().toUpperCase();
  // accept the full QR text too: "TOURFLOW:TF-ABC123:1A2B3C4D"
  const parts = key.split(':');
  const bookingId = parts[0] === 'TOURFLOW' ? parts[1] : key;
  return getDb().bookings.find((b) => b.bookingId === bookingId || b.pass.code === key) || null;
}

export function listBookingsForUser(userId) {
  return getDb()
    .bookings.filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(withQueueInfo);
}

/**
 * Change a booking's status, checking the allowed transitions.
 * actor = { user, role: 'owner' | 'admin' }
 */
export function changeStatus(bookingId, newStatus, actor) {
  const booking = findBooking(bookingId);
  if (!booking) throw new QueueError(`Booking ${bookingId} was not found.`, 404);

  const allowedRoles = TRANSITIONS[booking.status]?.[newStatus];
  if (!allowedRoles) {
    throw new QueueError(`A ${booking.status.replace('_', ' ').toLowerCase()} booking cannot be changed to ${newStatus.replace('_', ' ').toLowerCase()}.`, 409);
  }
  if (!allowedRoles.includes(actor.role)) {
    throw new QueueError('You are not allowed to make this change.', 403);
  }

  return transaction(() => {
    const now = new Date().toISOString();
    booking.status = newStatus;
    if (newStatus === BOOKING_STATUS.CHECKED_IN) booking.checkedInAt = now;
    if (newStatus === BOOKING_STATUS.CHECKED_OUT) booking.checkedOutAt = now;
    if (newStatus === BOOKING_STATUS.CANCELLED) booking.cancelledAt = now;
    booking.history.push({ status: newStatus, at: now, by: actor.user.id });
    return booking;
  });
}
