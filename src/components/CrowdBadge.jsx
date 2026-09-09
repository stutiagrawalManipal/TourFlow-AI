import React from 'react';

/**
 * CrowdBadge component
 * Soft, elegant pastel status indicator for crowd conditions in light theme.
 * States: LOW, MODERATE, HIGH
 */
export default function CrowdBadge({ level = 'MODERATE', size = 'md' }) {
  const normalized = (level || 'MODERATE').toUpperCase();

  const configs = {
    LOW: {
      label: 'Low crowd',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
      dotClass: 'bg-emerald-500',
    },
    MODERATE: {
      label: 'Moderate crowd',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
      dotClass: 'bg-amber-500',
    },
    HIGH: {
      label: 'High crowd',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
      dotClass: 'bg-rose-500',
    },
  };

  const config = configs[normalized] || configs.MODERATE;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${
        isSmall ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1'
      } ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
