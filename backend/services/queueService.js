import { randomBytes } from 'crypto';
import { query, withTransaction } from '../db/pool.js';
import { BOOKING_STATUS, TRANSITIONS, ACTIVE_STATUSES, toBooking, validateReason } from '../models/Booking.js';
import { clean, destinationName, destinationLocation } from '../models/Destination.js';
import { getQueueStats, entryRate, estimateWaitMinutes } from './crowdService.js';
import { recordAudit } from './auditService.js';

/**
 * Queue service - one FIFO queue per destination, stored in PostgreSQL.
 *
 * How FIFO is guaranteed:
 * - Creating a booking locks that destination's row (SELECT ... FOR UPDATE), so
 *   bookings for the same destination are processed strictly one at a time.
 * - Inside the lock the next ticket number is taken from destinations.last_ticket_number.
 *   A UNIQUE (destination_id, ticket_number) constraint makes duplicates impossible.
 * - Queue position = number of WAITING bookings with a smaller ticket number + 1.
 *   It is always calculated from the stored data, never stored or edited by hand.
 * - Only the booking at the front may be checked in (or marked no-show).
 *   Anything else is an override that needs a written reason and is audited.
 * - Everything for one action (lock, checks, insert/update, audit entry) runs in
 *   ONE transaction: if any step fails, nothing is saved.
 */
export class QueueError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const BOOKING_SELECT = `
  SELECT b.*, d.dataset->>'destination_name' AS d_name, d.dataset->>'district' AS d_district, d.dataset->>'state' AS d_state
  FROM bookings b JOIN destinations d ON d.id = b.destination_id`;

function rowToBooking(row) {
  const dataset = { destination_name: row.d_name, district: row.d_district, state: row.d_state };
  return toBooking({
    ...row,
    destination_name: destinationName(dataset, row.destination_id),
    destination_location: destinationLocation(dataset),
  });
}

/** Adds queuePosition, peopleAhead and estimatedWaitMinutes to WAITING bookings */
async function addQueueInfo(bookings, client = null) {
  const run = client ? client.query.bind(client) : query;
  const waiting = bookings.filter((b) => b.status === BOOKING_STATUS.WAITING);
  const destinationIds = [...new Set(waiting.map((b) => b.destinationId))];
  if (!destinationIds.length) return bookings.map((b) => ({ ...b, queuePosition: null, peopleAhead: 0, estimatedWaitMinutes: 0 }));

  const [stats, destinationRows, aheadRows] = await Promise.all([
    getQueueStats(destinationIds, client),
    run('SELECT id, entry_rate_per_minute FROM destinations WHERE id = ANY($1::text[])', [destinationIds]),
    run(
      `SELECT me.booking_id,
         COUNT(other.booking_id)::int AS groups_ahead,
         COALESCE(SUM(other.number_of_people), 0)::int AS people_ahead
       FROM bookings me
       LEFT JOIN bookings other
         ON other.destination_id = me.destination_id AND other.status = 'WAITING' AND other.ticket_number < me.ticket_number
       WHERE me.booking_id = ANY($1::text[])
       GROUP BY me.booking_id`,
      [waiting.map((b) => b.bookingId)]
    ),
  ]);
  const destinations = new Map(destinationRows.rows.map((r) => [r.id, r]));
  const ahead = new Map(aheadRows.rows.map((r) => [r.booking_id, r]));

  return bookings.map((b) => {
    if (b.status !== BOOKING_STATUS.WAITING) return { ...b, queuePosition: null, peopleAhead: 0, estimatedWaitMinutes: 0 };
    const a = ahead.get(b.bookingId) || { groups_ahead: 0, people_ahead: 0 };
    const rate = entryRate(destinations.get(b.destinationId), stats.get(b.destinationId) || { recentEntries: 0 });
    return {
      ...b,
      queuePosition: a.groups_ahead + 1,
      peopleAhead: a.people_ahead,
      estimatedWaitMinutes: estimateWaitMinutes(a.people_ahead, rate),
      entryRateMeasured: rate.measured,
    };
  });
}

export async function withQueueInfo(booking, client = null) {
  return (await addQueueInfo([booking], client))[0];
}

const newCode = (bytes) => randomBytes(bytes).toString('hex').toUpperCase();

