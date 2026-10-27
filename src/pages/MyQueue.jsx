import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, MapPin, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, XCircle, History } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import QueueProgress from '../components/QueueProgress';
import QRPass from '../components/QRPass';
import QueueStatus from '../components/QueueStatus';

const formatTime = (iso) => (iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-');

export default function MyQueue() {
  const { bookings, activeBookings, loadError, refreshBookings, cancelBooking } = useQueue();
  const [selectedId, setSelectedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [notification, setNotification] = useState(null);

  // keep positions fresh: reload on open and every 20 seconds
  useEffect(() => {
    refreshBookings();
    const timer = setInterval(refreshBookings, 20000);
    return () => clearInterval(timer);
  }, [refreshBookings]);

  const selected = activeBookings.find((b) => b.bookingId === selectedId) || activeBookings[0];
  const history = bookings.filter((b) => ['CHECKED_OUT', 'CANCELLED', 'NO_SHOW'].includes(b.status));

  const notify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshBookings();
    setIsRefreshing(false);
    notify(result.success ? 'info' : 'error', result.success ? 'Queue status updated from the server.' : result.error || 'Could not refresh.');
  };

  const handleCancel = async () => {
    const result = await cancelBooking(bookingToCancel.bookingId);
    setBookingToCancel(null);
    notify(result.success ? 'info' : 'error', result.success ? 'Your booking has been cancelled.' : result.error);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">DIGITAL FIFO QUEUE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">My Queue</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Your bookings, live positions from the server, and your QR queue pass.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-mono flex items-center justify-between border ${notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white" aria-label="Dismiss">✕</button>
        </div>
      )}
      {loadError && !notification && (
        <div className="p-4 rounded-2xl text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300">{loadError}</div>
      )}

      {selected ? (
        <div className="space-y-8">
          {/* Tabs if the tourist has several active bookings */}
          {activeBookings.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {activeBookings.map((b) => (
                <button
                  key={b.bookingId}
                  onClick={() => setSelectedId(b.bookingId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${b.bookingId === selected.bookingId ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
                >
                  {b.destinationName} • {b.bookingId}
                </button>
              ))}
            </div>
          )}

          {selected.status === 'WAITING' ? (
            <QueueProgress
              queueNumber={`#${selected.queuePosition}`}
              positionAhead={selected.peopleAhead}
              estimatedWait={`~${selected.estimatedWaitMinutes} MIN`}
              status="Waiting"
            />
          ) : (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-sm text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>You were checked in at {formatTime(selected.checkedInAt)}. Staff will check you out when you leave.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-1">BOOKING SUMMARY</span>
                <Link to={`/destinations/${selected.destinationId}`} className="text-2xl font-bold text-white hover:text-cyan-300">{selected.destinationName}</Link>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selected.destinationLocation}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800 font-mono text-xs">
                <Item label="Booking ID" value={<span className="text-cyan-400 font-bold">{selected.bookingId}</span>} />
                <Item label="Status" value={<QueueStatus status={selected.status} size="sm" />} />
                <Item label="Queue Position" value={<span className="text-amber-400 font-bold">{selected.queuePosition ?? '-'}</span>} />
                <Item label="Ticket Number" value={selected.ticketNumber} />
                <Item label="Party Size" value={`${selected.numberOfPeople} ${selected.numberOfPeople === 1 ? 'Visitor' : 'Visitors'}`} />
                <Item label="Booked At" value={formatTime(selected.createdAt)} />
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <h4 className="font-semibold text-white uppercase font-mono tracking-wider text-[11px]">How entry works:</h4>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />Wait until your position is near the front, then go to the entrance.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />Show the QR pass; staff look it up and check your group in.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />The waiting time is an estimate based on the queue and entry rate.</p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <QRPass booking={selected} onCancel={() => setBookingToCancel(selected)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-sans">No Active Booking</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">Choose a destination and join its digital queue to get a QR pass.</p>
          </div>
          <Link to="/destinations" className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs font-mono uppercase tracking-wider">
            <span>Explore Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Past bookings */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2 text-xs font-mono uppercase text-slate-400">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Past bookings</span>
          </div>
          <ul className="divide-y divide-slate-800/70">
            {history.map((b) => (
              <li key={b.bookingId} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-300">{b.destinationName}</span>
                <span className="text-slate-500">
                  {b.bookingId} • {b.numberOfPeople} ppl • {formatTime(b.createdAt)}
                  {b.endedReason && <span className="block text-[10px] text-slate-500">Reason: {b.endedReason}</span>}
                </span>
                <QueueStatus status={b.status} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cancel confirmation */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Cancel this booking?</h3>
            <p className="text-xs text-slate-400 mb-6">
              You will lose position #{bookingToCancel.queuePosition} for {bookingToCancel.destinationName}. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setBookingToCancel(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm">Keep Booking</button>
              <button onClick={handleCancel} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <span className="text-slate-500 block text-[11px] uppercase">{label}</span>
      <span className="text-white block mt-1">{value}</span>
    </div>
  );
}
