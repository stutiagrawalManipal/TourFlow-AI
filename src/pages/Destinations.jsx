import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Compass, ArrowUpDown, Tag } from 'lucide-react';
import { CROWD_FILTERS, SORT_OPTIONS } from '../data/destinations';
import { fetchDestinations, fetchFilters } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import QueueModal from '../components/QueueModal';

const LEVEL_ORDER = { LOW: 0, MODERATE: 1, HIGH: 2 };

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [crowdFilter, setCrowdFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({ states: [], categories: [] });
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState(null);

  // State and category lists for the dropdowns
  useEffect(() => {
    fetchFilters().then(setFilters).catch(() => setFilters({ states: [], categories: [] }));
  }, []);

  // GET /api/destinations?search=&state=&category=  (small delay while typing)
  const loadDestinations = () => {
    setIsLoading(true);
    fetchDestinations({ search: searchTerm.trim(), state: selectedState, category: selectedCategory })
      .then((data) => {
        setDestinations(data);
        setLoadError('');
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadDestinations, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedState, selectedCategory]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchParams(value.trim() ? { q: value.trim() } : {});
  };

  const clearAll = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedCategory('');
    setCrowdFilter('All');
    setSearchParams({});
  };

  // Crowd filter & sorting happen here; search/state/category on the server
  const visibleDestinations = useMemo(() => {
    const result = destinations.filter((d) => crowdFilter === 'All' || d.crowd?.crowdLevel === crowdFilter);
    const sorters = {
      recommended: (a, b) => (b.popularityScore || 0) - (a.popularityScore || 0) || a.name.localeCompare(b.name),
      name: (a, b) => a.name.localeCompare(b.name),
      'wait-asc': (a, b) => a.crowd.estimatedWaitMinutes - b.crowd.estimatedWaitMinutes,
      'crowd-asc': (a, b) => LEVEL_ORDER[a.crowd.crowdLevel] - LEVEL_ORDER[b.crowd.crowdLevel],
    };
    return [...result].sort(sorters[sortBy] || sorters.recommended);
  }, [destinations, crowdFilter, sortBy]);

  const selectClass = 'bg-transparent text-white font-semibold focus:outline-none cursor-pointer max-w-[11rem]';
  const optionClass = 'bg-slate-900 text-slate-200';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">DESTINATION DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">Explore Destinations</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Tourist destinations across India from the TourFlow dataset. Crowd levels and waiting times are estimates, not live sensor data.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Showing {visibleDestinations.length} of {destinations.length}</span>
        </div>
      </div>

      {/* Search Bar & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by destination, state, district or attraction..."
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-14 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white">
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="text-slate-500 uppercase">State:</span>
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={selectClass}>
                <option value="" className={optionClass}>All States</option>
                {filters.states.map((s) => <option key={s} value={s} className={optionClass}>{s}</option>)}
              </select>
            </label>

            <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
              <Tag className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="text-slate-500 uppercase">Type:</span>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={selectClass}>
                <option value="" className={optionClass}>All Types</option>
                {filters.categories.map((c) => <option key={c} value={c} className={optionClass}>{c}</option>)}
              </select>
            </label>

            <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="text-slate-500 uppercase">Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} className={optionClass}>{opt.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* Crowd filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <span className="text-slate-500 text-[11px] uppercase mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Est. crowd:
          </span>
          {CROWD_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCrowdFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                crowdFilter === f.value
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loadError ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center text-xs font-mono text-rose-300 max-w-lg mx-auto space-y-3">
          <p>{loadError}</p>
          <button onClick={loadDestinations} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl">Try again</button>
        </div>
      ) : isLoading && destinations.length === 0 ? (
        <p className="text-center text-xs font-mono text-slate-400 py-12">Loading destinations...</p>
      ) : visibleDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleDestinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} onQuickJoin={(d) => setSelectedDestinationForModal(d)} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Destinations Found</h3>
          <p className="text-xs text-slate-400 mb-5">Nothing matches your search and filters.</p>
          <button onClick={clearAll} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-mono uppercase">
            Clear Search & Filters
          </button>
        </div>
      )}

      <QueueModal
        destination={selectedDestinationForModal}
        isOpen={Boolean(selectedDestinationForModal)}
        onClose={() => {
          setSelectedDestinationForModal(null);
          loadDestinations(); // show the updated queue numbers
        }}
      />
    </div>
  );
}
