import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowUpRight, Compass } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

/**
 * DestinationCard component
 * Displays destination photo, crowd badge, wait time, queue depth, and action links.
 */
export default function DestinationCard({ destination, onQuickJoin }) {
  if (!destination) return null;

  return (
    <div className="group relative bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-950/30 transition-all duration-300 flex flex-col">
      {/* Image Container with telemetry overlay */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <CrowdBadge level={destination.crowdLevel} size="sm" />
        </div>

        {/* Coordinates micro-tag */}
        <div className="absolute top-3 right-3 bg-slate-950/75 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>{destination.coordinates}</span>
        </div>

        {/* Live Wait Pill on bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
          <span className="bg-slate-900/90 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>WAIT: {destination.estimatedWait}</span>
          </span>

          <span className="bg-slate-900/90 backdrop-blur-md text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>QUEUE: #{destination.currentQueue}</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-sans">
              {destination.name}
            </h3>
          </div>

          <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{destination.location}</span>
          </p>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
            {destination.shortDescription}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
          <Link
            to={`/destinations/${destination.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700/80 py-2 px-3 rounded-lg text-xs font-medium transition-all"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>

          {onQuickJoin && (
            <button
              onClick={() => onQuickJoin(destination)}
              className="inline-flex items-center justify-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 py-2 px-3 rounded-lg text-xs font-medium font-mono transition-all"
              title="Quick Queue Pass"
            >
              <span>Queue</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
