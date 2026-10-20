import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-command-darkest border-t border-slate-800 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Compass className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-base font-bold text-white font-sans tracking-tight">
                TourFlow AI
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                v1.0.4
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              "Smart Tourism. Less Waiting." Intelligent tourist management platform engineered to eliminate physical queues, model crowd dynamics, and deliver QR verification with contextual AI assistance.
            </p>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>FIFO ENGINE: OPERATIONAL</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>QR VERIFICATION: READY</span>
              </span>
            </div>
          </div>

          {/* Platform Nav */}
          <div>
            <h4 className="text-white font-mono text-xs uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Tourist Dashboard
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-cyan-400 transition-colors">
                  Heritage Destinations
                </Link>
              </li>
              <li>
                <Link to="/queue" className="hover:text-cyan-400 transition-colors">
                  Live Queue & QR Pass
                </Link>
              </li>
              <li>
                <Link to="/ai-guide" className="hover:text-cyan-400 transition-colors">
                  AI Tourist Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & Tech Spec */}
          <div>
            <h4 className="text-white font-mono text-xs uppercase tracking-wider mb-3">
              Project Specification
            </h4>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg font-mono text-[10px] text-slate-400 space-y-1">
              <p className="text-cyan-400 font-bold">SOFTWARE ENGINEERING CAPSTONE</p>
              <p>Frontend: React + Vite + Tailwind</p>
              <p>State: Context FIFO Queue Manager</p>
              <p>Simulation: Live Crowd Telemetry</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
          <p>© {new Date().getFullYear()} TourFlow AI. College Software Engineering Project.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Coordinates: 20.5937° N, 78.9629° E</span>
            <span>•</span>
            <span className="hover:text-slate-400">Strict Max 4 Visitors / Pass</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
