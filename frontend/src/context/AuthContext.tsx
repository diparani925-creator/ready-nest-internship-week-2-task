'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api, UserData } from '../lib/api';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string, role?: 'student' | 'admin', avatar?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify with server in background to ensure token is still valid
          try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } catch (err) {
            console.error('Session validation failed, logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Error loading auth state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      
      router.push('/dashboard');
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'admin' = 'student',
    avatar: string = 'avatar1'
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role, avatar });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      router.push('/dashboard');
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: UserData) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        registerUser,
        logout,
        updateUser,
      }}
    >
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
