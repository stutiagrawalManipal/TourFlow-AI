/**
 * Booking model
 * A Booking is one group's place in a destination's FIFO queue.
 */

export const MAX_PEOPLE_PER_BOOKING = 4;

export const BOOKING_STATUS = {
  WAITING: 'WAITING',     // in the queue
  CALLED: 'CALLED',       // reserved for later: authority calls the group to the gate
  COMPLETED: 'COMPLETED', // reserved for later: group has entered
};

// Returns an error message, or null if the input is valid
export function validateBookingInput({ destinationId, numberOfPeople }) {
  if (destinationId === undefined || destinationId === null || destinationId === '') {
    return 'destinationId is required.';
  }

  const people = Number(numberOfPeople);
  if (!Number.isInteger(people) || people < 1) {
    return 'numberOfPeople must be a whole number of at least 1.';
  }
  if (people > MAX_PEOPLE_PER_BOOKING) {
    return `A booking can contain a maximum of ${MAX_PEOPLE_PER_BOOKING} people.`;
  }
  return null;
}

export function createBooking({ bookingId, destination, numberOfPeople, queueNumber }) {
  return {
    bookingId,
    destinationId: destination.id,
    destinationName: destination.destination_name,
    numberOfPeople: Number(numberOfPeople),
    queueNumber, // ticket number for this destination (1, 2, 3...)
    status: BOOKING_STATUS.WAITING,
    createdAt: new Date().toISOString(),
  };
}
