import React from 'react';
import { Compass, Users, Clock, ShieldCheck, Hash } from 'lucide-react';
import QueueStatus from './QueueStatus';
import QRCode from './QRCode';

/**
 * QRPass component
 * Digital queue pass for one booking. The QR code contains
 * "TOURFLOW:<bookingId>:<passCode>", which staff can paste or scan into the
 * admin dashboard to find the booking.
 */
export function passText(booking) {
  return `TOURFLOW:${booking.bookingId}:${booking.pass.code}`;
}

export default function QRPass({ booking, onCancel }) {
  if (!booking) return null;
  const waiting = booking.status === 'WAITING';

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden relative backdrop-blur-md">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-500/30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-300">TOURFLOW PASS // FIFO</span>
        </div>
        <QueueStatus status={booking.status} size="sm" />
      </div>

      {/* Pass body */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">DIGITAL QUEUE PASS</p>
            <h3 className="text-2xl font-black text-white font-sans tracking-tight">{booking.destinationName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{booking.destinationLocation}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">POSITION</p>
            <div className="text-3xl font-mono font-black text-amber-400 tracking-wider">
              {waiting ? `#${booking.queuePosition}` : '-'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Visitors</span>
            <span className="text-slate-200 font-bold flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'PERSON' : 'PEOPLE'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Booking ID</span>
            <span className="text-cyan-300 font-bold mt-0.5 block">{booking.bookingId}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Est. Wait</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {waiting ? `~${booking.estimatedWaitMinutes} min` : '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Ticket No.</span>
            <span className="text-amber-300 font-bold flex items-center gap-1 mt-0.5">
              <Hash className="w-3.5 h-3.5" />
              {booking.ticketNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Perforated divider */}
      <div className="relative flex items-center my-0 px-4">
        <div className="w-5 h-5 rounded-full bg-command-darkest -ml-6 border-r border-cyan-500/30" />
        <div className="flex-grow border-b border-dashed border-cyan-500/30 mx-2" />
        <div className="w-5 h-5 rounded-full bg-command-darkest -mr-6 border-l border-cyan-500/30" />
      </div>

      {/* QR section */}
      <div className="p-6 bg-slate-950/70 flex flex-col items-center text-center">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>SHOW THIS AT THE ENTRANCE</span>
        </p>
        <div className="p-2 bg-white rounded-2xl border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20">
          <QRCode value={passText(booking)} size={176} />
        </div>
        <p className="text-[11px] font-mono text-cyan-400 mt-4 tracking-wider">
          PASS CODE: {booking.pass.code}
        </p>
        <p className="text-[10px] font-mono text-slate-500 mt-1">
          Issued {new Date(booking.pass.issuedAt).toLocaleString()}
        </p>

        {onCancel && waiting && (
          <button
            onClick={onCancel}
            className="mt-5 text-xs text-rose-400 hover:text-rose-300 font-mono tracking-wider uppercase underline underline-offset-4 transition-colors"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
