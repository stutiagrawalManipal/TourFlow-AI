import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Users,
  Sparkles,
  MapPin,
  QrCode,
  Activity,
  CheckCircle2
} from 'lucide-react';
import CrowdBadge from '../components/CrowdBadge';

export default function Landing() {
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  const demoSites = [
    {
      name: 'Taj Mahal',
      location: 'Agra, Uttar Pradesh',
      crowdLevel: 'HIGH',
      crowdPercent: 84,
      estimatedWait: '35 mins',
      activeQueue: 42,
      todayTotal: '4,890',
      gate: 'East Gate Turnstile',
      photo: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      id: 'taj-mahal'
    },
    {
      name: 'Amer Fort',
      location: 'Jaipur, Rajasthan',
      crowdLevel: 'MODERATE',
      crowdPercent: 58,
      estimatedWait: '18 mins',
      activeQueue: 24,
      todayTotal: '2,650',
      gate: 'Suraj Pol Entrance',
      photo: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      id: 'amer-fort'
    }
  ];

  const currentDemo = demoSites[selectedDemoIndex];

  const features = [
    {
      title: 'Digital Queue Management',
      description: 'Join virtual queues in advance. Spend your time exploring surrounding bazaars and cafes instead of standing in physical ticket queues.',
      icon: Users,
    },
    {
      title: 'Real-Time Crowd Insights',
      description: 'Check current visitor congestion, wait time estimates, and peak visiting hours across major landmarks before you step out.',
      icon: Activity,
    },
    {
      title: 'Verified QR Pass',
      description: 'Receive an instant digital mobile pass with queue allocation and entry time window for swift verification at entrance turnstiles.',
      icon: QrCode,
    },
    {
      title: 'AI Cultural Guide',
      description: 'Discover architectural secrets, historical timelines, and curated recommendations tailored to the monument you are visiting.',
      icon: Sparkles,
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Discover',
      desc: 'Browse prominent monuments and heritage locations across India.'
    },
    {
      num: '02',
      title: 'Check crowd',
      desc: 'Review live visitor density and estimated waiting times.'
    },
    {
      num: '03',
      title: 'Join queue',
      desc: 'Reserve consecutive spots for your party (up to 4 visitors).'
    },
    {
      num: '04',
      title: 'Get pass',
      desc: 'Receive your mobile QR ticket with entry call window.'
    },
    {
      num: '05',
      title: 'Seamless entry',
      desc: 'Scan your mobile pass at turnstiles when your number is called.'
    }
  ];

  return (
    <div className="py-12 sm:py-16 space-y-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              <span>Intelligent Tourist Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Smart Tourism. <br />
              <span className="text-slate-600">Less Waiting.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              TourFlow AI helps tourists discover heritage destinations, understand current crowd levels, and join digital queues to skip hours of waiting in line at India's most iconic sites.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                <span>Explore destinations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                <span>Open dashboard</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div>
                <p className="text-2xl font-black text-slate-900">8+</p>
                <p className="text-xs text-slate-500 mt-0.5">Monitored sites</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">4 max</p>
                <p className="text-xs text-slate-500 mt-0.5">Visitors per pass</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs text-slate-500 mt-0.5">Digital QR entry</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Destination Intelligence Panel */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-card-hover">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Live Crowd Intelligence
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {currentDemo.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentDemo.location}</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDemoIndex(selectedDemoIndex === 0 ? 1 : 0)}
                  className="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Switch site ⇄
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Condition</span>
                  <div className="mt-1.5">
                    <CrowdBadge level={currentDemo.crowdLevel} size="sm" />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Estimated wait</span>
                  <p className="text-base font-bold text-amber-700 mt-1">
                    {currentDemo.estimatedWait}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Active queue</span>
                  <p className="text-base font-bold text-sky-700 mt-1">
                    #{currentDemo.activeQueue}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Visits today</span>
                  <p className="text-base font-bold text-slate-900 mt-1">
                    {currentDemo.todayTotal}
                  </p>
                </div>
              </div>

              {/* Saturation Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 mb-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <span>Current Queue Saturation</span>
                  <span className="font-bold text-slate-900">{currentDemo.crowdPercent}% full</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentDemo.crowdPercent > 70 ? 'bg-amber-500' : 'bg-sky-600'
                    }`}
                    style={{ width: `${currentDemo.crowdPercent}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 pt-0.5">
                  Turnstiles active at {currentDemo.gate} · Next slot ready in ~3 mins
                </p>
              </div>

              {/* Action Button */}
              <Link
                to={`/destinations/${currentDemo.id}`}
                className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold rounded-xl text-xs text-center block transition-colors shadow-sm"
              >
                View details & join queue →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900">
            Intelligent Crowd Management
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Practical digital tools built specifically to solve visitor bottlenecks at Indian heritage destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-6 transition-all flex flex-col justify-between shadow-card hover:shadow-card-hover"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How TourFlow Works - 5-Step Clean Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-card">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How TourFlow Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              From discovering top monuments to walking through turnstiles without physical line delays.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-sky-600 block mb-3">
                    Step {step.num}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              <span>Explore destinations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
