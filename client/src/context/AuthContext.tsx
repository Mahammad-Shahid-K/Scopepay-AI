import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (name: string, businessName: string, email: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial profile from backend or local storage
    const fetchProfile = async () => {
      try {
        const stored = localStorage.getItem('scopepay_auth_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          const profile = await api.getSettings();
          setUser(profile);
          localStorage.setItem('scopepay_auth_user', JSON.stringify(profile));
        }
      } catch (err) {
        // Fallback default demo user
        const demoUser: Profile = {
          id: 'user-scopepay-demo-1',
          full_name: 'Alex Rivera',
          business_name: 'Rivera Creative Tech & Design',
          email: 'alex@riveracreative.io',
          default_currency: 'USD'
        };
        setUser(demoUser);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const login = async (email: string) => {
    try {
      const profile = await api.getSettings();
      const updated = { ...profile, email: email || profile.email };
      setUser(updated);
      localStorage.setItem('scopepay_auth_user', JSON.stringify(updated));
    } catch {
      const updated: Profile = {
        id: 'user-scopepay-demo-1',
        full_name: 'Alex Rivera',
        business_name: 'Rivera Creative Tech & Design',
        email: email || 'alex@riveracreative.io',
        default_currency: 'USD'
      };
      setUser(updated);
      localStorage.setItem('scopepay_auth_user', JSON.stringify(updated));
    }
  };

  const register = async (name: string, businessName: string, email: string) => {
    try {
      const updated = await api.updateSettings({
        full_name: name,
        business_name: businessName,
        email
      });
      setUser(updated);
      localStorage.setItem('scopepay_auth_user', JSON.stringify(updated));
    } catch {
      const localUser: Profile = {
        id: `user-${Date.now()}`,
        full_name: name,
        business_name: businessName,
        email,
        default_currency: 'USD'
      };
      setUser(localUser);
      localStorage.setItem('scopepay_auth_user', JSON.stringify(localUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scopepay_auth_user');
  };

  const updateUser = async (data: Partial<Profile>) => {
    try {
      const updated = await api.updateSettings(data);
      setUser(updated);
      localStorage.setItem('scopepay_auth_user', JSON.stringify(updated));
    } catch {
      if (user) {
        const next = { ...user, ...data };
        setUser(next);
        localStorage.setItem('scopepay_auth_user', JSON.stringify(next));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
