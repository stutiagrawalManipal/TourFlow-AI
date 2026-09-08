import React, { useState } from 'react';
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

export default function Landing() {
  // Live destination panel interactive toggle for demo purposes
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  const demoSites = [
    {
      name: 'Taj Mahal Central Dome',
      city: 'Agra, Uttar Pradesh',
      coordinates: '27.1751° N, 78.0421° E',
      crowdLevel: 'HIGH',
      crowdPercent: 88,
      estimatedWait: '35 min',
      activeQueue: 42,
      visitorCount: '4,890',
      queueCapacity: 80,
      sensorStatus: '14/16 Active Sensors',
      nextGateCall: 'Ticket #139 (2 mins)',
    },
    {
      name: 'Amer Fort Sun Gate',
      city: 'Jaipur, Rajasthan',
      coordinates: '26.9855° N, 75.8513° E',
      crowdLevel: 'MODERATE',
      crowdPercent: 58,
      estimatedWait: '18 min',
      activeQueue: 24,
      visitorCount: '2,650',
      queueCapacity: 75,
      sensorStatus: '12/12 Active Sensors',
      nextGateCall: 'Ticket #95 (4 mins)',
    }
  ];

  const currentDemo = demoSites[selectedDemoIndex];

  const features = [
    {
      title: 'Smart Queue Management',
      description: 'Digital FIFO (First-In, First-Out) queuing eliminates agonizing physical queues and lets tourists explore freely until their slot is called.',
      icon: Users,
      accent: 'cyan',
      tag: 'FIFO ENGINE'
    },
    {
      title: 'Real-Time Crowd Information',
      description: 'Understand current crowd density, peak visiting intervals, and live capacity percentages across heritage locations before you arrive.',
      icon: Activity,
      accent: 'amber',
      tag: 'SENSOR TELEMETRY'
    },
    {
      title: 'QR Queue Pass',
      description: 'Instant cryptographically formatted mobile pass with ticket number, passenger allocation, and barcode for smooth gate verification.',
      icon: QrCode,
      accent: 'emerald',
      tag: 'DIGITAL PASS'
    },
    {
      title: 'AI Tourist Guide',
      description: 'Intelligent contextual assistant grounded in architectural history, local legends, best photo angles, and queue navigation tips.',
      icon: Sparkles,
      accent: 'indigo',
      tag: 'AI COMPANION'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Discover',
      desc: 'Browse top cultural destinations & monuments.',
      icon: Compass
    },
    {
      step: '02',
      title: 'Check Crowd',
      desc: 'Review live capacity, peak hours & wait times.',
      icon: Activity
    },
    {
      step: '03',
      title: 'Join Queue',
      desc: 'Pick your group size (up to 4 visitors per booking).',
      icon: Users
    },
    {
      step: '04',
      title: 'Get QR Pass',
      desc: 'Receive your digital verification ticket & ETA.',
      icon: QrCode
    },
    {
      step: '05',
      title: 'Visit',
      desc: 'Arrive at your assigned gate and scan to enter.',
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
              <span>INTELLIGENT TOURIST COMMAND PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans leading-[1.1]">
              Smart Tourism. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">
                Less Waiting.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              TourFlow AI helps tourists discover, understand, and navigate busy destinations with intelligent digital FIFO queues and real-time crowd management. Skip uncertainty, preserve your time, and experience heritage at its finest.
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
                <p className="text-xl font-bold font-mono text-emerald-300">100%</p>
                <p className="text-[11px] text-slate-400">Digital QR Entry</p>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Live Destination Intelligence Visual Panel */}
          <div className="lg:col-span-6">
            <div className="relative bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
              {/* Radar and grid ambient lines */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setSelectedDemoIndex(selectedDemoIndex === 0 ? 1 : 0)}
                  className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-900/50 transition-colors"
                >
                  SWITCH MONUMENT ⇄
                </button>
              </div>

              {/* Panel Header */}
              <div className="flex items-start justify-between border-b border-slate-800/90 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                      LIVE DESTINATION INTELLIGENCE
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {currentDemo.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{currentDemo.city}</span>
                    <span className="font-mono text-slate-500">[{currentDemo.coordinates}]</span>
                  </p>
                </div>
              </div>

              {/* Real-Time Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Crowd Level</span>
                  <div className="mt-1">
                    <CrowdBadge level={currentDemo.crowdLevel} size="sm" />
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Est. Waiting</span>
                  <p className="text-base font-bold font-mono text-amber-300 mt-0.5">
                    {currentDemo.estimatedWait}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Active Queue</span>
                  <p className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                    #{currentDemo.activeQueue}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Today's Total</span>
                  <p className="text-base font-bold font-mono text-white mt-0.5">
                    {currentDemo.visitorCount}
                  </p>
                </div>
              </div>

              {/* Interactive Visual Queue Progress Simulation */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/90 mb-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Queue Capacity Saturation</span>
                  <span className="text-cyan-400 font-bold">{currentDemo.crowdPercent}% Capacity</span>
                </div>

                {/* Meter Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      currentDemo.crowdPercent > 75
                        ? 'bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                    style={{ width: `${currentDemo.crowdPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Capacity: {currentDemo.queueCapacity} slots/interval</span>
                  <span className="text-amber-300 font-semibold">{currentDemo.nextGateCall}</span>
                </div>
              </div>

              {/* Map Route / Spatial Node Graphic Mock */}
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gate Security Status: Online</span>
                </div>
                <div className="text-[11px] text-cyan-400">
                  Sensor Telemetry: {currentDemo.sensorStatus}
                </div>
              </div>

              {/* Action Button inside panel */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3">
                <Link
                  to="/destinations/taj-mahal"
                  className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono uppercase tracking-wider text-center font-bold transition-all"
                >
                  Inspect Full Telemetry & Join Queue →
                </Link>
              </div>
            </div>
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
            Intelligent Crowd & Queue Architecture
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engineered specifically to solve peak tourist bottlenecks at national heritage landmarks.
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
