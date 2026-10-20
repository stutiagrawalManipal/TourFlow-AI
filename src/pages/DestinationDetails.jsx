import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Compass, Sparkles, ArrowLeft, Calendar, ShieldCheck, CheckCircle2, Ticket, Info, Clock, AlertTriangle } from 'lucide-react';
import { fetchDestination } from '../services/api';
import CrowdBadge from '../components/CrowdBadge';
import QueueModal from '../components/QueueModal';

// Small helpers so missing dataset fields simply do not render
function Chips({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">{item}</span>
      ))}
    </div>
  );
}

function Section({ title, show = true, children }) {
  if (!show) return null;
  return (
    <div className="pt-4 border-t border-slate-800">
      <h3 className="text-base font-bold text-white mb-3 font-sans">{title}</h3>
      {children}
    </div>
  );
}

function Fact({ label, value, accent = 'text-slate-200' }) {
  if (!value) return null;
  return (
    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
      <span className="text-slate-500 font-mono text-[11px] block uppercase">{label}</span>
      <span className={`font-medium block mt-1 ${accent}`}>{value}</span>
    </div>
  );
}

const timeAgo = (iso) => {
  if (!iso) return 'no queue activity yet';
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return new Date(iso).toLocaleDateString();
};

export default function DestinationDetails() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [destination, setDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // GET /api/destinations/:id  (reloads after the queue modal closes)
  useEffect(() => {
    if (isModalOpen) return;
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
  }, [id, isModalOpen]);

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
        <h2 className="text-2xl font-bold text-white mb-2">Destination Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">No destination with ID "{id}" exists in the dataset.</p>
        <Link to="/destinations" className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Destinations</span>
        </Link>
      </div>
    );
  }

  const crowd = destination.crowd;
  const days = destination.days || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link to="/destinations" className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO ALL DESTINATIONS</span>
        </Link>
        {destination.coordinates && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 px-3 py-1 rounded-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>COORDINATES: {destination.coordinates}</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <CrowdBadge level={crowd.crowdLevel} size="md" />
            {destination.tripTypes.slice(0, 3).map((type) => (
              <span key={type} className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">{type}</span>
            ))}
            {destination.popularityScore && <span className="text-xs font-mono text-slate-400">Popularity {destination.popularityScore}/10</span>}
            {destination.safetyRating && <span className="text-xs font-mono text-slate-400">• Safety {destination.safetyRating}/10</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-sans tracking-tight">{destination.name}</h1>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{destination.location}{destination.region ? ` • ${destination.region}` : ''}</span>
          </p>
        </div>

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
            <span>Ask the Guide</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: dataset information */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <img src={destination.imageUrl} alt={destination.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
              {days.ideal && (
                <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700">Ideal stay: {days.ideal} days</span>
              )}
              <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 hidden sm:inline">Image placeholder - no photos in dataset</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 font-sans">Overview</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{destination.shortDescription}</p>
              {destination.reviewSummary && <p className="text-sm text-slate-400 leading-relaxed mt-2">{destination.reviewSummary}</p>}
            </div>

            <Section title="Primary Attractions" show={destination.attractions.length > 0}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.attractions.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Activities" show={destination.activities.length > 0}><Chips items={destination.activities} /></Section>
            <Section title="Hidden Gems" show={destination.hiddenGems.length > 0}><Chips items={destination.hiddenGems} /></Section>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <Fact label="Best Seasons" value={destination.bestSeasons.join(', ')} accent="text-amber-300" />
              <Fact label="Peak Season" value={destination.peakSeason} />
              <Fact label="Off Season" value={destination.offSeason} />
              <Fact label="Trip Length" value={days.minimum ? `${days.minimum}-${days.maximum} days (ideal ${days.ideal})` : ''} />
              <Fact label="Good For" value={destination.idealFor.join(', ')} />
              <Fact label="Languages" value={destination.languages.join(', ')} />
              <Fact label="Nearest Airport" value={destination.nearestAirport} />
              <Fact label="Nearest Railway Station" value={destination.nearestRailwayStation} />
            </div>

            <Section title="Suggested Itinerary" show={destination.itinerary.length > 0}>
              <ol className="space-y-2 text-xs text-slate-300">
                {destination.itinerary.map((day) => (
                  <li key={day} className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{day}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Safety & Local Tips" show={Boolean(destination.safetyNotes || destination.localCustoms)}>
              <div className="space-y-2 text-xs text-slate-300">
                {destination.safetyNotes && (
                  <p className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /><span>{destination.safetyNotes}</span></p>
                )}
                {destination.specialConsiderations && (
                  <p className="flex items-start gap-2"><Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /><span>{destination.specialConsiderations}</span></p>
                )}
                {destination.localCustoms && (
                  <p className="flex items-start gap-2"><Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /><span>{destination.localCustoms}</span></p>
                )}
                <p className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Permits: {destination.permitsRequired ? destination.permitsDetails || 'Required' : destination.permitsDetails || 'Not required'}</span>
                </p>
              </div>
            </Section>

            <Section title="Must-Try Local Food" show={destination.localCuisine.length > 0}><Chips items={destination.localCuisine} /></Section>

            {destination.lastDatasetUpdate && (
              <p className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">Dataset information last updated: {destination.lastDatasetUpdate}</p>
            )}
          </div>
        </div>

        {/* Right column: crowd & queue panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="text-sm font-mono uppercase font-bold tracking-wider text-white">Crowd & Queue</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">ESTIMATE</span>
            </div>

            {!crowd.queueOpen && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Queue closed by staff{crowd.notice ? `: ${crowd.notice}` : '.'}</span>
              </div>
            )}
            {crowd.queueOpen && crowd.notice && (
              <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-200">{crowd.notice}</div>
            )}

            <div className="space-y-3 mb-5">
              <PanelRow label="Crowd Level" value={<CrowdBadge level={crowd.crowdLevel} size="sm" />} />
              <PanelRow label="Season Now" value={<span className="text-sm font-mono text-slate-200">{crowd.season}</span>} />
              <PanelRow label="People Waiting" value={<span className="text-lg font-mono font-bold text-cyan-300">{crowd.peopleWaiting}</span>} />
              <PanelRow label="Est. Wait" value={<span className="text-lg font-mono font-bold text-emerald-400">~{crowd.estimatedWaitMinutes} min</span>} />
              <PanelRow label="Checked In Now" value={<span className="text-lg font-mono font-bold text-white">{crowd.peopleInside}</span>} />
            </div>

            <div className="space-y-2 mb-5 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Queue vs 1-hour entry capacity</span>
                <span className="text-cyan-300 font-bold">{crowd.queueLoadPercent}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${crowd.queueLoadPercent > 70 ? 'bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'}`}
                  style={{ width: `${crowd.queueLoadPercent}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                Entry rate: {crowd.entryRatePerMinute} people/min ({crowd.entryRateMeasured ? 'measured from recent check-ins' : 'planning assumption'})
              </p>
            </div>

            <p className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Last queue activity: {timeAgo(crowd.lastActivityAt)}{crowd.isStale ? ' (stale)' : ''}
            </p>
            <p className="text-[10px] text-slate-500 mb-5">{crowd.dataSource}</p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Join Digital Queue</span>
            </button>
            <p className="mt-4 text-center text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Max 4 visitors per booking, checked by the server
            </p>
          </div>
        </div>
      </div>

      <QueueModal destination={destination} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function PanelRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
      <span className="text-xs font-mono uppercase text-slate-400">{label}:</span>
      {value}
    </div>
  );
}
