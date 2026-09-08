import React, { createContext, useContext, useState, useEffect } from 'react';

const QueueContext = createContext();

const INITIAL_MOCK_QUEUE = {
  id: 'TF-8942',
  destinationId: 'taj-mahal',
  destinationName: 'Taj Mahal',
  destinationLocation: 'Agra, Uttar Pradesh',
  destinationImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  queueNumber: '#27',
  numericQueueNumber: 27,
  positionAhead: 18,
  estimatedWait: '~25 MIN',
  estimatedWaitMinutes: 25,
  visitorCount: 2,
  status: 'In Queue', // 'In Queue', 'Called', 'Active'
  bookingTime: '09:45 AM',
  expiryTime: '11:15 AM',
  ticketDate: 'Today',
  gate: 'East Imperial Gate',
  tier: 'Standard Digital FIFO'
};

export function QueueProvider({ children }) {
  const [activeQueue, setActiveQueue] = useState(() => {
    const saved = localStorage.getItem('tourflow_active_queue');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MOCK_QUEUE;
      }
    }
    return INITIAL_MOCK_QUEUE;
  });

  useEffect(() => {
    if (activeQueue) {
      localStorage.setItem('tourflow_active_queue', JSON.stringify(activeQueue));
    } else {
      localStorage.removeItem('tourflow_active_queue');
    }
  }, [activeQueue]);

  /**
   * Business Rule: Maximum 4 visitors allowed per booking.
   */
  const joinQueue = (destination, visitorCount) => {
    const count = parseInt(visitorCount, 10);
    if (isNaN(count) || count < 1 || count > 4) {
      return {
        success: false,
        error: 'Maximum 4 visitors are allowed per booking.'
      };
    }

    const randomQueueNum = Math.floor(15 + Math.random() * 45);
    const peopleAhead = Math.max(3, randomQueueNum - 9);
    const waitMins = Math.round(peopleAhead * 1.4);

    const now = new Date();
    const bookingTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const expiryDate = new Date(now.getTime() + 60 * 60000);
    const expiryTimeStr = expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newBooking = {
      id: 'TF-' + Math.floor(1000 + Math.random() * 9000),
      destinationId: destination.id,
      destinationName: destination.name,
      destinationLocation: destination.location,
      destinationImage: destination.imageUrl,
      queueNumber: `#${randomQueueNum}`,
      numericQueueNumber: randomQueueNum,
      positionAhead: peopleAhead,
      estimatedWait: `~${waitMins} MIN`,
      estimatedWaitMinutes: waitMins,
      visitorCount: count,
      status: 'In Queue',
      bookingTime: bookingTimeStr,
      expiryTime: expiryTimeStr,
      ticketDate: 'Today',
      gate: 'Main Verified Entrance',
      tier: 'Standard Digital FIFO'
    };

    setActiveQueue(newBooking);
    return { success: true, booking: newBooking };
  };

  const cancelQueue = () => {
    setActiveQueue(null);
  };

  return (
    <QueueContext.Provider value={{ activeQueue, joinQueue, cancelQueue }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}
