import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  Users,
  MapPin,
  Compass,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  QrCode,
  CheckCircle2,
  XCircle
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
    setNotification('Your queue pass has been cancelled.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSimulateDefaultQueue = () => {
    const taj = DESTINATIONS[0];
    joinQueue(taj, 2);
    setNotification('Simulated sample queue pass for Taj Mahal activated.');
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">
              REAL-TIME QUEUE MONITOR
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
            My Queue Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your position in the digital FIFO queue and present your pass at the entrance gate.
          </p>
        </div>

        {activeQueue && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Cancel Queue</span>
            </button>
          </div>
        )}
      </div>

      {notification && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-xs font-mono text-cyan-300 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {activeQueue ? (
        <div className="space-y-8">
          {/* Visual Queue Progression Flow */}
          <QueueProgress
            queueNumber={activeQueue.queueNumber}
            positionAhead={activeQueue.positionAhead}
            estimatedWait={activeQueue.estimatedWait}
            status={activeQueue.status}
          />

          {/* 2-Column Layout: Queue Info & High-Tech QR Pass */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Queue Metadata and Gate Instructions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-1">
                    ACTIVE BOOKING SUMMARY
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    {activeQueue.destinationName}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeQueue.destinationLocation}</span>
                  </p>
                </div>

                {/* Status and Parameters Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase">Booking Status</span>
                    <div className="mt-1">
                      <QueueStatus status={activeQueue.status} size="sm" />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase">Party Size</span>
                    <span className="text-white font-bold block mt-1">
                      {activeQueue.visitorCount} {activeQueue.visitorCount === 1 ? 'Visitor' : 'Visitors'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase">Booking Time</span>
                    <span className="text-slate-300 block mt-1">
                      {activeQueue.bookingTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase">Assigned Gate</span>
                    <span className="text-cyan-400 font-bold block mt-1">
                      {activeQueue.gate || 'Main Entrance'}
                    </span>
                  </div>
                </div>

                {/* Gate Procedure Guide */}
                <div className="space-y-3 text-xs text-slate-300">
                  <h4 className="font-semibold text-white uppercase font-mono tracking-wider text-[11px]">
                    Visitor Entry Instructions:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Proceed to the TourFlow automated turnstiles at your assigned gate.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Have the QR pass on your screen ready for the optical scanner.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Maximum {activeQueue.visitorCount} visitors will be admitted on this single verified token.</span>
                    </li>
                  </ul>
                </div>

                {/* Cancel Queue Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Need to change plans?
                  </span>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 hover:underline uppercase"
                  >
                    Cancel Queue Reservation
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual QR Travel Pass */}
            <div className="lg:col-span-6 flex justify-center">
              <QRPass queue={activeQueue} onCancel={() => setShowCancelModal(true)} />
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white font-sans">
              No Active Queue Pass
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
              You haven't joined a digital queue yet. Explore destinations to check crowd levels and reserve your entry slot with zero waiting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/destinations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleSimulateDefaultQueue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate Sample Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Cancel Active Queue Pass?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to surrender your spot (#{activeQueue?.queueNumber}) for{' '}
              <span className="text-white font-semibold">{activeQueue?.destinationName}</span>? Your place will immediately be reassigned to the next visitor in the FIFO queue.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono uppercase transition-colors"
              >
                Keep My Spot
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shadow-lg shadow-rose-950"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
