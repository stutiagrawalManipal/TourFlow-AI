import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Only shows its page to a logged-in user with the right role.
 * (The backend checks the role again - this only controls what is shown.)
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="text-center text-xs font-mono text-slate-400 py-20">Checking your login...</p>;
  }

  if (!user) {
    const loginPage = role === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginPage} replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    // admins go to their dashboard; tourists are told the page is for staff only
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return (
      <div className="max-w-md mx-auto my-20 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-1">Administrators only</h2>
        <p className="text-xs text-rose-300">This page is only available to TourFlow staff accounts.</p>
      </div>
    );
  }

  return children;
}
