<<<<<<< Updated upstream
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
=======
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
>>>>>>> Stashed changes
import {
  MapPin,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Ticket,
  Star
} from 'lucide-react';
import { fetchDestination } from '../services/api';
import CrowdBadge from '../components/CrowdBadge';
import QueueModal from '../components/QueueModal';

export default function DestinationDetails() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [destination, setDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // GET /api/destinations/:id
  useEffect(() => {
    setIsLoading(true);
    fetchDestination(id)
      .then((data) => {
        setDestination(data);
        setLoadError('');
      })
      .catch((err) => {
        setDestination(null);
        setLoadError(err.status === 404 ? '' : err.message);
      })
      .finally(() => setIsLoading(false));
  }, [id, isModalOpen]); // reload after the queue modal closes to show the updated queue

  if (isLoading && !destination) {
    return <p className="text-center text-xs font-mono text-slate-400 py-20">Loading destination...</p>;
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto my-20 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center text-xs font-mono text-rose-300">
        {loadError}
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Destination not found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested tourist destination ID "{id}" could not be located.
        </p>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white font-bold rounded-lg text-sm shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to destinations</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to destinations</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CrowdBadge level={destination.crowdLevel} size="md" />
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {destination.category}
            </span>
<<<<<<< Updated upstream
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="font-bold text-slate-900">{destination.rating}</span>
              <span className="text-slate-500">({destination.reviewsCount} reviews)</span>
            </div>
=======
            <span className="text-xs font-mono text-slate-400">
              Popularity: {destination.popularityScore}/10 • Safety: {destination.safetyRating}/10
            </span>
>>>>>>> Stashed changes
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {destination.name}
          </h1>

          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{destination.location}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Ticket className="w-4 h-4" />
            <span>Join digital queue</span>
          </button>

          <Link
            to={`/ai-guide?dest=${destination.id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Ask AI Guide</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Details + Queue Intelligence Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual & Historical / Cultural Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Visual */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
<<<<<<< Updated upstream
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white font-medium">
              <span className="bg-white/95 text-slate-900 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/60">
                Recommended visit: {destination.recommendedVisitDuration}
              </span>
              <span className="bg-white/95 text-slate-900 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/60 hidden sm:inline">
                Entry: {destination.entryFee}
=======
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700">
                Ideal Stay: {destination.idealDays} days
              </span>
              <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 hidden sm:inline">
                Peak Season: {destination.peakSeason}
>>>>>>> Stashed changes
              </span>
            </div>
          </div>

          {/* Description & Cultural Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
            <div>
<<<<<<< Updated upstream
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                About this landmark
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {destination.fullDescription}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Historical background
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {destination.historicalInfo}
=======
              <h3 className="text-xl font-bold text-white mb-2 font-sans">
                Overview
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {destination.shortDescription}. {destination.fullDescription}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2 font-sans">
                Local Culture
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {destination.localCulture}
>>>>>>> Stashed changes
              </p>
            </div>

            {/* Highlights */}
            {destination.highlights && (
<<<<<<< Updated upstream
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Highlights & key areas
=======
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 font-sans">
                  Primary Attractions
>>>>>>> Stashed changes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {destination.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

<<<<<<< Updated upstream
            {/* Logistics Grid */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[11px]">Visiting Hours</span>
                <span className="text-slate-900 font-bold block mt-1">{destination.visitingHours}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[11px]">Best Time to Visit</span>
                <span className="text-amber-800 font-bold block mt-1">{destination.bestTime}</span>
=======
            {/* Visiting Logistics Quick Grid */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Best Seasons</span>
                <span className="text-amber-300 font-medium block mt-1">
                  {destination.bestSeasons.join(', ')} (avoid: {destination.avoidSeasons.join(', ') || 'none'})
                </span>
              </div>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Trip Length</span>
                <span className="text-slate-200 font-medium block mt-1">
                  {destination.minimumDays}-{destination.maximumDays} days (ideal: {destination.idealDays})
                </span>
>>>>>>> Stashed changes
              </div>
            </div>

            {/* Activities */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 font-sans">Activities</h3>
              <div className="flex flex-wrap gap-2">
                  {destination.activities.map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
            </div>

            {/* Suggested Itinerary */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 font-sans">Suggested Itinerary</h3>
              <ol className="space-y-2 text-xs text-slate-300">
                {destination.itinerary.map((day) => (
                  <li key={day} className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{day}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Safety & Local Tips */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <h3 className="text-base font-bold text-white mb-1 font-sans">Safety & Local Tips</h3>
              <p className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{destination.safetyNotes}</span>
              </p>
              <p className="flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{destination.localCustoms}</span>
              </p>
              <p className="flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Permits: {destination.permitsDetails}</span>
              </p>
            </div>

            {/* Local Food */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 font-sans">Must-Try Local Food</h3>
              <div className="flex flex-wrap gap-2">
                  {destination.localCuisine.map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Queue Intelligence Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24 space-y-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Queue Intelligence
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time turnstile monitoring
                </p>
              </div>
<<<<<<< Updated upstream
              <CrowdBadge level={destination.crowdLevel} size="sm" />
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Current queue:</span>
                <span className="text-xl font-bold font-mono text-amber-700">
                  #{destination.currentTicketNumber || 27}
=======
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 rounded">
                DEMO CROWD DATA
              </span>
            </div>

            {/* Queue Metrics Specified in Prompt */}
            <div className="space-y-4 mb-6">
              {/* Current Queue */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-400">Next Ticket:</span>
                <span className="text-2xl font-mono font-black text-amber-400">
                  #{destination.currentTicketNumber}
>>>>>>> Stashed changes
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">People waiting:</span>
                <span className="text-sm font-bold text-slate-900">
                  {destination.currentQueue} visitors
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Estimated wait:</span>
                <span className="text-sm font-bold text-emerald-700">
                  {destination.estimatedWait}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Queue capacity:</span>
                <span className="text-sm font-bold text-slate-800">
                  {destination.queueCapacity} slots
                </span>
              </div>
            </div>

<<<<<<< Updated upstream
            {/* Saturation progress bar */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-medium">
                <span>Capacity Saturation</span>
                <span className="font-bold text-slate-900">{destination.crowdPercent}%</span>
=======
            {/* Visual Queue Progress Bar */}
            <div className="space-y-2 mb-6 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Crowd Level (demo)</span>
                <span className="text-cyan-300 font-bold">{destination.crowdPercent}%</span>
>>>>>>> Stashed changes
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    destination.crowdPercent > 70 ? 'bg-amber-500' : 'bg-sky-600'
                  }`}
                  style={{ width: `${destination.crowdPercent}%` }}
                />
              </div>
            </div>

<<<<<<< Updated upstream
            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
=======
            {/* Visitor count today */}
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 mb-6 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Bookings Today:</span>
              <span className="text-slate-200 font-bold">{destination.bookingsToday}</span>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3">
>>>>>>> Stashed changes
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Join queue</span>
              </button>

              <Link
                to={`/ai-guide?dest=${destination.id}`}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Ask AI Guide about this site</span>
              </Link>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Maximum 4 visitors per pass · Free cancellation anytime
            </p>
          </div>
        </div>
      </div>

      {/* Queue Modal */}
      <QueueModal
        destination={destination}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
