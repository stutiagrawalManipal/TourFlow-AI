import React from 'react';

/**
 * QueueStatus component
 * Displays high-contrast status pills for queue states (In Queue, Called, Completed, Cancelled)
 */
export default function QueueStatus({ status = 'In Queue', size = 'md' }) {
  const configs = {
    'In Queue': {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      dot: 'bg-cyan-400 animate-pulse',
      label: 'IN QUEUE'
    },
    'Called': {
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400 animate-ping',
      label: 'GATE READY'
    },
    'Active': {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'ACTIVE PASS'
    },
    'Expired': {
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      dot: 'bg-slate-500',
      label: 'EXPIRED'
    }
  };

  const config = configs[status] || configs['In Queue'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border rounded-md ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
