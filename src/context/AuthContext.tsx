import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';

type AuthUser = { id: string; email: string; name: string } | null;

type AuthContextValue = {
  user: AuthUser;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const persist = (tok: string, usr: NonNullable<AuthUser>) => {
    setToken(tok);
    setUser(usr);
    localStorage.setItem('auth_token', tok);
    localStorage.setItem('auth_user', JSON.stringify(usr));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true); setError(null);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      persist(data.token, data.user);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed');
      throw e;
    } finally { setIsLoading(false); }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true); setError(null);
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      persist(data.token, data.user);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Registration failed');
      throw e;
    } finally { setIsLoading(false); }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const value = useMemo(() => ({ user, token, login, register, logout, isLoading, error }), [user, token, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};



