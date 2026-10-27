/**
 * Booking model
 * One group's place in a destination's FIFO queue.
 */
export const MAX_PEOPLE_PER_BOOKING = 4;

export const BOOKING_STATUS = {
  WAITING: 'WAITING',         // in the queue
  CHECKED_IN: 'CHECKED_IN',   // staff let the group in
  CHECKED_OUT: 'CHECKED_OUT', // visit completed
  CANCELLED: 'CANCELLED',     // cancelled by the tourist or (with a reason) by staff
  NO_SHOW: 'NO_SHOW',         // was at the front of the queue but did not come
};

export const ACTIVE_STATUSES = [BOOKING_STATUS.WAITING, BOOKING_STATUS.CHECKED_IN];

/**
 * Allowed status changes.
 * FIFO: a normal check-in or no-show is only allowed for the booking at the
 * FRONT of the queue. Checking in anyone else is an "override" that needs a
 * written reason and is recorded in the audit log.
 */
export const TRANSITIONS = {
  WAITING: {
    CHECKED_IN: { roles: ['admin'], frontOnly: true, overridable: true },
    NO_SHOW: { roles: ['admin'], frontOnly: true, overridable: false, reasonRequired: true },
    CANCELLED: { roles: ['owner', 'admin'], reasonRequiredFor: ['admin'] },
  },
  CHECKED_IN: {
    CHECKED_OUT: { roles: ['admin'] },
  },
  CHECKED_OUT: {},
  CANCELLED: {},
  NO_SHOW: {},
};

export function isActive(status) {
  return ACTIVE_STATUSES.includes(status);
}

export function validateReason(reason) {
  const value = String(reason || '').trim();
  if (value.length < 10) return 'Please give a reason of at least 10 characters.';
  if (value.length > 500) return 'The reason must be at most 500 characters.';
  return null;
}

// Returns an error message, or null if valid
export function validateBookingInput({ destinationId, numberOfPeople, requestId }) {
  if (destinationId === undefined || destinationId === null || destinationId === '') {
    return 'Please choose a destination.';
  }
  if (typeof numberOfPeople === 'string' && !/^\d+$/.test(numberOfPeople.trim())) {
    return 'Number of people must be a whole number from 1 to 4.';
  }
  const people = Number(numberOfPeople);
  if (!Number.isInteger(people) || people < 1) {
    return 'Number of people must be a whole number from 1 to 4.';
  }
  if (people > MAX_PEOPLE_PER_BOOKING) {
    return `A booking can contain a maximum of ${MAX_PEOPLE_PER_BOOKING} people.`;
  }
  if (!requestId || !/^[A-Za-z0-9-]{8,64}$/.test(String(requestId))) {
    return 'Missing or invalid request id. Please reload the page and try again.';
  }
  return null;
}

// Database row -> API object
export function toBooking(row) {
  const iso = (v) => (v ? new Date(v).toISOString() : null);
  return {
    bookingId: row.booking_id,
    userId: row.user_id,
    destinationId: row.destination_id,
    destinationName: row.destination_name ?? null,
    destinationLocation: row.destination_location ?? null,
    numberOfPeople: Number(row.number_of_people),
    ticketNumber: Number(row.ticket_number),
    positionAtBooking: Number(row.position_at_booking),
    status: row.status,
    pass: { code: row.pass_code, issuedAt: iso(row.pass_issued_at) },
    createdAt: iso(row.created_at),
    checkedInAt: iso(row.checked_in_at),
    checkedOutAt: iso(row.checked_out_at),
    cancelledAt: iso(row.cancelled_at),
    endedReason: row.ended_reason || null,
  };
}
