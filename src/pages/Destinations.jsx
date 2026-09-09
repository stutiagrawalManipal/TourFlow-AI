import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Compass, ArrowUpDown } from 'lucide-react';
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

  const filteredDestinations = useMemo(() => {
    let result = DESTINATIONS.filter((dest) => {
      const query = searchTerm.toLowerCase();
      const matchesText =
        dest.name.toLowerCase().includes(query) ||
        dest.location.toLowerCase().includes(query) ||
        dest.state.toLowerCase().includes(query) ||
        dest.category.toLowerCase().includes(query) ||
        dest.shortDescription.toLowerCase().includes(query);

      if (!matchesText) return false;

      if (activeFilter === 'All') return true;
      if (activeFilter === 'Low Crowd') return dest.crowdLevel === 'LOW';
      if (activeFilter === 'Moderate') return dest.crowdLevel === 'MODERATE';
      if (activeFilter === 'High') return dest.crowdLevel === 'HIGH';
      if (activeFilter === 'Historical') return dest.category === 'Historical';
      if (activeFilter === 'Cultural') return dest.category === 'Cultural';

      return true;
    });

    if (sortBy === 'wait-asc') {
      result.sort((a, b) => parseInt(a.estimatedWait, 10) - parseInt(b.estimatedWait, 10));
    } else if (sortBy === 'crowd-asc') {
      result.sort((a, b) => a.crowdPercent - b.crowdPercent);
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchTerm, activeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Explore Destinations
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            View live visitor conditions, waiting times, and reserve digital entry passes for prominent Indian heritage landmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm">
          <Compass className="w-4 h-4 text-sky-600" />
          <span>Showing {filteredDestinations.length} of {DESTINATIONS.length} destinations</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by monument name, city, state, or keywords..."
              className="w-full bg-white border border-slate-300 focus:border-sky-600 rounded-xl py-2.5 pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-700 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors border font-semibold ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Destinations */}
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
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-card">
          <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No destinations found</h3>
          <p className="text-xs text-slate-500 mb-5">
            We couldn't find any sites matching "{searchTerm}" under filter "{activeFilter}".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('All');
              setSearchParams({});
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold"
          >
            Clear filters
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
