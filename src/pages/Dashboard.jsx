import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Clock,
  Bookmark,
  Sparkles,
  Ticket,
  ArrowRight
} from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import StatCard from '../components/StatCard';
import DestinationCard from '../components/DestinationCard';
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
      {/* Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Good morning, {userName}.
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Plan your visit. Skip the uncertainty.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full lg:w-96">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to explore?"
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-600 rounded-xl py-2.5 pl-10 pr-24 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Active Queue Alert (if currently in a queue) */}
      {activeQueue && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-lg font-mono">
              {activeQueue.queueNumber}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 block">
                Active Queue Reservation
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {activeQueue.destinationName}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeQueue.positionAhead} visitors ahead · Estimated wait: <span className="text-emerald-700 font-bold">{activeQueue.estimatedWait}</span>
              </p>
            </div>
          </div>

          <Link
            to="/queue"
            className="inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors self-start sm:self-auto shadow-sm"
          >
            <span>View QR Pass</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Queue"
          value={activeQueue ? activeQueue.queueNumber : 'None'}
          subtitle={activeQueue ? activeQueue.destinationName : 'No active booking'}
          icon={Ticket}
          badge={activeQueue ? 'In queue' : 'Ready'}
        />

        <StatCard
          title="Estimated Wait"
          value={activeQueue ? activeQueue.estimatedWait : '0 min'}
          subtitle={activeQueue ? `${activeQueue.positionAhead} visitors ahead` : 'Walk-in access'}
          icon={Clock}
          badge="Live"
        />

        <StatCard
          title="Today's Visits"
          value="24,870"
          subtitle="Across 8 heritage monuments"
          icon={Users}
        />

        <StatCard
          title="Saved Places"
          value="4"
          subtitle="Agra, Jaipur, Delhi, Hampi"
          icon={Bookmark}
        />
      </div>

      {/* Live Crowd Intelligence Feed */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Live Crowd Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Current visitor conditions and waiting times across monitored heritage destinations.
            </p>
          </div>

          {/* Clean Segmented Filter Tabs */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs shadow-sm">
            {['ALL', 'LOW', 'MODERATE', 'HIGH'].map((level) => (
              <button
                key={level}
                onClick={() => setCrowdFilter(level)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  crowdFilter === level
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {level === 'ALL' ? 'All Sites' : level.charAt(0) + level.slice(1).toLowerCase()}
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
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-card">
            <p className="text-slate-600 text-sm">
              No destinations match your filter "{crowdFilter}".
            </p>
            <button
              onClick={() => {
                setCrowdFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-sky-700 hover:underline font-bold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Cultural Guide Teaser */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Visiting a monument today?
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
              Use the TourFlow AI Guide to ask about architecture, history, photography angles, and optimal arrival times.
            </p>
          </div>
        </div>

        <Link
          to="/ai-guide"
          className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
        >
          <span>Ask AI Guide</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
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
