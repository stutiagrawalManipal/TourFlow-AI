import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Users,
  Compass,
  Sparkles,
  ArrowLeft,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  ChevronRight,
  Info
} from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import CrowdBadge from '../components/CrowdBadge';
import QueueModal from '../components/QueueModal';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const destination = DESTINATIONS.find((d) => d.id === id);

  if (!destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Destination Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The requested tourist destination ID "{id}" could not be located.
        </p>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Destinations</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO ALL SITES</span>
        </Link>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 px-3 py-1 rounded-lg">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>COORDINATES: {destination.coordinates}</span>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <CrowdBadge level={destination.crowdLevel} size="md" />
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {destination.category}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Rating: {destination.rating} ★ ({destination.reviewsCount} reviews)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-sans tracking-tight">
            {destination.name}
          </h1>

          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{destination.location}</span>
          </p>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-cyan-950"
          >
            <Ticket className="w-4 h-4" />
            <span>Join Queue</span>
          </button>

          <Link
            to={`/ai-guide?dest=${destination.id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Use AI Guide</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Details + Dedicated Queue Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual & Historical / Cultural Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Large Destination Visual */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700">
                Recommended Duration: {destination.recommendedVisitDuration}
              </span>
              <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 hidden sm:inline">
                Entry Fee: {destination.entryFee}
              </span>
            </div>
          </div>

          {/* Description & Historical / Cultural Info */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 font-sans">
                Overview & Architecture
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {destination.fullDescription}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2 font-sans">
                Historical Significance
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {destination.historicalInfo}
              </p>
            </div>

            {/* Highlights List */}
            {destination.highlights && (
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 font-sans">
                  Key Landmark Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visiting Logistics Quick Grid */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Visiting Hours</span>
                <span className="text-slate-200 font-medium block mt-1">{destination.visitingHours}</span>
              </div>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Best Time to Visit</span>
                <span className="text-amber-300 font-medium block mt-1">{destination.bestTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dedicated Queue Intelligence Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden sticky top-24">
            {/* Top scanning accent */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-mono uppercase font-bold tracking-wider text-white">
                  Queue Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 rounded">
                LIVE SENSORS
              </span>
            </div>

            {/* Queue Metrics Specified in Prompt */}
            <div className="space-y-4 mb-6">
              {/* Current Queue */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-400">Current Queue:</span>
                <span className="text-2xl font-mono font-black text-amber-400">
                  #{destination.currentTicketNumber || 27}
                </span>
              </div>

              {/* People Waiting */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-400">People Waiting:</span>
                <span className="text-lg font-mono font-bold text-cyan-300">
                  {destination.currentQueue}
                </span>
              </div>

              {/* Estimated Wait */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-400">Estimated Wait:</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {destination.estimatedWait}
                </span>
              </div>

              {/* Queue Capacity */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-400">Queue Capacity:</span>
                <span className="text-lg font-mono font-bold text-white">
                  {destination.queueCapacity}
                </span>
              </div>
            </div>

            {/* Visual Queue Progress Bar */}
            <div className="space-y-2 mb-6 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Saturation Index</span>
                <span className="text-cyan-300 font-bold">{destination.crowdPercent}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    destination.crowdPercent > 70
                      ? 'bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500'
                      : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                  }`}
                  style={{ width: `${destination.crowdPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 slots</span>
                <span>Max: {destination.queueCapacity}</span>
              </div>
            </div>

            {/* Visitor count today */}
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 mb-6 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Today's Visitors:</span>
              <span className="text-slate-200 font-bold">{destination.visitorCountToday}</span>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Join Digital Queue</span>
              </button>

              <Link
                to={`/ai-guide?dest=${destination.id}`}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Ask AI Guide About This Site</span>
              </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <span className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                Strict max 4 visitors per pass enforced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Modal for this destination */}
      <QueueModal
        destination={destination}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
