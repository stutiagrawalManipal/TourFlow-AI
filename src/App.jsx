import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import TouristLayout from './layouts/TouristLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import MyQueue from './pages/MyQueue';
import AIGuide from './pages/AIGuide';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Account from './pages/Account';

/**
 * Helper to scroll page to top on route navigation
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueueProvider>
          <ScrollToTop />
          <TouristLayout>
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/ai-guide" element={<AIGuide />} />

              {/* Tourist pages (login required) */}
              <Route path="/dashboard" element={<ProtectedRoute role="tourist"><Dashboard /></ProtectedRoute>} />
              <Route path="/queue" element={<ProtectedRoute role="tourist"><MyQueue /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute role="tourist"><Account /></ProtectedRoute>} />

              {/* Admin portal */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

              {/* Fallback to Landing */}
              <Route path="*" element={<Landing />} />
            </Routes>
          </TouristLayout>
        </QueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
