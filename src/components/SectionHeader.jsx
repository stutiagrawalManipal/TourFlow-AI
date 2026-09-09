import React from 'react';

/**
 * SectionHeader component
 * Clean section title with category eyebrow, dark slate heading, and action link.
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
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && (
        <div className="flex-shrink-0">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
            >
              <span>{actionText}</span>
              <span>→</span>
            </a>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
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
