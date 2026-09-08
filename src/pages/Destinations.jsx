import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Compass, ArrowUpDown } from 'lucide-react';
import { DESTINATIONS, CATEGORIES, SORT_OPTIONS } from '../data/destinations';
import DestinationCard from '../components/DestinationCard';
import QueueModal from '../components/QueueModal';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState(null);

  // Sync state if url changes
  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Filter & Sort Logic
  const filteredDestinations = useMemo(() => {
    let result = DESTINATIONS.filter((dest) => {
      // Text search match
      const query = searchTerm.toLowerCase();
      const matchesText =
        dest.name.toLowerCase().includes(query) ||
        dest.location.toLowerCase().includes(query) ||
        dest.state.toLowerCase().includes(query) ||
        dest.category.toLowerCase().includes(query) ||
        dest.shortDescription.toLowerCase().includes(query);

      if (!matchesText) return false;

      // Filter chips
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Low Crowd') return dest.crowdLevel === 'LOW';
      if (activeFilter === 'Moderate') return dest.crowdLevel === 'MODERATE';
      if (activeFilter === 'High') return dest.crowdLevel === 'HIGH';
      if (activeFilter === 'Historical') return dest.category === 'Historical';
      if (activeFilter === 'Cultural') return dest.category === 'Cultural';

      return true;
    });

    // Sorting
    if (sortBy === 'wait-asc') {
      result.sort((a, b) => parseInt(a.estimatedWait, 10) - parseInt(b.estimatedWait, 10));
    } else if (sortBy === 'crowd-asc') {
      result.sort((a, b) => a.crowdPercent - b.crowdPercent);
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Recommended: keep default order (custom curated)
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchTerm, activeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">
              DESTINATION DIRECTORY
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
            Explore Destinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live telemetry, wait time forecasting, and instant digital queue access for premier Indian monuments.
          </p>
        </div>

        {/* Total count badge */}
        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Showing {filteredDestinations.length} of {DESTINATIONS.length} Sites</span>
        </div>
      </div>

      {/* Search Bar & Controls Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by destination name, city, state, or keywords..."
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-slate-500 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <span className="text-slate-500 text-[11px] uppercase mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Filter:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Destination Cards */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onQuickJoin={(d) => setSelectedDestinationForModal(d)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Destinations Found</h3>
          <p className="text-xs text-slate-400 mb-5">
            We couldn't find any sites matching "{searchTerm}" under filter "{activeFilter}".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('All');
              setSearchParams({});
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-mono uppercase"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Queue Modal for quick booking */}
      <QueueModal
        destination={selectedDestinationForModal}
        isOpen={Boolean(selectedDestinationForModal)}
        onClose={() => setSelectedDestinationForModal(null)}
      />
    </div>
  );
}
