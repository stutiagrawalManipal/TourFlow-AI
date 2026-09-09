import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-sm py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                TourFlow AI
              </span>
              <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium">
                College SE Capstone
              </span>
            </div>
            <p className="text-slate-600 text-sm max-w-md leading-relaxed">
              Smart Tourism. Less Waiting. An intelligent crowd intelligence and digital queue management platform helping tourists enjoy world-class heritage sites without enduring long physical queues.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 text-xs font-semibold uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/destinations" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Heritage Destinations
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Tourist Dashboard
                </Link>
              </li>
              <li>
                <Link to="/queue" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Digital Queue & QR Pass
                </Link>
              </li>
              <li>
                <Link to="/ai-guide" className="text-slate-600 hover:text-slate-900 transition-colors">
                  AI Tourist Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="text-slate-900 text-xs font-semibold uppercase tracking-wider mb-3">
              System Highlights
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Digital FIFO Queue System</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>Live Crowd Density Modeling</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Max 4 Visitors Policy / Booking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>QR Gate Verification Pass</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TourFlow AI. Developed for College Software Engineering Capstone.</p>
          <div className="flex items-center gap-4">
            <span>Built with React, Vite & Tailwind CSS</span>
            <span>·</span>
            <span>Clean Modular Frontend</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
