import { existsSync, readFileSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { BOOKING_STATUS, createBooking } from '../models/Booking.js';

/**
 * Queue service
 * Bookings are application data, so they are kept separately from the
 * tourism dataset, in data/bookings.json. This is enough for the current
 * milestone and can be replaced by a real database later.
 */
const BOOKINGS_FILE = new URL('../data/bookings.json', import.meta.url);

// Demo assumption: each visitor ahead of you adds about 2 minutes of waiting
const MINUTES_PER_VISITOR = 2;
const QUEUE_CAPACITY = 100; // demo value: max visitors waiting at one destination

function readBookings() {
  if (!existsSync(BOOKINGS_FILE)) return [];
  return JSON.parse(readFileSync(BOOKINGS_FILE, 'utf-8'));
}

function saveBookings(bookings) {
  writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

function generateBookingId(bookings) {
  let id;
  do {
    id = 'TF-' + randomBytes(3).toString('hex').toUpperCase();
  } while (bookings.some((b) => b.bookingId === id));
  return id;
}

// Waiting bookings for one destination, first come first served
function getWaitingQueue(bookings, destinationId) {
  return bookings
    .filter((b) => String(b.destinationId) === String(destinationId) && b.status === BOOKING_STATUS.WAITING)
    .sort((a, b) => a.queueNumber - b.queueNumber);
}

function countPeople(bookings) {
  return bookings.reduce((total, b) => total + b.numberOfPeople, 0);
}

export function addToQueue(destination, numberOfPeople) {
  const bookings = readBookings();
  const destinationBookings = bookings.filter((b) => String(b.destinationId) === String(destination.id));

  const booking = createBooking({
    bookingId: generateBookingId(bookings),
    destination,
    numberOfPeople,
    queueNumber: destinationBookings.length + 1,
  });

  bookings.push(booking);
  saveBookings(bookings);
  return getBookingStatus(booking.bookingId);
}

export function getBookingStatus(bookingId) {
  const bookings = readBookings();
  const booking = bookings.find((b) => b.bookingId === bookingId.toUpperCase());
  if (!booking) return null;

  const queue = getWaitingQueue(bookings, booking.destinationId);
  const index = queue.findIndex((b) => b.bookingId === booking.bookingId);
  const groupsAhead = index >= 0 ? queue.slice(0, index) : [];
  const peopleAhead = countPeople(groupsAhead);

  return {
    ...booking,
    queuePosition: index >= 0 ? index + 1 : null,
    bookingsAhead: groupsAhead.length,
    peopleAhead,
    estimatedWaitMinutes: peopleAhead * MINUTES_PER_VISITOR,
  };
}

// Summary of a destination's queue, shown on cards and the details page
export function getQueueStats(destinationId) {
  const bookings = readBookings();
  const destinationBookings = bookings.filter((b) => String(b.destinationId) === String(destinationId));
  const queue = getWaitingQueue(bookings, destinationId);
  const peopleWaiting = countPeople(queue);
  const today = new Date().toDateString();

  return {
    bookingsWaiting: queue.length,
    peopleWaiting,
    nextQueueNumber: destinationBookings.length + 1,
    estimatedWaitMinutes: peopleWaiting * MINUTES_PER_VISITOR,
    queueCapacity: QUEUE_CAPACITY,
    bookingsToday: destinationBookings.filter((b) => new Date(b.createdAt).toDateString() === today).length,
  };
}
