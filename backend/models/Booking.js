/**
 * Booking model
 * One group's place in a destination's FIFO queue.
 */
export const MAX_PEOPLE_PER_BOOKING = 4;

export const BOOKING_STATUS = {
  WAITING: 'WAITING',         // in the queue
  CHECKED_IN: 'CHECKED_IN',   // staff let the group in
  CHECKED_OUT: 'CHECKED_OUT', // group has left
  CANCELLED: 'CANCELLED',     // cancelled by the tourist or staff
};

// Allowed status changes and who may make them
export const TRANSITIONS = {
  WAITING: { CHECKED_IN: ['admin'], CANCELLED: ['owner', 'admin'] },
  CHECKED_IN: { CHECKED_OUT: ['admin'] },
  CHECKED_OUT: {},
  CANCELLED: {},
};

export function isActive(booking) {
  return booking.status === BOOKING_STATUS.WAITING || booking.status === BOOKING_STATUS.CHECKED_IN;
}

// Returns an error message, or null if valid
export function validateBookingInput({ destinationId, numberOfPeople, requestId }) {
  if (destinationId === undefined || destinationId === null || destinationId === '') {
    return 'Please choose a destination.';
  }
  const people = Number(numberOfPeople);
  if (!Number.isInteger(people) || people < 1) {
    return 'Number of people must be a whole number from 1 to 4.';
  }
  if (people > MAX_PEOPLE_PER_BOOKING) {
    return `A booking can contain a maximum of ${MAX_PEOPLE_PER_BOOKING} people.`;
  }
  if (requestId !== undefined && !/^[A-Za-z0-9-]{8,64}$/.test(String(requestId))) {
    return 'Invalid request id.';
  }
  return null;
}
