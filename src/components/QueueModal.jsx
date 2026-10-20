import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { newRequestId } from '../services/api';
import CrowdBadge from './CrowdBadge';
import QRCode from './QRCode';
import { passText } from './QRPass';

/**
 * QueueModal component
 * Tourist chooses the group size and joins the destination's FIFO queue.
 * The backend validates everything (max 4 people, duplicates, queue open);
 * the confirmation only shows what the server returned.
 */
export default function QueueModal({ destination, isOpen, onClose }) {
  const [visitorCount, setVisitorCount] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(newRequestId);

  const { user } = useAuth();
  const { joinQueue } = useQueue();
  const navigate = useNavigate();

  // a fresh request id every time the modal opens
  useEffect(() => {
    if (isOpen) setRequestId(newRequestId());
  }, [isOpen]);

  if (!isOpen || !destination) return null;

  const crowd = destination.crowd || {};

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setVisitorCount(Number.isNaN(value) ? '' : value);
    setErrorMessage(value > 4 ? 'Maximum 4 visitors are allowed per booking.' : '');
  };

  const handleConfirm = async () => {
    if (isSubmitting) return; // ignore double clicks
    setIsSubmitting(true);
    setErrorMessage('');
    const result = await joinQueue(destination, visitorCount, requestId);
    setIsSubmitting(false);

    if (result.success) {
      setConfirmedBooking(result.booking);
    } else {
      setErrorMessage(result.error || 'Unable to join the queue.');
      setRequestId(newRequestId()); // a corrected retry is a new request
    }
  };

  const handleCloseModal = () => {
    setConfirmedBooking(null);
    setVisitorCount(1);
    setErrorMessage('');
    onClose();
  };

  const goTo = (path) => {
    handleCloseModal();
    navigate(path);
  };

  let body;
  if (!user) {
    body = (
      <div className="text-center py-4 space-y-4">
        <LogIn className="w-10 h-10 text-cyan-400 mx-auto" />
        <p className="text-sm text-slate-300">Please log in or create a free tourist account to join the queue.</p>
        <div className="flex gap-3">
          <button onClick={() => goTo('/login')} className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm">
            Log In
          </button>
          <button onClick={() => goTo('/register')} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm">
            Register
          </button>
        </div>
      </div>
    );
  } else if (user.role !== 'tourist') {
    body = (
      <p className="text-sm text-slate-300 text-center py-6">
        Administrator accounts manage queues but cannot book. Log in with a tourist account to try booking.
      </p>
    );
  } else if (!confirmedBooking) {
    body = (
      <div>
        {/* Destination summary */}
        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-5">
          <img src={destination.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="text-base font-bold text-white truncate">{destination.name}</h4>
            <p className="text-xs text-slate-400 truncate">{destination.location}</p>
          </div>
        </div>

        {/* Crowd & wait (estimates) */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-center">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Crowd</span>
            <CrowdBadge level={crowd.crowdLevel} size="sm" />
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">In queue</span>
            <span className="text-lg font-mono font-bold text-cyan-300">{crowd.peopleWaiting ?? 0}</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Est. wait</span>
            <span className="text-lg font-mono font-bold text-emerald-400">~{crowd.estimatedWaitMinutes ?? 0}m</span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-slate-500 mb-5">
          Estimates only - based on the dataset season and the TourFlow queue, not live sensors.
        </p>

        {crowd.queueOpen === false && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            The queue is currently closed by staff{crowd.notice ? `: ${crowd.notice}` : '.'}
          </div>
        )}

        {/* Group size */}
        <label className="block text-sm font-semibold text-slate-200 mb-1">How many visitors?</label>
        <p className="text-xs text-slate-400 mb-3">Maximum 4 people per booking (checked by the server).</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                setVisitorCount(num);
                setErrorMessage('');
              }}
              className={`py-3 rounded-xl font-mono text-sm font-bold border transition-all ${
                visitorCount === num
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              {num} {num === 1 ? 'Person' : 'People'}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Or type a number:</span>
          <input
            type="number"
            min="1"
            value={visitorCount}
            onChange={handleInputChange}
            className="w-16 bg-transparent text-center font-mono font-bold text-lg text-white border-b border-cyan-500/50 focus:outline-none"
          />
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="mt-5 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 mb-5 flex items-start gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>You will get a QR queue pass. Staff check you in at the entrance. You can cancel while you are waiting.</span>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={handleCloseModal} className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm"
          >
            {isSubmitting ? 'Booking...' : 'Confirm & Join Queue'}
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="text-center py-2">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Booking Confirmed</h3>
        <p className="text-xs text-slate-400 mb-4">Confirmed by the TourFlow server. Your QR pass is ready.</p>

        <div className="inline-block p-2 bg-white rounded-xl mb-4">
          <QRCode value={passText(confirmedBooking)} size={132} />
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left mb-5 space-y-2 font-mono text-xs">
          <Row label="Booking ID" value={confirmedBooking.bookingId} className="text-cyan-400 font-bold" />
          <Row label="Queue Position" value={`#${confirmedBooking.queuePosition}`} className="text-amber-400 font-bold" />
          <Row label="Visitors" value={`${confirmedBooking.numberOfPeople} ${confirmedBooking.numberOfPeople === 1 ? 'Person' : 'People'}`} />
          <Row label="People Ahead" value={confirmedBooking.peopleAhead} />
          <Row label="Estimated Wait" value={`~${confirmedBooking.estimatedWaitMinutes} min (estimate)`} className="text-emerald-400 font-bold" />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={handleCloseModal} className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium">
            Close
          </button>
          <button
            type="button"
            onClick={() => goTo('/queue')}
            className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
          >
            <span>Open My Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-semibold">Join Digital Queue</span>
          </div>
          <button onClick={handleCloseModal} aria-label="Close" className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{body}</div>
        {!user && (
          <p className="px-6 pb-5 -mt-2 text-center text-[11px] text-slate-500">
            Staff member? <Link to="/admin/login" onClick={handleCloseModal} className="text-cyan-400 hover:underline">Admin login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, className = 'text-white' }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}:</span>
      <span className={className}>{value}</span>
    </div>
  );
}
