"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast'
import { authApi } from '@/lib/api'

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
  isAuthenticating: boolean;
  isRegistering: boolean;
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Helper: set/delete auth cookies used by middleware
  const setCookie = (name: string, value: string, maxAgeDays = 7) => {
    try {
      const maxAge = maxAgeDays * 24 * 60 * 60; // seconds
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
    } catch {}
  };

  const deleteCookie = (name: string) => {
    try {
      document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
    } catch {}
  };
  
  // Register via email/password with toasts and redirect
  const register = async (payload: { username: string; email: string; password: string; firstName?: string; lastName?: string; role?: string; }): Promise<void> => {
    if (isRegistering) return;
    
    try {
      setIsRegistering(true);
      toast({ title: 'Creating your account...', description: 'Please wait', variant: 'info', duration: 3000 })
      const res = await authApi.register(payload as any)
      if (!res.success || !res.token || !res.user) {
        throw new Error(res.message || 'Registration failed')
      }
      localStorage.setItem('authToken', res.token)
      setCookie('token', res.token)
      setUser(res.user as any)
      setCookie('user', JSON.stringify({ id: (res.user as any).id, role: (res.user as any).role, email: (res.user as any).email || '' }))
      toast({ title: 'Welcome!', description: res.message || 'Account created successfully', variant: 'success', duration: 3000 })
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please try again.'
      toast({ title: 'Registration failed', description: msg, variant: 'error', duration: 3000 })
      throw err
    } finally {
      setIsRegistering(false);
    }
  }

  const login = async (email: string, password: string) => {
    if (isAuthenticating) return;
    
    try {
      setIsAuthenticating(true);
      toast({ title: 'Signing in...', description: 'Please wait while we authenticate you', variant: 'info', duration: 3000 })
      const res = await authApi.login({ email, password })
      if (!res.success || !res.token || !res.user) {
        throw new Error(res.message || 'Login failed')
      }
      localStorage.setItem('authToken', res.token)
      setCookie('token', res.token)
      setUser(res.user as any)
      setCookie('user', JSON.stringify({ id: (res.user as any).id, role: (res.user as any).role, email: (res.user as any).email || '' }))
      const role = (res.user as any).role
      toast({ title: 'Welcome back', description: res.message || (role === 'admin' ? 'Logged in as admin' : 'Login successful'), variant: 'success', duration: 3000 })
      router.push(role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please try again.'
      toast({ title: 'Login failed', description: msg, variant: 'error', duration: 3000 })
      throw err
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    deleteCookie('token');
    deleteCookie('user');
    toast({ title: 'Logged out', description: 'You have been logged out successfully', variant: 'success', duration: 3000 });
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
    isAuthenticating,
    isRegistering,
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
