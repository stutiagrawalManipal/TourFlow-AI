import React from 'react';

/**
 * CrowdBadge component
 * Displays crowd density with both clear text labels and color indicators.
 * States: LOW (green), MODERATE (amber), HIGH (red)
 */
export default function CrowdBadge({ level = 'MODERATE', size = 'md' }) {
  const normalized = (level || 'MODERATE').toUpperCase();

  const configs = {
    LOW: {
      label: 'LOW CROWD',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    },
    MODERATE: {
      label: 'MODERATE CROWD',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    },
    HIGH: {
      label: 'HIGH CROWD',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    },
  };

  const config = configs[normalized] || configs.MODERATE;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider uppercase border rounded-full ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
