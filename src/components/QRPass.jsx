import React from 'react';
import { Users, Clock, MapPin } from 'lucide-react';
import QueueStatus from './QueueStatus';

/**
 * QRPass component
 * Clean digital e-ticket pass in a refined white & soft grey mobile wallet design.
 */
export default function QRPass({ queue, onCancel }) {
  if (!queue) return null;

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-slate-200 rounded-3xl shadow-pass overflow-hidden">
      {/* Pass Header Banner */}
      <div className="relative bg-slate-50/80 px-6 py-5 border-b border-slate-100">
        {/* Subtle photo watermark */}
        {queue.destinationImage && (
          <div className="absolute inset-0 opacity-[0.07] overflow-hidden pointer-events-none">
            <img
              src={queue.destinationImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Digital Entry Pass
            </span>
            <QueueStatus status={queue.status} size="sm" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {queue.destinationName}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{queue.destinationLocation}</span>
          </p>
        </div>
      </div>

      {/* Pass Ticket Body */}
      <div className="px-6 py-5 space-y-4 bg-white">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Queue Number
            </span>
            <span className="text-3xl font-bold text-amber-600 font-mono tracking-tight">
              {queue.queueNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Booking Ref
            </span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {queue.id}
            </span>
          </div>
        </div>

        {/* 2x2 Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Visitors</span>
            <span className="text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              {queue.visitorCount} {queue.visitorCount === 1 ? 'Visitor' : 'Visitors'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Assigned Gate</span>
            <span className="text-slate-800 font-semibold block mt-0.5 truncate">
              {queue.gate || 'Main Entrance'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Est. Wait</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {queue.estimatedWait}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Valid Until</span>
            <span className="text-slate-800 font-semibold block mt-0.5">
              {queue.expiryTime}
            </span>
          </div>
        </div>
      </div>

      {/* Perforated Tear Notch Divider */}
      <div className="relative flex items-center px-3 bg-white">
        <div className="w-4 h-4 rounded-full bg-slate-50 -ml-5 border-r border-slate-200" />
        <div className="flex-grow border-b border-dashed border-slate-200 mx-2" />
        <div className="w-4 h-4 rounded-full bg-slate-50 -mr-5 border-l border-slate-200" />
      </div>

      {/* Barcode / QR Section */}
      <div className="p-6 bg-slate-50 flex flex-col items-center text-center">
        {/* Crisp QR Code */}
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
          <svg className="w-36 h-36" viewBox="0 0 100 100" fill="#0f172a">
            <rect x="5" y="5" width="24" height="24" rx="3" />
            <rect x="8" y="8" width="18" height="18" fill="white" />
            <rect x="11" y="11" width="12" height="12" />

            <rect x="71" y="5" width="24" height="24" rx="3" />
            <rect x="74" y="8" width="18" height="18" fill="white" />
            <rect x="77" y="11" width="12" height="12" />

            <rect x="5" y="71" width="24" height="24" rx="3" />
            <rect x="8" y="74" width="18" height="18" fill="white" />
            <rect x="11" y="77" width="12" height="12" />

            {/* Clean QR Matrix Bits */}
            <rect x="34" y="8" width="5" height="5" />
            <rect x="44" y="8" width="5" height="5" />
            <rect x="54" y="8" width="5" height="5" />
            <rect x="34" y="18" width="5" height="5" />
            <rect x="49" y="18" width="5" height="5" />
            <rect x="59" y="18" width="5" height="5" />
            <rect x="8" y="34" width="5" height="5" />
            <rect x="18" y="34" width="5" height="5" />
            <rect x="8" y="44" width="5" height="5" />
            <rect x="18" y="44" width="5" height="5" />
            <rect x="8" y="54" width="5" height="5" />

            {/* Middle Grid */}
            <rect x="34" y="34" width="10" height="10" />
            <rect x="49" y="34" width="15" height="5" />
            <rect x="34" y="49" width="5" height="15" />
            <rect x="44" y="44" width="12" height="12" fill="#0284c7" />
            <rect x="48" y="48" width="4" height="4" fill="white" />

            {/* Bottom Right Area */}
            <rect x="69" y="34" width="5" height="5" />
            <rect x="79" y="34" width="10" height="5" />
            <rect x="69" y="44" width="10" height="5" />
            <rect x="84" y="44" width="5" height="10" />
            <rect x="69" y="59" width="5" height="5" />
            <rect x="79" y="54" width="10" height="5" />

            {/* Bottom Area */}
            <rect x="34" y="69" width="5" height="10" />
            <rect x="44" y="74" width="10" height="5" />
            <rect x="59" y="69" width="5" height="5" />
            <rect x="44" y="84" width="5" height="5" />
            <rect x="54" y="84" width="10" height="5" />
            <rect x="69" y="74" width="5" height="5" />
            <rect x="79" y="74" width="10" height="10" />
            <rect x="69" y="84" width="5" height="5" />
          </svg>
        </div>

        <p className="text-xs text-slate-800 font-semibold mt-3">
          Scan at turnstile scanner
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Pass token {queue.id} · Valid for {queue.visitorCount} {queue.visitorCount === 1 ? 'person' : 'people'}
        </p>

        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 text-xs text-slate-500 hover:text-rose-600 transition-colors"
          >
            Cancel this pass
          </button>
        )}
      </div>
    </div>
  );
}