// ---------------------------------------------------------------- create
export async function createBooking({ user, destinationId, numberOfPeople, requestId }) {
  const people = Number(numberOfPeople);

  try {
    return await withTransaction(async (client) => {
      // 1. Lock this destination's queue. Other bookings for it wait here.
      const { rows: destinationRows } = await client.query(
        'SELECT id, dataset, queue_open, max_queue_people, last_ticket_number FROM destinations WHERE id = $1 FOR UPDATE',
        [String(destinationId)]
      );
      const destination = destinationRows[0];
      if (!destination) throw new QueueError(`Destination ${destinationId} was not found.`, 404);
      const name = clean(destination.dataset.destination_name);

      // 2. The same request sent twice (double click / retry) -> return the first booking
      const repeat = await client.query(`${BOOKING_SELECT} WHERE b.user_id = $1 AND b.request_id = $2`, [user.id, requestId]);
      if (repeat.rows[0]) {
        if (repeat.rows[0].destination_id !== String(destinationId)) {
          throw new QueueError('This booking request was already used. Please reload the page.', 409);
        }
        return { booking: await withQueueInfo(rowToBooking(repeat.rows[0]), client), duplicate: true };
      }

      // 3. Availability checks
      if (!destination.queue_open) throw new QueueError(`The queue for ${name} is closed right now.`, 409, { code: 'QUEUE_CLOSED' });

      const active = await client.query(
        'SELECT booking_id FROM bookings WHERE user_id = $1 AND destination_id = $2 AND status = ANY($3::text[])',
        [user.id, String(destinationId), ACTIVE_STATUSES]
      );
      if (active.rows[0]) {
        throw new QueueError(`You already have an active booking (${active.rows[0].booking_id}) for this destination.`, 409, {
          code: 'ALREADY_BOOKED',
          bookingId: active.rows[0].booking_id,
        });
      }

      const { rows: queueRows } = await client.query(
        `SELECT COUNT(*)::int AS groups, COALESCE(SUM(number_of_people), 0)::int AS people
         FROM bookings WHERE destination_id = $1 AND status = 'WAITING'`,
        [String(destinationId)]
      );
      const { groups, people: peopleWaiting } = queueRows[0];
      const placesLeft = destination.max_queue_people - peopleWaiting;
      if (people > placesLeft) {
        throw new QueueError(
          placesLeft <= 0
            ? `The queue for ${name} is full right now. Please try again later.`
            : `Only ${placesLeft} place(s) left in the queue for ${name}.`,
          409,
          { code: 'QUEUE_FULL', placesLeft: Math.max(0, placesLeft) }
        );
      }

      // 4. Next ticket number (FIFO order) - still inside the lock
      const { rows: ticketRows } = await client.query(
        'UPDATE destinations SET last_ticket_number = last_ticket_number + 1 WHERE id = $1 RETURNING last_ticket_number',
        [String(destinationId)]
      );
      const ticketNumber = ticketRows[0].last_ticket_number;

      // 5. Insert the booking (retry only on the very unlikely booking-id collision)
      let inserted = null;
      for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
        const { rows } = await client.query(
          `INSERT INTO bookings (booking_id, user_id, destination_id, number_of_people, ticket_number,
             position_at_booking, status, request_id, pass_code, pass_issued_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'WAITING', $7, $8, now())
           ON CONFLICT (booking_id) DO NOTHING
           RETURNING booking_id`,
          [`TF-${newCode(3)}`, user.id, String(destinationId), people, ticketNumber, groups + 1, requestId, newCode(4)]
        );
        inserted = rows[0];
      }
      if (!inserted) throw new Error('Could not generate a unique booking id');

      await recordAudit(
        {
          actor: user,
          action: 'booking.created',
          targetType: 'booking',
          targetId: inserted.booking_id,
          details: { destinationId: String(destinationId), numberOfPeople: people, ticketNumber, position: groups + 1 },
        },
        client
      );

      const { rows } = await client.query(`${BOOKING_SELECT} WHERE b.booking_id = $1`, [inserted.booking_id]);
      return { booking: await withQueueInfo(rowToBooking(rows[0]), client), duplicate: false };
    });
  } catch (err) {
    // A unique constraint caught a race we did not foresee - report it, never corrupt the queue
    if (err.code === '23505') {
      throw new QueueError('You already have an active booking for this destination, or this request was already sent.', 409);
    }
    throw err;
  }
}

