import React from 'react';
import { User, Hash, Users, Clock } from 'lucide-react';

/**
 * QueueProgress component
 * Clean, production-grade queue progression timeline in light/grey theme:
 * Pass Holder -> Assigned Pass -> Visitors Ahead -> Estimated Wait
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
      title: 'Pass Holder',
      detail: 'Registered visitor',
      icon: User,
    },
    {
      title: `Queue ${queueNumber}`,
      detail: 'FIFO Assigned',
      icon: Hash,
    },
    {
      title: `${positionAhead} Ahead`,
      detail: 'Moving continuously',
      icon: Users,
    },
    {
      title: estimatedWait,
      detail: 'Estimated entry call',
      icon: Clock,
    }
  ];

  return (
    <div className={`w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Live Queue Progression
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnstiles advance on a strict first-in, first-out basis
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
          Status: {status}
        </span>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="relative flex flex-col items-center text-center p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              {/* Connecting line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[65%] w-[70%] h-[2px] bg-slate-200 z-0" />
              )}

              {/* Node Circle */}
              <div className="w-10 h-10 rounded-full bg-sky-100/70 border border-sky-200 text-sky-700 flex items-center justify-center mb-2.5 relative z-10 shadow-sm">
                <Icon className="w-4 h-4" />
              </div>

              <span className="text-sm font-bold text-slate-900">
                {step.title}
              </span>
              <span className="text-xs text-slate-500 mt-0.5">
                {step.detail}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
