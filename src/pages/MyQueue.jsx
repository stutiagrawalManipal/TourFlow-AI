import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { DESTINATIONS } from '../data/destinations';
import QueueProgress from '../components/QueueProgress';
import QRPass from '../components/QRPass';
import QueueStatus from '../components/QueueStatus';

export default function MyQueue() {
  const { activeQueue, cancelQueue, joinQueue } = useQueue();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notification, setNotification] = useState('');

  const handleCancel = () => {
    cancelQueue();
    setShowCancelModal(false);
    setNotification('Your queue reservation has been cancelled.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSimulateDefaultQueue = () => {
    const taj = DESTINATIONS[0];
    joinQueue(taj, 2);
    setNotification('Sample queue pass for Taj Mahal activated.');
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            My Queue Pass
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your position in line and present your mobile QR pass at the entrance turnstiles.
          </p>
        </div>

        {activeQueue && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-3.5 py-2 bg-white/[0.05] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/[0.08] hover:border-rose-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel pass</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {activeQueue ? (
        <div className="space-y-8">
          {/* Visual Progress Stepper */}
          <QueueProgress
            queueNumber={activeQueue.queueNumber}
            positionAhead={activeQueue.positionAhead}
            estimatedWait={activeQueue.estimatedWait}
            status={activeQueue.status}
          />

          {/* 2-Column Details: Info Card & Authentic QR Pass */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Booking Information */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5">
                <div>
                  <span className="text-xs font-medium text-sky-400 block mb-1">
                    Booking Overview
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    {activeQueue.destinationName}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeQueue.destinationLocation}</span>
                  </p>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/[0.06] text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pass Status</span>
                    <div className="mt-1">
                      <QueueStatus status={activeQueue.status} size="sm" />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Group Size</span>
                    <span className="text-white font-medium block mt-1">
                      {activeQueue.visitorCount} {activeQueue.visitorCount === 1 ? 'visitor' : 'visitors'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Reserved At</span>
                    <span className="text-slate-200 font-medium block mt-1">
                      {activeQueue.bookingTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Turnstile</span>
                    <span className="text-slate-200 font-medium block mt-1">
                      {activeQueue.gate || 'Main Gate Turnstile'}
                    </span>
                  </div>
                </div>

                {/* Visitor Entry Guidance */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <h4 className="font-semibold text-white">
                    Visitor Entry Instructions:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Proceed to the automated entrance turnstile at your assigned gate.</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Have the digital pass open on your smartphone for the turnstile scanner.</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>All {activeQueue.visitorCount} visitors in your party will be admitted together.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-400">Need to change your itinerary?</span>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-slate-300 hover:text-rose-400 hover:underline transition-colors"
                  >
                    Cancel pass
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Digital Wallet-style QR Pass */}
            <div className="lg:col-span-6 flex justify-center">
              <QRPass queue={activeQueue} onCancel={() => setShowCancelModal(true)} />
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-10 text-center max-w-lg mx-auto space-y-5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              No Active Queue Pass
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              You do not have any active queue reservations right now. Browse destinations to view live crowd conditions and join a queue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/destinations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium px-5 py-2.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              <span>Explore destinations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleSimulateDefaultQueue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] px-4 py-2.5 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Simulate sample pass</span>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111827] border border-white/[0.1] rounded-2xl p-6 shadow-modal">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3.5">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-semibold text-white mb-1">
              Cancel Queue Pass?
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to surrender your pass ({activeQueue?.queueNumber}) for{' '}
              <span className="text-white font-medium">{activeQueue?.destinationName}</span>? Your place will be allocated to the next visitor in line.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 px-3 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Keep my spot
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
              >
                Yes, cancel pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
