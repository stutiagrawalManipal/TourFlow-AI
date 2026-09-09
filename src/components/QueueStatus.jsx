import React from 'react';

/**
 * QueueStatus component
 * Clean, high-legibility status badge for queue states in light/grey theme.
 */
export default function QueueStatus({ status = 'In Queue', size = 'md' }) {
  const configs = {
    'In Queue': {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      dot: 'bg-sky-500',
      label: 'In queue'
    },
    'Called': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Gate ready'
    },
    'Active': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Active pass'
    },
    'Expired': {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Expired'
    }
  };

  const config = configs[status] || configs['In Queue'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1'
      } ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
