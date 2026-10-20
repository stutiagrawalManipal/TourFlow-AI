import React from 'react';

/**
 * StatCard component
 * Displays command center metrics with icons, subtle grid borders, and trend labels.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'cyan', // 'cyan', 'amber', 'emerald', 'indigo'
  badge
}) {
  const accentStyles = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      valueColor: 'text-cyan-300',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      valueColor: 'text-amber-300',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueColor: 'text-emerald-300',
    },
    indigo: {
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      valueColor: 'text-indigo-300',
    },
  };

  const style = accentStyles[accent] || accentStyles.cyan;

  return (
    <div className={`relative bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm transition-all duration-300 group ${style.border}`}>
      {/* Corner coordinate accent */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight font-sans ${style.valueColor}`}>
              {value}
            </h3>
            {badge && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-slate-500"></span>
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg border ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
