"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/admin/Sidebar';
import { AdminHeader } from '@/admin/AdminHeader';

interface UserData {
  id: string;
  telegramId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  photoUrl?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
        
      console.log('🔍 Admin Layout: Checking auth...', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        apiUrl: process.env.NEXT_PUBLIC_API_URL 
      });
      
      if (!token || !userData) {
        console.log('❌ Admin Layout: No auth data, redirecting to login');
        router.push('/auth/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Admin Layout: User data parsed:', { 
          id: parsedUser.id, 
          role: parsedUser.role, 
          email: parsedUser.email 
        });
        
        // Check if user is admin
        if (parsedUser.role !== 'admin') {
          console.log('❌ Admin Layout: User is not admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        setUser(parsedUser);
      } catch (parseError) {
        console.error('❌ Admin Layout: Error parsing user data:', parseError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('❌ Admin Layout: Auth check error:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 lg:pl-72">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 