import React, { createContext, useContext, useState, useEffect } from 'react';
import { createQueueBooking, fetchQueueStatus } from '../services/api';

const QueueContext = createContext();

const STATUS_LABELS = {
  WAITING: 'In Queue',
  CALLED: 'Called',
  COMPLETED: 'Active',
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Converts a booking returned by the backend into the object
 * the existing queue pages (MyQueue, QRPass, Navbar...) already use.
 */
function toActiveQueue(booking, destination = {}) {
  const createdAt = new Date(booking.createdAt);
  return {
    id: booking.bookingId,
    destinationId: booking.destinationId,
    destinationName: booking.destinationName,
    destinationLocation: destination.location,
    destinationImage: destination.imageUrl,
    queueNumber: `#${booking.queueNumber}`,
    numericQueueNumber: booking.queueNumber,
    queuePosition: booking.queuePosition,
    positionAhead: booking.peopleAhead,
    estimatedWait: `~${booking.estimatedWaitMinutes} MIN`,
    estimatedWaitMinutes: booking.estimatedWaitMinutes,
    visitorCount: booking.numberOfPeople,
    status: STATUS_LABELS[booking.status] || booking.status,
    bookingTime: formatTime(createdAt),
    expiryTime: formatTime(new Date(createdAt.getTime() + 60 * 60000)),
    ticketDate: 'Today',
    gate: 'Main Entrance',
    tier: 'Standard Digital FIFO',
  };
}

export function QueueProvider({ children }) {
  const [activeQueue, setActiveQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tourflow_active_queue'));
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (activeQueue) {
      localStorage.setItem('tourflow_active_queue', JSON.stringify(activeQueue));
    } else {
      localStorage.removeItem('tourflow_active_queue');
    }
  }, [activeQueue]);

  // On first load, get the latest status of a saved booking from the backend
  useEffect(() => {
    if (activeQueue) refreshQueueStatus();
  }, []);

  /**
   * Creates a booking on the backend.
   * The max-4-people rule is enforced by the backend (POST /api/queue).
   */
  const joinQueue = async (destination, visitorCount) => {
    try {
      const booking = await createQueueBooking(destination.id, visitorCount);
      const newQueue = toActiveQueue(booking, destination);
      setActiveQueue(newQueue);
      return { success: true, booking: newQueue };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // GET /api/queue/:bookingId
  const refreshQueueStatus = async () => {
    if (!activeQueue) return { success: false };
    try {
      const booking = await fetchQueueStatus(activeQueue.id);
      setActiveQueue((prev) => ({
        ...toActiveQueue(booking),
        destinationLocation: prev?.destinationLocation,
        destinationImage: prev?.destinationImage,
      }));
      return { success: true };
    } catch (err) {
      // Booking no longer exists on the server (e.g. old demo data)
      if (err.status === 404) setActiveQueue(null);
      return { success: false, error: err.message };
    }
  };

  const cancelQueue = () => {
    setActiveQueue(null);
  };

  return (
    <QueueContext.Provider value={{ activeQueue, joinQueue, refreshQueueStatus, cancelQueue }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}
