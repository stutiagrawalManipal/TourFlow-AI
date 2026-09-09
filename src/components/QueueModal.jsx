import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

/**
 * QueueModal component
 * Enforces business rule: Maximum 4 visitors allowed per booking.
 * Clean white/grey modal dialog.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {confirmedBooking ? 'Pass Confirmed' : 'Join Digital Queue'}
          </h3>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!confirmedBooking ? (
            <div>
              {/* Destination Summary */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{destination.name}</h4>
                  <p className="text-xs text-slate-500">{destination.location}</p>
                  <p className="text-xs text-sky-700 font-semibold mt-0.5">
                    Est. wait: {destination.estimatedWait} · Crowd: {destination.crowdLevel.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Group Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  How many visitors?
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Each group receives one consecutive digital pass (1 to 4 visitors).
                </p>

                {/* Preset numbers 1 to 4 */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectCount(num)}
                      className={`py-2.5 rounded-lg text-sm border transition-colors ${
                        visitorCount === num && !errorMessage
                          ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      {num} {num === 1 ? 'Person' : 'People'}
                    </button>
                  ))}
                </div>

                {/* Stepper Input */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">Custom size:</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={visitorCount <= 1}
                      className="w-7 h-7 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={visitorCount}
                      onChange={handleInputChange}
                      className="w-10 bg-transparent text-center font-bold text-sm text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-7 h-7 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Validation Error Message */}
                {errorMessage && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Policy note */}
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                You will receive a verified pass with estimated entry call time. Free cancellation is permitted anytime.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={visitorCount > 4}
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
                >
                  Confirm booking
                </button>
              </div>
            </div>
          ) : (
            /* Confirmation State */
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Queue Pass Reserved
              </h4>
              <p className="text-xs text-slate-500 mb-5">
                Your spot has been secured. Show this pass at the gate turnstile.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Number:</span>
                  <span className="text-amber-700 font-bold font-mono text-sm">{confirmedBooking.queueNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="text-slate-800 font-bold font-mono">{confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Visitors:</span>
                  <span className="text-slate-900 font-semibold">{confirmedBooking.visitorCount} {confirmedBooking.visitorCount === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Estimated Wait:</span>
                  <span className="text-emerald-700 font-bold">{confirmedBooking.estimatedWait}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleGoToQueue}
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>View Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
