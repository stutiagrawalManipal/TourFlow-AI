import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
<<<<<<< Updated upstream
import { Search, Compass, ArrowUpDown } from 'lucide-react';
import { DESTINATIONS, CATEGORIES, SORT_OPTIONS } from '../data/destinations';
=======
import { Search, SlidersHorizontal, MapPin, Compass, ArrowUpDown } from 'lucide-react';
import { CATEGORIES, SORT_OPTIONS } from '../data/destinations';
import { fetchDestinations, fetchStates } from '../services/api';
>>>>>>> Stashed changes
import DestinationCard from '../components/DestinationCard';
import QueueModal from '../components/QueueModal';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Load state names once for the state filter
  useEffect(() => {
    fetchStates().then(setStates).catch(() => setStates([]));
  }, []);

  // GET /api/destinations?search=...&state=... (small delay while typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      fetchDestinations({ search: searchTerm.trim(), state: selectedState })
        .then((data) => {
          setDestinations(data);
          setLoadError('');
        })
        .catch((err) => setLoadError(err.message))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedState]);

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

<<<<<<< Updated upstream
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

=======
  // Filter chips & sorting (search and state filtering are done by the backend)
  const filteredDestinations = useMemo(() => {
    let result = destinations.filter((dest) => {
>>>>>>> Stashed changes
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Low Crowd') return dest.crowdLevel === 'LOW';
      if (activeFilter === 'Moderate') return dest.crowdLevel === 'MODERATE';
      if (activeFilter === 'High') return dest.crowdLevel === 'HIGH';
      return dest.tripTypes.includes(activeFilter);
    });

    if (sortBy === 'wait-asc') {
      result.sort((a, b) => parseInt(a.estimatedWait, 10) - parseInt(b.estimatedWait, 10));
    } else if (sortBy === 'crowd-asc') {
      result.sort((a, b) => a.crowdPercent - b.crowdPercent);
    } else if (sortBy === 'popularity-desc') {
      result.sort((a, b) => b.popularityScore - a.popularityScore);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [destinations, activeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Explore Destinations
          </h1>
<<<<<<< Updated upstream
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            View live visitor conditions, waiting times, and reserve digital entry passes for prominent Indian heritage landmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm">
          <Compass className="w-4 h-4 text-sky-600" />
          <span>Showing {filteredDestinations.length} of {DESTINATIONS.length} destinations</span>
=======
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Indian tourist destinations from the TourFlow dataset, with digital queue access. Crowd levels shown are demo values.
          </p>
        </div>

        {/* Total count badge */}
        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Showing {filteredDestinations.length} of {destinations.length} Sites</span>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-700 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-slate-500">Sort by:</span>
=======
          {/* State Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-slate-500 uppercase">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All States</option>
              {states.map((state) => (
                <option key={state} value={state} className="bg-slate-900 text-slate-200">
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-slate-500 uppercase">Sort:</span>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      {/* Grid of Destinations */}
      {filteredDestinations.length > 0 ? (
=======
      {/* Grid of Destination Cards */}
      {loadError ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center text-xs font-mono text-rose-300 max-w-lg mx-auto">
          {loadError}
        </div>
      ) : isLoading && destinations.length === 0 ? (
        <p className="text-center text-xs font-mono text-slate-400 py-12">Loading destinations...</p>
      ) : filteredDestinations.length > 0 ? (
>>>>>>> Stashed changes
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
              setSelectedState('');
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
