import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Ticket, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { activeQueue } = useQueue();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Destinations', path: '/destinations' },
    {
      name: 'My Queue',
      path: '/queue',
      badge: activeQueue ? activeQueue.queueNumber : null
    },
    { name: 'AI Guide', path: '/ai-guide' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Compass className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">
                TourFlow
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-sky-700 bg-sky-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="ml-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-xs text-slate-700">
                    {user.initials || 'EX'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-medium text-slate-900 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {user.role || 'Tourist'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {activeQueue && (
              <Link
                to="/queue"
                className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium flex items-center gap-1"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{activeQueue.queueNumber}</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-md">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-medium text-xs text-slate-700">
                    {user.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 hover:underline px-2 py-1 font-medium"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm text-white bg-sky-600 font-medium rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
