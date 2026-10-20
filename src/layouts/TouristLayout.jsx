import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TouristLayout({ children }) {
  return (
    <div className="min-h-screen bg-command-darkest text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      {/* Background subtle telemetry grid and radar accent */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid-md opacity-20 pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content Body */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
