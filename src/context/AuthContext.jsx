import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Check localStorage for persisted mock session or default to a logged-in explorer
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tourflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default mock user for smooth testing
    return {
      name: 'Aditya Sharma',
      email: 'aditya.explorer@tourflow.ai',
      initials: 'AS',
      role: 'Verified Tourist',
      id: 'EXP-4921'
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('tourflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tourflow_user');
    }
  }, [user]);

  const login = (email, password) => {
    // Mock login authentication
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const mockUser = {
      name: formattedName || 'Explorer',
      email: email,
      initials: (formattedName.slice(0, 2) || 'EX').toUpperCase(),
      role: 'Verified Tourist',
      id: 'EXP-' + Math.floor(1000 + Math.random() * 9000)
    };
    setUser(mockUser);
    return { success: true, user: mockUser };
  };

  const register = (name, email, password) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EX';
    const newUser = {
      name,
      email,
      initials,
      role: 'Verified Tourist',
      id: 'EXP-' + Math.floor(1000 + Math.random() * 9000)
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