// ---------------------------------------------------------------- read
export async function findBooking(bookingIdOrPassCode) {
  const key = String(bookingIdOrPassCode || '').trim().toUpperCase();
  if (!key || key.length > 100) return null;

  // Full QR text: "TOURFLOW:TF-ABC123:1A2B3C4D" -> booking id AND pass code must match
  const parts = key.split(':');
  if (parts[0] === 'TOURFLOW') {
    if (parts.length !== 3) return null;
    const { rows } = await query(`${BOOKING_SELECT} WHERE b.booking_id = $1 AND b.pass_code = $2`, [parts[1], parts[2]]);
    return rows[0] ? { ...rowToBooking(rows[0]), passVerified: true } : null;
  }

  const { rows } = await query(`${BOOKING_SELECT} WHERE b.booking_id = $1 OR b.pass_code = $1`, [key]);
  return rows[0] ? { ...rowToBooking(rows[0]), passVerified: rows[0].pass_code === key } : null;
}

export async function listBookingsForUser(userId) {
  const { rows } = await query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY b.created_at DESC LIMIT 200`, [userId]);
  return addQueueInfo(rows.map(rowToBooking));
}

// ---------------------------------------------------------------- status changes
const STATUS_TIME_COLUMN = {
  CHECKED_IN: 'checked_in_at',
  CHECKED_OUT: 'checked_out_at',
  CANCELLED: 'cancelled_at',
  NO_SHOW: 'cancelled_at',
};

const AUDIT_ACTION = {
  CHECKED_IN: 'booking.checked_in',
  CHECKED_OUT: 'booking.checked_out',
  CANCELLED: 'booking.cancelled',
  NO_SHOW: 'booking.no_show',
};

const label = (status) => status.replace('_', ' ').toLowerCase();

/**
 * Change a booking's status, enforcing the allowed transitions and FIFO.
 * actor = the logged-in user; options = { reason, override }
 */
export async function changeStatus(bookingId, newStatus, actor, { reason = null, override = false } = {}) {
  const id = String(bookingId || '').trim().toUpperCase();
  const { rows: found } = await query('SELECT destination_id FROM bookings WHERE booking_id = $1', [id]);
  if (!found[0]) throw new QueueError(`Booking ${bookingId} was not found.`, 404);

  return withTransaction(async (client) => {
    // Same lock order as createBooking (destination first) -> no deadlocks, consistent FIFO view
    await client.query('SELECT id FROM destinations WHERE id = $1 FOR UPDATE', [found[0].destination_id]);
    const { rows } = await client.query('SELECT * FROM bookings WHERE booking_id = $1 FOR UPDATE', [id]);
    const booking = rows[0];

    const rule = TRANSITIONS[booking.status]?.[newStatus];
    if (!rule) throw new QueueError(`A ${label(booking.status)} booking cannot be changed to ${label(newStatus)}.`, 409);

    const role = actor.role === 'admin' ? 'admin' : booking.user_id === actor.id ? 'owner' : null;
    if (!role || !rule.roles.includes(role)) throw new QueueError('You are not allowed to make this change.', 403);

    const cleanReason = reason ? String(reason).trim() : null;
    const needsReason = rule.reasonRequired || (rule.reasonRequiredFor || []).includes(role);
    if (needsReason) {
      const error = validateReason(cleanReason);
      if (error) throw new QueueError(error, 400, { code: 'REASON_REQUIRED' });
    }

    // FIFO: is this booking at the front of the queue?
    let overrideDetails = null;
    if (rule.frontOnly) {
      const { rows: frontRows } = await client.query(
        `SELECT booking_id, ticket_number,
           (SELECT COUNT(*)::int FROM bookings x WHERE x.destination_id = $1 AND x.status = 'WAITING' AND x.ticket_number < $2) + 1 AS my_position
         FROM bookings WHERE destination_id = $1 AND status = 'WAITING' ORDER BY ticket_number LIMIT 1`,
        [booking.destination_id, booking.ticket_number]
      );
      const front = frontRows[0];
      if (front.booking_id !== booking.booking_id) {
        if (!rule.overridable || !override) {
          throw new QueueError(
            `${booking.booking_id} is #${front.my_position} in the queue. FIFO: ${front.booking_id} must be served first.` +
              (rule.overridable ? ' To let this group in early, use an override with a reason.' : ''),
            409,
            { code: 'NOT_FRONT_OF_QUEUE', position: front.my_position, frontBookingId: front.booking_id }
          );
        }
        const error = validateReason(cleanReason);
        if (error) throw new QueueError(`Override reason required: ${error}`, 400, { code: 'REASON_REQUIRED' });
        overrideDetails = { position: front.my_position, frontBookingId: front.booking_id };
      }
    }

    const timeColumn = STATUS_TIME_COLUMN[newStatus];
    await client.query(
      `UPDATE bookings SET status = $2, ${timeColumn} = now(), ended_reason = COALESCE($3, ended_reason) WHERE booking_id = $1`,
      [id, newStatus, newStatus === BOOKING_STATUS.CANCELLED || newStatus === BOOKING_STATUS.NO_SHOW ? cleanReason : null]
    );

    await recordAudit(
      {
        actor,
        action: overrideDetails ? 'booking.checked_in_override' : role === 'admin' && newStatus === 'CANCELLED' ? 'booking.cancelled_by_admin' : AUDIT_ACTION[newStatus],
        targetType: 'booking',
        targetId: id,
        reason: cleanReason,
        details: { destinationId: booking.destination_id, from: booking.status, to: newStatus, ticketNumber: booking.ticket_number, ...(overrideDetails || {}) },
      },
      client
    );

    const { rows: updated } = await client.query(`${BOOKING_SELECT} WHERE b.booking_id = $1`, [id]);
    return withQueueInfo(rowToBooking(updated[0]), client);
  });
}

