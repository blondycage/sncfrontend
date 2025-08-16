"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast'

interface User {
  id: string;
  username?: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  // Register via email/password
  const register = async (payload: { username: string; email: string; password: string; firstName?: string; lastName?: string; role?: string; }): Promise<void> => {
    try {
      toast({ title: 'Creating your account...', description: 'Please wait', variant: 'info', duration: 1500 })
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: 'Registration failed', description: data.message || data.error || 'Please try again', variant: 'error' })
        throw new Error(data.message || data.error || 'Registration failed')
      }
      // Store token if returned and set user
      if (data.token) localStorage.setItem('authToken', data.token)
      if (data.user) {
        setUser(data.user)
      }
      toast({ title: 'Welcome!', description: data.message || 'Account created successfully', variant: 'success', duration: 3000 })
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
      throw new Error('Registration failed')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      toast({ title: 'Signing in...', description: 'Please wait while we authenticate you', variant: 'info', duration: 1500 })
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({ title: 'Login failed', description: error.message || 'Invalid credentials', variant: 'error' })
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Set user data
      setUser(data.user);

      // Redirect based on role
      if (data.user.role === 'admin') {
        toast({ title: 'Welcome back', description: data.message || 'Logged in as admin', variant: 'success', duration: 3000 });
        router.push('/admin');
      } else {
        toast({ title: 'Welcome back', description: data.message || 'Login successful', variant: 'success', duration: 3000 });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast({ title: 'Login failed', description: error.message, variant: 'error', duration: 4000 });
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    toast({ ...toast.info('Logged out'), duration: 2500 });
    router.push('/auth/login');
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    // @ts-ignore - extend context for register consumption
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 