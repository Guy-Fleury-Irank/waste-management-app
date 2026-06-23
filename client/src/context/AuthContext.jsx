import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load — validate with server before trusting
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          // Validate token with server by calling protected endpoint
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (err) {
          // Token invalid or expired, clear storage
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // Listen for logout events from API interceptor (token expired)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('user');
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    // Clear any existing session first
    localStorage.removeItem('user');
    
    const { data } = await api.post('/auth/login', { email, password });
    // Token is now in HTTP-only cookie — only store user object
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (userData) => {
    // Clear any existing session first
    localStorage.removeItem('user');
    
    const { data } = await api.post('/auth/register', userData);
    // Token is now in HTTP-only cookie — only store user object
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('user');
    
    // Call server to clear cookie, then clear local state
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore errors — cookie may already be gone
    }
    
    return new Promise((resolve) => {
      setUser(null);
      setTimeout(resolve, 0);
    });
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}