// ---------------------------------------------------------------- admin views
const ADMIN_SELECT = `
  SELECT b.*, d.dataset->>'destination_name' AS d_name, d.dataset->>'district' AS d_district, d.dataset->>'state' AS d_state,
         u.name AS u_name, u.email AS u_email
  FROM bookings b JOIN destinations d ON d.id = b.destination_id JOIN users u ON u.id = b.user_id`;

const withUser = (row) => ({ ...rowToBooking(row), user: { name: row.u_name, email: row.u_email } });

export async function findBookingForAdmin(code) {
  const booking = await findBooking(code);
  if (!booking) return null;
  const { rows } = await query(`${ADMIN_SELECT} WHERE b.booking_id = $1`, [booking.bookingId]);
  return { ...(await withQueueInfo(withUser(rows[0]))), passVerified: booking.passVerified };
}

export async function listBookingsForAdmin({ search = '', status = '', destinationId = '' } = {}) {
  const where = [];
  const params = [];
  if (status) {
    params.push(status);
    where.push(`b.status = $${params.length}`);
  }
  if (destinationId) {
    params.push(String(destinationId));
    where.push(`b.destination_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${String(search).trim().replace(/[%_\\]/g, '\\$&')}%`);
    const p = `$${params.length}`;
    where.push(`(b.booking_id ILIKE ${p} OR b.pass_code ILIKE ${p} OR u.name ILIKE ${p} OR u.email ILIKE ${p} OR d.dataset->>'destination_name' ILIKE ${p})`);
  }
  const { rows } = await query(
    `${ADMIN_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY b.created_at DESC LIMIT 200`,
    params
  );
  return addQueueInfo(rows.map(withUser));
}

export async function getDestinationQueue(destinationId) {
  const { rows } = await query(
    `${ADMIN_SELECT} WHERE b.destination_id = $1 AND (b.status = ANY($2::text[]) OR b.created_at > now() - interval '24 hours')
     ORDER BY b.ticket_number`,
    [String(destinationId), ACTIVE_STATUSES]
  );
  const all = rows.map(withUser);

  // FIFO positions straight from the ordered list
  let peopleAhead = 0;
  const waiting = all
    .filter((b) => b.status === BOOKING_STATUS.WAITING)
    .map((b, index) => {
      const item = { ...b, queuePosition: index + 1, peopleAhead, isFront: index === 0 };
      peopleAhead += b.numberOfPeople;
      return item;
    });
  const inside = all.filter((b) => b.status === BOOKING_STATUS.CHECKED_IN).sort((a, b) => a.checkedInAt.localeCompare(b.checkedInAt));
  const finished = all.filter((b) => !ACTIVE_STATUSES.includes(b.status)).slice(-50).reverse();
  return { waiting, inside, finished };
}
