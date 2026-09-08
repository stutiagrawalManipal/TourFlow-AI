import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Clock,
  MapPin,
  Bookmark,
  Sparkles,
  Ticket,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import StatCard from '../components/StatCard';
import DestinationCard from '../components/DestinationCard';
import CrowdBadge from '../components/CrowdBadge';
import QueueModal from '../components/QueueModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeQueue } = useQueue();
  const [searchQuery, setSearchQuery] = useState('');
  const [crowdFilter, setCrowdFilter] = useState('ALL');
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/destinations');
    }
  };

  // Filter destinations for the live crowd intelligence feed
  const filteredDestinations = DESTINATIONS.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (crowdFilter === 'ALL') return true;
    return dest.crowdLevel === crowdFilter;
  });

  const userName = user ? user.name.split(' ')[0] : 'Explorer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Dashboard Hero Header */}
      <div className="relative bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-hidden backdrop-blur-xl">
        {/* Subtle grid lines & ambient light */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-15 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>COMMAND DASHBOARD // LIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
              Good morning, {userName}.
            </h1>
            <p className="text-sm text-slate-300 font-medium">
              Plan your visit. Skip the uncertainty.
            </p>
          </div>

          {/* Compact Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full lg:w-96">
            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to explore?"
                className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-2xl py-3 pl-10 pr-24 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Active Queue Banner (If active) */}
      {activeQueue && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-amber-950/40 border border-cyan-500/40 rounded-2xl p-5 shadow-lg shadow-cyan-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-mono font-black text-lg">
              {activeQueue.queueNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  ACTIVE QUEUE RESERVATION
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              </div>
              <h3 className="text-base font-bold text-white">
                {activeQueue.destinationName}
              </h3>
              <p className="text-xs text-slate-300">
                Position: <span className="text-amber-300 font-mono font-bold">#{activeQueue.positionAhead} ahead</span> • Est. Wait: <span className="text-emerald-300 font-mono font-bold">{activeQueue.estimatedWait}</span>
              </p>
            </div>
          </div>

          <Link
            to="/queue"
            className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shadow-md shadow-cyan-950 self-start sm:self-auto"
          >
            <span>Track & View QR Pass</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Command Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Queue"
          value={activeQueue ? activeQueue.queueNumber : 'None'}
          subtitle={activeQueue ? `${activeQueue.destinationName}` : 'No active booking'}
          icon={Ticket}
          accent="cyan"
          badge={activeQueue ? 'IN QUEUE' : 'READY'}
        />

        <StatCard
          title="Estimated Wait"
          value={activeQueue ? activeQueue.estimatedWait : '0 min'}
          subtitle={activeQueue ? `${activeQueue.positionAhead} people ahead` : 'Instant access ready'}
          icon={Clock}
          accent="amber"
          badge="LIVE"
        />

        <StatCard
          title="Today's Visits"
          value="24,870"
          subtitle="Monitored across 8 heritage sites"
          icon={Users}
          accent="emerald"
          badge="+12% PEAK"
        />

        <StatCard
          title="Saved Places"
          value="4"
          subtitle="Agra, Jaipur, Delhi, Hampi"
          icon={Bookmark}
          accent="indigo"
          badge="WISHLIST"
        />
      </div>

      {/* Live Crowd Intelligence Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                LIVE CROWD INTELLIGENCE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
              Monitored Tourist Destinations
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time crowd telemetry, waiting intervals, and digital queue depths across iconic Indian landmarks.
            </p>
          </div>

          {/* Quick Crowd Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs font-mono">
            {['ALL', 'LOW', 'MODERATE', 'HIGH'].map((level) => (
              <button
                key={level}
                onClick={() => setCrowdFilter(level)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  crowdFilter === level
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onQuickJoin={(d) => setSelectedDestinationForModal(d)}
            />
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-400 text-sm">
              No destinations match your filter "{crowdFilter}".
            </p>
            <button
              onClick={() => {
                setCrowdFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-mono text-cyan-400 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Access AI Companion Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Need Historical Insights or Route Advice?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Launch the TourFlow AI Companion for architectural history, camera permissions, best visiting hours, and queue avoidance strategies.
            </p>
          </div>
        </div>

        <Link
          to="/ai-guide"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all flex-shrink-0"
        >
          <span>Ask AI Guide</span>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </Link>
      </div>

      {/* Queue Modal for quick booking */}
      <QueueModal
        destination={selectedDestinationForModal}
        isOpen={Boolean(selectedDestinationForModal)}
        onClose={() => setSelectedDestinationForModal(null)}
      />
    </div>
  );
}
