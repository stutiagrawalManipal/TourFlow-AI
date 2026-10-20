import React from 'react';
import { User, Hash, Users, Clock, CheckCircle2 } from 'lucide-react';

/**
 * QueueProgress component
 * Renders the visual queue progression flow:
 * YOU -> #27 -> 18 PEOPLE AHEAD -> ~25 MIN
 */
export default function QueueProgress({
  queueNumber = '#27',
  positionAhead = 18,
  estimatedWait = '~25 MIN',
  status = 'In Queue',
  className = ''
}) {
  const steps = [
    {
      label: 'YOU',
      subtext: 'Ticket Holder',
      icon: User,
      accent: 'border-cyan-400 text-cyan-400 bg-cyan-950/60',
      active: true,
    },
    {
      label: queueNumber,
      subtext: 'Assigned Pass',
      icon: Hash,
      accent: 'border-cyan-400 text-cyan-300 bg-cyan-950/60 font-mono font-bold',
      active: true,
    },
    {
      label: `${positionAhead} AHEAD`,
      subtext: 'Live FIFO Queue',
      icon: Users,
      accent: 'border-amber-400 text-amber-300 bg-amber-950/40 font-mono',
      active: true,
    },
    {
      label: estimatedWait,
      subtext: 'Est. Gate Call',
      icon: Clock,
      accent: 'border-emerald-400 text-emerald-300 bg-emerald-950/40 font-mono',
      active: true,
    }
  ];

  return (
    <div className={`w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden ${className}`}>
      {/* Background subtle circuit grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-15 pointer-events-none" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            Real-Time Queue Telemetry
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
          STATUS: {status.toUpperCase()}
        </span>
      </div>

      {/* Progress timeline */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex flex-col items-center text-center">
                {/* Connecting horizontal line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-1/2 w-full h-[2px] bg-gradient-to-r from-cyan-500/40 to-slate-700 z-0" />
                )}

                {/* Node icon circle */}
                <div
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center mb-3 shadow-lg relative z-10 transition-transform ${step.accent}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Step labels */}
                <span className="text-sm font-bold text-white tracking-wide">
                  {step.label}
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {step.subtext}
                </span>

                {/* Mobile vertical down arrow indicator */}
                {index < steps.length - 1 && (
                  <div className="sm:hidden my-2 text-cyan-400 font-mono text-xs">
                    ↓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
