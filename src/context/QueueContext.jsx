import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createQueueBooking, fetchMyBookings, cancelQueueBooking } from '../services/api';
import { useAuth } from './AuthContext';

const QueueContext = createContext();

/**
 * Holds the logged-in tourist's bookings. The backend is the source of truth:
 * the list is always loaded from GET /api/queue/mine, never invented here.
 */
export function QueueProvider({ children }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadError, setLoadError] = useState('');

  const refreshBookings = useCallback(async () => {
    if (!user || user.role !== 'tourist') {
      setBookings([]);
      return { success: false };
    }
    try {
      setBookings(await fetchMyBookings());
      setLoadError('');
      return { success: true };
    } catch (err) {
      setLoadError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  // POST /api/queue - the server checks the 4-person rule, duplicates etc.
  const joinQueue = async (destination, numberOfPeople, requestId) => {
    try {
      const booking = await createQueueBooking({ destinationId: destination.id, numberOfPeople, requestId });
      await refreshBookings();
      return { success: true, booking };
    } catch (err) {
      return { success: false, error: err.message, existingBookingId: err.data?.bookingId };
    }
  };

  // DELETE /api/queue/:bookingId
  const cancelBooking = async (bookingId) => {
    try {
      await cancelQueueBooking(bookingId);
      await refreshBookings();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'WAITING' || b.status === 'CHECKED_IN');
  // used by the navbar badge
  const activeQueue = activeBookings[0]
    ? { ...activeBookings[0], queueNumber: activeBookings[0].queuePosition ? `#${activeBookings[0].queuePosition}` : 'IN' }
    : null;

  return (
    <QueueContext.Provider value={{ bookings, activeBookings, activeQueue, loadError, refreshBookings, joinQueue, cancelBooking }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}
