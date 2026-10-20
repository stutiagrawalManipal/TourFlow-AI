import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe, loginTourist, loginAdmin, registerUser, logoutUser, getToken, setToken } from '../services/api';

const AuthContext = createContext();

/**
 * Real authentication against the backend.
 * - The token is saved in localStorage so the login survives a page refresh.
 * - On start-up the token is checked with GET /api/auth/me.
 * - The user's role comes from the server; the backend checks it again on
 *   every protected request, so changing it in the browser does nothing.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    fetchMe()
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err.status === 401) setToken(null); // expired or invalid
      })
      .finally(() => setLoading(false));
  }, []);

  const startSession = ({ token, user: loggedInUser }) => {
    setToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const login = async (email, password) => startSession(await loginTourist({ email, password }));
  const adminLogin = async (email, password) => startSession(await loginAdmin({ email, password }));
  const register = async (name, email, password) => startSession(await registerUser({ name, email, password }));

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // token already invalid - still log out locally
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
