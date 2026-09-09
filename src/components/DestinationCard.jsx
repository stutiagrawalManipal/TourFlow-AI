import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

/**
 * DestinationCard component
 * Crisp white travel card featuring photography, clear crowd badges, wait times, and queue data.
 */
export default function DestinationCard({ destination, onQuickJoin }) {
  if (!destination) return null;

  return (
    <div className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-card hover:shadow-card-hover">
      {/* Photography Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />
        {/* Subtle bottom shadow gradient on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Top Crowd Badge */}
        <div className="absolute top-3 left-3">
          <CrowdBadge level={destination.crowdLevel} size="sm" />
        </div>

        {/* Bottom image metadata */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-medium">
          <span className="bg-white/95 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-white/60">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>~{destination.estimatedWait} wait</span>
          </span>

          <span className="bg-white/95 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-white/60">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>#{destination.currentQueue} waiting</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
            {destination.name}
          </h3>

          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{destination.location}</span>
          </p>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {destination.shortDescription}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Link
            to={`/destinations/${destination.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
          >
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {onQuickJoin && (
            <button
              onClick={() => onQuickJoin(destination)}
              className="inline-flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Join queue</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
