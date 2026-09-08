import React from 'react';

/**
 * SectionHeader component
 * Clean command center title with uppercase eyebrow, primary heading, and optional action.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionText,
  actionHref,
  onActionClick,
  className = ''
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 ${className}`}>
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && (
        <div className="flex-shrink-0">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>{actionText}</span>
              <span>→</span>
            </a>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>{actionText}</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
