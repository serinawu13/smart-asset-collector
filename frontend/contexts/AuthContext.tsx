"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  notificationPrefs?: {
    inApp: boolean;
    email: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: { currency?: string; notificationPrefs?: { inApp: boolean; email: boolean } }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.signup({ name, email, password });
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      removeAuthToken();
      setUser(null);
    }
  };

  const updateSettings = async (settings: { currency?: string; notificationPrefs?: { inApp: boolean; email: boolean } }) => {
    try {
      const response = await api.updateSettings(settings);
      // Update user object with new settings
      if (user) {
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            ...(settings.currency && { currency: settings.currency }),
            ...(settings.notificationPrefs && { notificationPrefs: settings.notificationPrefs })
          };
        });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateSettings,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
