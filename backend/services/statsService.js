import { getDb } from '../db/store.js';
import { BOOKING_STATUS } from '../models/Booking.js';
import { ROLES } from '../models/User.js';

// Operational summary for the admin dashboard
export function getStats() {
  const { bookings, users } = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const count = (status) => bookings.filter((b) => b.status === status).length;
  const people = (list) => list.reduce((sum, b) => sum + b.numberOfPeople, 0);

  // destinations with the most people waiting or inside
  const byDestination = {};
  for (const b of bookings) {
    if (b.status !== BOOKING_STATUS.WAITING && b.status !== BOOKING_STATUS.CHECKED_IN) continue;
    const entry = (byDestination[b.destinationId] ||= { destinationId: b.destinationId, destinationName: b.destinationName, peopleWaiting: 0, peopleInside: 0 });
    if (b.status === BOOKING_STATUS.WAITING) entry.peopleWaiting += b.numberOfPeople;
    else entry.peopleInside += b.numberOfPeople;
  }

  return {
    totalBookings: bookings.length,
    bookingsToday: bookings.filter((b) => b.createdAt.startsWith(today)).length,
    waiting: count(BOOKING_STATUS.WAITING),
    checkedIn: count(BOOKING_STATUS.CHECKED_IN),
    checkedOut: count(BOOKING_STATUS.CHECKED_OUT),
    cancelled: count(BOOKING_STATUS.CANCELLED),
    peopleWaiting: people(bookings.filter((b) => b.status === BOOKING_STATUS.WAITING)),
    peopleInside: people(bookings.filter((b) => b.status === BOOKING_STATUS.CHECKED_IN)),
    registeredTourists: users.filter((u) => u.role === ROLES.TOURIST).length,
    activeDestinations: Object.values(byDestination).sort((a, b) => b.peopleWaiting + b.peopleInside - (a.peopleWaiting + a.peopleInside)),
    generatedAt: new Date().toISOString(),
  };
}
