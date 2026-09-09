import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Ticket,
  Star
} from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import CrowdBadge from '../components/CrowdBadge';
import QueueModal from '../components/QueueModal';

export default function DestinationDetails() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const destination = DESTINATIONS.find((d) => d.id === id);

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
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="font-bold text-slate-900">{destination.rating}</span>
              <span className="text-slate-500">({destination.reviewsCount} reviews)</span>
            </div>
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white font-medium">
              <span className="bg-white/95 text-slate-900 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/60">
                Recommended visit: {destination.recommendedVisitDuration}
              </span>
              <span className="bg-white/95 text-slate-900 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/60 hidden sm:inline">
                Entry: {destination.entryFee}
              </span>
            </div>
          </div>

          {/* Description & Cultural Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
            <div>
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
              </p>
            </div>

            {/* Highlights */}
            {destination.highlights && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Highlights & key areas
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

            {/* Logistics Grid */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[11px]">Visiting Hours</span>
                <span className="text-slate-900 font-bold block mt-1">{destination.visitingHours}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[11px]">Best Time to Visit</span>
                <span className="text-amber-800 font-bold block mt-1">{destination.bestTime}</span>
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
              <CrowdBadge level={destination.crowdLevel} size="sm" />
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Current queue:</span>
                <span className="text-xl font-bold font-mono text-amber-700">
                  #{destination.currentTicketNumber || 27}
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

            {/* Saturation progress bar */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-medium">
                <span>Capacity Saturation</span>
                <span className="font-bold text-slate-900">{destination.crowdPercent}%</span>
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

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
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
