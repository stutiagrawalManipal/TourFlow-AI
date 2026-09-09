import React from 'react';

/**
 * StatCard component
 * Clean, modern metric card with crisp white surface and soft slate borders.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              {value}
            </h3>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 pt-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
