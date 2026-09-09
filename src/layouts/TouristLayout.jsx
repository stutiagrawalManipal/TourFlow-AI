import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TouristLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Subtle top light gradient for natural depth */}
      <div className="fixed top-0 inset-x-0 h-72 bg-gradient-to-b from-slate-100/60 to-transparent pointer-events-none z-0" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
