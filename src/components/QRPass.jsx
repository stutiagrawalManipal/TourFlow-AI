import React from 'react';
import { Compass, Users, Clock, ShieldCheck, Ticket, Calendar, QrCode } from 'lucide-react';
import QueueStatus from './QueueStatus';

/**
 * QRPass component
 * A futuristic digital boarding / queue pass with holographic styling and mock QR matrix.
 */
export default function QRPass({ queue, onCancel }) {
  if (!queue) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden relative backdrop-blur-md">
      {/* Top Holographic Security Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-500/30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-300">
            TOURFLOW PASS // FIFO
          </span>
        </div>
        <QueueStatus status={queue.status} size="sm" />
      </div>

      {/* Pass Body - Destination & Queue Big Display */}
      <div className="p-6 relative">
        {/* Subtle background destination photo with dark gradient overlay */}
        {queue.destinationImage && (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img
              src={queue.destinationImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                DESTINATION VERIFIED
              </p>
              <h3 className="text-2xl font-black text-white font-sans tracking-tight">
                {queue.destinationName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {queue.destinationLocation}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                QUEUE NO.
              </p>
              <div className="text-3xl font-mono font-black text-amber-400 tracking-wider">
                {queue.queueNumber}
              </div>
            </div>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Visitors</span>
              <span className="text-slate-200 font-bold flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {queue.visitorCount} {queue.visitorCount === 1 ? 'PERSON' : 'PEOPLE'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Booking ID</span>
              <span className="text-cyan-300 font-bold mt-0.5 block">{queue.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Est. Wait</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {queue.estimatedWait}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Valid Until</span>
              <span className="text-amber-300 font-bold mt-0.5 block">{queue.expiryTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perforated Ticket Divider with side cutouts */}
      <div className="relative flex items-center my-0 px-4">
        {/* Left notch */}
        <div className="w-5 h-5 rounded-full bg-command-darkest -ml-6 border-r border-cyan-500/30" />
        {/* Dashed line */}
        <div className="flex-grow border-b border-dashed border-cyan-500/30 mx-2" />
        {/* Right notch */}
        <div className="w-5 h-5 rounded-full bg-command-darkest -mr-6 border-l border-cyan-500/30" />
      </div>

      {/* Pass QR Section */}
      <div className="p-6 bg-slate-950/70 relative z-10 flex flex-col items-center text-center">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>FRONTEND MOCK QR • SCAN AT GATE</span>
        </p>

        {/* Futuristic QR Mock Box */}
        <div className="relative p-3 bg-white rounded-2xl border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20">
          {/* Mock QR SVG Matrix with Finder Patterns */}
          <svg className="w-44 h-44" viewBox="0 0 100 100" fill="#070c1a">
            {/* Top-Left Finder */}
            <rect x="5" y="5" width="26" height="26" rx="4" />
            <rect x="9" y="9" width="18" height="18" fill="white" />
            <rect x="13" y="13" width="10" height="10" />

            {/* Top-Right Finder */}
            <rect x="69" y="5" width="26" height="26" rx="4" />
            <rect x="73" y="9" width="18" height="18" fill="white" />
            <rect x="77" y="13" width="10" height="10" />

            {/* Bottom-Left Finder */}
            <rect x="5" y="69" width="26" height="26" rx="4" />
            <rect x="9" y="73" width="18" height="18" fill="white" />
            <rect x="13" y="77" width="10" height="10" />

            {/* Simulated Data Bits */}
            <rect x="36" y="8" width="5" height="5" />
            <rect x="45" y="8" width="5" height="5" />
            <rect x="55" y="8" width="5" height="5" />
            <rect x="36" y="18" width="5" height="5" />
            <rect x="48" y="24" width="8" height="5" />
            <rect x="8" y="36" width="5" height="5" />
            <rect x="18" y="36" width="5" height="5" />
            <rect x="25" y="44" width="5" height="8" />

            {/* Center Grid Cluster */}
            <rect x="38" y="38" width="24" height="24" rx="4" fill="#0891b2" />
            <rect x="44" y="44" width="12" height="12" fill="white" />
            <rect x="48" y="48" width="4" height="4" fill="#070c1a" />

            {/* Random Matrix Bits */}
            <rect x="68" y="38" width="6" height="6" />
            <rect x="80" y="42" width="6" height="6" />
            <rect x="70" y="52" width="6" height="6" />
            <rect x="85" y="60" width="6" height="6" />
            <rect x="38" y="68" width="6" height="6" />
            <rect x="48" y="75" width="8" height="5" />
            <rect x="62" y="72" width="6" height="6" />
            <rect x="75" y="80" width="10" height="6" />
            <rect x="50" y="86" width="8" height="6" />
            <rect x="38" y="88" width="5" height="5" />
          </svg>

          {/* Scanner Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
        </div>

        <p className="text-[11px] font-mono text-cyan-400 mt-4 tracking-wider">
          PASS ID: {queue.id} • GATE: {queue.gate || 'MAIN'}
        </p>
        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
          SHA-256: 9F8A2...TF-SECURE-ENTRY
        </p>

        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-5 text-xs text-rose-400 hover:text-rose-300 font-mono tracking-wider uppercase underline underline-offset-4 transition-colors"
          >
            Cancel Queue Pass
          </button>
        )}
      </div>
    </div>
  );
}
