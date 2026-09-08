import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import TouristLayout from './layouts/TouristLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import MyQueue from './pages/MyQueue';
import AIGuide from './pages/AIGuide';

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
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/queue" element={<MyQueue />} />
              <Route path="/ai-guide" element={<AIGuide />} />
              {/* Fallback to Landing */}
              <Route path="*" element={<Landing />} />
            </Routes>
          </TouristLayout>
        </QueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
