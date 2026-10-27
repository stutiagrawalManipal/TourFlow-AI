import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe, loginTourist, loginAdmin, registerUser, logoutUser } from '../services/api';

const AuthContext = createContext();

/**
 * Real authentication against the backend.
 * - The server keeps the session in an HttpOnly cookie (JavaScript cannot read it).
 * - On start-up GET /api/auth/me tells us who is logged in (survives page refresh).
 * - The user's role comes from the server and is checked again on every
 *   protected request, so changing anything in the browser does nothing.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null)) // 401 = not logged in
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user: loggedIn } = await loginTourist({ email, password });
    setUser(loggedIn);
    return loggedIn;
  };
  const adminLogin = async (email, password) => {
    const { user: loggedIn } = await loginAdmin({ email, password });
    setUser(loggedIn);
    return loggedIn;
  };
  const register = async (name, email, password) => {
    const { user: created } = await registerUser({ name, email, password });
    setUser(created);
    return created;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // session already gone - still log out locally
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, adminLogin, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
