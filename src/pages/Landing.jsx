import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
  MapPin,
  Activity,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  QrCode,
  Layers
} from 'lucide-react';
import CrowdBadge from '../components/CrowdBadge';
import { fetchDestinations } from '../services/api';

export default function Landing() {
  // Hero panel shows the most popular destinations from the backend
  const [destinations, setDestinations] = useState([]);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  useEffect(() => {
    fetchDestinations()
      .then((data) => setDestinations([...data].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0)).slice(0, 10)))
      .catch(() => setDestinations([]));
  }, []);

  const currentDemo = destinations[selectedDemoIndex];

  const features = [
    {
      title: 'Smart Queue Management',
      description: 'Join a digital first-in, first-out queue instead of standing in a physical line. Up to 4 visitors per booking, positions assigned by the server.',
      icon: Users,
      accent: 'cyan',
      tag: 'FIFO QUEUE'
    },
    {
      title: 'Crowd Information',
      description: 'Estimated crowd level and waiting time from seasonal dataset information and the TourFlow queue. Clearly labelled as estimates - no live sensors.',
      icon: Activity,
      accent: 'amber',
      tag: 'ESTIMATES'
    },
    {
      title: 'QR Queue Pass',
      description: 'A QR queue pass with your booking ID and pass code. Staff look it up in the admin portal to check your group in and out.',
      icon: QrCode,
      accent: 'emerald',
      tag: 'DIGITAL PASS'
    },
    {
      title: 'AI Tourist Guide',
      description: 'Ask about attractions, seasons, itinerary, budget, safety, permits and food. Answers come only from the tourism dataset and work offline.',
      icon: Sparkles,
      accent: 'indigo',
      tag: 'DATASET GUIDE'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Discover',
      desc: 'Browse tourist destinations across India.',
      icon: Compass
    },
    {
      step: '02',
      title: 'Check Crowd',
      desc: 'See the estimated crowd level and waiting time.',
      icon: Activity
    },
    {
      step: '03',
      title: 'Join Queue',
      desc: 'Pick your group size (up to 4 per booking).',
      icon: Users
    },
    {
      step: '04',
      title: 'Get QR Pass',
      desc: 'Get your booking ID, position and QR pass.',
      icon: QrCode
    },
    {
      step: '05',
      title: 'Visit',
      desc: 'Show the pass; staff check you in and out.',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="py-8 sm:py-12 lg:py-16 space-y-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>TOURIST QUEUE & CROWD MANAGEMENT</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans leading-[1.1]">
              Smart Tourism. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">
                Less Waiting.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              TourFlow helps tourists explore destinations across India, check estimated crowd levels and waiting times, and join a fair digital FIFO queue with a QR pass instead of standing in a physical line.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-950/50 hover:scale-[1.02]"
              >
                <span>Explore Destinations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </Link>
            </div>

            {/* Micro proof points */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-left">
              <div>
                <p className="text-xl font-bold font-mono text-cyan-300">FIFO</p>
                <p className="text-[11px] text-slate-400">Strict Fairness</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-amber-300">Max 4</p>
                <p className="text-[11px] text-slate-400">Visitors / Ticket</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-emerald-300">QR</p>
                <p className="text-[11px] text-slate-400">Queue Pass</p>
              </div>
            </div>
          </div>

          {/* Right Column: destination snapshot from the backend */}
          <div className="lg:col-span-6">
            {!currentDemo ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center text-xs font-mono text-slate-400">
                Start the backend to see destination data here.
              </div>
            ) : (
            <div className="relative bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setSelectedDemoIndex((selectedDemoIndex + 1) % destinations.length)}
                  className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-900/50 transition-colors"
                >
                  NEXT PLACE ⇄
                </button>
              </div>

              {/* Panel Header */}
              <div className="flex items-start justify-between border-b border-slate-800/90 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                      POPULAR DESTINATION
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 pr-24">
                    {currentDemo.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{currentDemo.location}</span>
                  </p>
                </div>
              </div>

              {/* Queue numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Crowd Level</span>
                  <div className="mt-1">
                    <CrowdBadge level={currentDemo.crowd.crowdLevel} size="sm" />
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Est. Wait</span>
                  <p className="text-base font-bold font-mono text-amber-300 mt-0.5">
                    ~{currentDemo.crowd.estimatedWaitMinutes} min
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">In Queue</span>
                  <p className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                    {currentDemo.crowd.peopleWaiting}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Checked In</span>
                  <p className="text-base font-bold font-mono text-white mt-0.5">
                    {currentDemo.crowd.peopleInside}
                  </p>
                </div>
              </div>

              {/* Current slot occupancy */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/90 mb-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Queue vs 1-hour entry capacity</span>
                  <span className="text-cyan-400 font-bold">{currentDemo.crowd.queueLoadPercent}%</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      currentDemo.crowd.queueLoadPercent > 75
                        ? 'bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                    style={{ width: `${currentDemo.crowd.queueLoadPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Season now: {currentDemo.crowd.season}</span>
                  <span className="text-amber-300 font-semibold">Popularity {currentDemo.popularityScore}/10</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400">
                Estimate from the dataset season + TourFlow queue via the backend API. No live sensors.
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3">
                <Link
                  to={`/destinations/${currentDemo.id}`}
                  className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono uppercase tracking-wider text-center font-bold transition-all"
                >
                  View Details & Join Queue →
                </Link>
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Four Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-wider mb-3">
            <span>CORE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
            Crowd & Queue Features
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Built for peak-hour bottlenecks at busy temples, ghats and monuments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] font-mono text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore module</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How TourFlow Works - Horizontal Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle background grid */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-10 pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block mb-2">
              SEAMLESS VISITATION PIPELINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
              How TourFlow Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              From discovering iconic sites to entering without physical line delays in 5 simple steps.
            </p>
          </div>

          {/* 5-Step Horizontal Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        STEP {step.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1.5 font-sans group-hover:text-cyan-300 transition-colors">
                      {step.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block pt-3 text-right text-slate-600 font-mono text-sm">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA within flow */}
          <div className="text-center mt-10 pt-8 border-t border-slate-800/80 relative z-10">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shadow-lg shadow-cyan-950"
            >
              <span>Begin With Step 01: Browse Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
