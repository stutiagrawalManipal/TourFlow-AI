import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, AlertCircle, CheckCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

/**
 * QueueModal component
 * Enforces business rule: Maximum 4 visitors per booking.
 */
export default function QueueModal({ destination, isOpen, onClose }) {
  const [visitorCount, setVisitorCount] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const { joinQueue } = useQueue();
  const navigate = useNavigate();

  if (!isOpen || !destination) return null;

  const handleSelectCount = (num) => {
    if (num > 4) {
      setErrorMessage('Maximum 4 visitors are allowed per booking.');
      return;
    }
    setErrorMessage('');
    setVisitorCount(num);
  };

  const handleIncrement = () => {
    if (visitorCount >= 4) {
      setErrorMessage('Maximum 4 visitors are allowed per booking.');
      return;
    }
    setErrorMessage('');
    setVisitorCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (visitorCount > 1) {
      setErrorMessage('');
      setVisitorCount(prev => prev - 1);
    }
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val <= 0) {
      setVisitorCount(1);
      setErrorMessage('');
    } else if (val > 4) {
      setVisitorCount(val);
      setErrorMessage('Maximum 4 visitors are allowed per booking.');
    } else {
      setVisitorCount(val);
      setErrorMessage('');
    }
  };

  const handleConfirm = () => {
    if (visitorCount > 4) {
      setErrorMessage('Maximum 4 visitors are allowed per booking.');
      return;
    }

    const res = joinQueue(destination, visitorCount);
    if (res.success) {
      setConfirmedBooking(res.booking);
    } else {
      setErrorMessage(res.error || 'Unable to join queue.');
    }
  };

  const handleGoToQueue = () => {
    onClose();
    navigate('/queue');
  };

  const handleCloseModal = () => {
    setConfirmedBooking(null);
    setVisitorCount(1);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header telemetry accent */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-semibold">
              Digital FIFO Queue Pass
            </span>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!confirmedBooking ? (
            <div>
              {/* Destination Summary */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-6">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="text-base font-bold text-white">{destination.name}</h4>
                  <p className="text-xs text-slate-400">{destination.location}</p>
                  <p className="text-[11px] font-mono text-cyan-400 mt-1">
                    Live Crowd: {destination.crowdLevel} • Est. Wait: {destination.estimatedWait}
                  </p>
                </div>
              </div>

              {/* Visitor Selection Question */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  How many visitors?
                </label>
                <p className="text-xs text-slate-400 mb-4">
                  Select group size to reserve consecutive FIFO queue slots.
                </p>

                {/* Preset quick buttons 1-4 */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectCount(num)}
                      className={`py-3 rounded-xl font-mono text-sm font-bold border transition-all ${
                        visitorCount === num && !errorMessage
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {num} {num === 1 ? 'Person' : 'People'}
                    </button>
                  ))}
                </div>

                {/* Counter with +/- buttons */}
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">Custom Input:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={visitorCount <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={visitorCount}
                      onChange={handleInputChange}
                      className="w-12 bg-transparent text-center font-mono font-bold text-lg text-white border-b border-cyan-500/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Validation Error Message */}
                {errorMessage && (
                  <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Booking terms disclaimer */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 mb-6 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Digital FIFO passes are verified at security gates via smartphone QR scan. Free cancellation is permitted anytime before your number is called.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={visitorCount > 4}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-cyan-950/40"
                >
                  Confirm & Join Queue
                </button>
              </div>
            </div>
          ) : (
            /* Queue Confirmation State */
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                Queue Pass Generated!
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Your spot has been secured in the TourFlow digital FIFO queue.
              </p>

              {/* Confirmation Details Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left mb-6 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="text-cyan-400 font-bold">{confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Queue Number:</span>
                  <span className="text-amber-400 font-bold text-sm">{confirmedBooking.queueNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Visitors:</span>
                  <span className="text-white">{confirmedBooking.visitorCount} {confirmedBooking.visitorCount === 1 ? 'Person' : 'People'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">People Ahead:</span>
                  <span className="text-white">{confirmedBooking.positionAhead}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Estimated Wait:</span>
                  <span className="text-emerald-400 font-bold">{confirmedBooking.estimatedWait}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleGoToQueue}
                  className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>View QR Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
