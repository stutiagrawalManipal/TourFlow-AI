import React from 'react';

/**
 * QueueStatus badge - uses the backend booking statuses.
 */
const STATUS = {
  WAITING: { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', dot: 'bg-cyan-400 animate-pulse', label: 'IN QUEUE' },
  CHECKED_IN: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', label: 'CHECKED IN' },
  CHECKED_OUT: { bg: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400', label: 'COMPLETED' },
  CANCELLED: { bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30', dot: 'bg-rose-400', label: 'CANCELLED' },
  NO_SHOW: { bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30', dot: 'bg-amber-400', label: 'NO-SHOW' },
};

export default function QueueStatus({ status = 'WAITING', size = 'md' }) {
  const config = STATUS[status] || STATUS.WAITING;
  const isSmall = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase border rounded-full ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
