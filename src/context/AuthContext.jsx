import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('te_token'));
  const [checking, setChecking] = useState(true); // verifying token on mount

  // On mount: verify stored token
  useEffect(() => {
    if (!token) { setChecking(false); return; }
    authApi.me(token)
      .then((res) => setAdmin(res.data.admin))
      .catch(() => { localStorage.removeItem('te_token'); setToken(null); })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    const { token: t, admin: a } = res.data;
    localStorage.setItem('te_token', t);
    setToken(t);
    setAdmin(a);
    return a;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('te_token');
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, checking, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
