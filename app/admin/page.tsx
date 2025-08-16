"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ListFilter, 
  CheckSquare, 
  AlertTriangle,
  ArrowLeft,
  Building,
  Flag,
  Settings,
  UserCog,
  Shield,
  Megaphone,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  pendingApprovals: number;
  reportedListings: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingApprovals: 0,
    reportedListings: 0
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Protect admin route
    if (!isLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "error",
      });
      router.push('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin stats');
        }

        const data = await response.json();
    setStats({
          totalUsers: data.data.users.total || 0,
          totalListings: data.data.listings.total || 0,
          pendingApprovals: data.data.listings.pending || 0,
          reportedListings: data.data.listings.flagged || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast({
          title: "Error",
          description: "Failed to fetch admin statistics.",
          variant: "error",
        });
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isLoading, isAdmin, router, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!isAdmin) {
    return null; // Router will redirect
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: Building,
      color: 'text-green-600'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: CheckSquare,
      color: 'text-orange-600'
    },
    {
      title: 'Reported Listings',
      value: stats.reportedListings,
      icon: Flag,
      color: 'text-red-600'
    }
  ];

  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: UserCog,
      action: () => router.push('/admin/users')
    },
    {
      title: 'Listing Management',
      description: 'View, edit, and moderate all listings',
      icon: Building,
      action: () => router.push('/admin/listings')
    },
    {
      title: 'Pending Approvals',
      description: 'Review and moderate pending listings',
      icon: CheckSquare,
      action: () => router.push('/admin/listings?moderationStatus=pending')
    },
    {
      title: 'Reported Content',
      description: 'Handle reported listings and user complaints',
      icon: Flag,
      action: () => router.push('/admin/listings/reported')
    },
    {
      title: 'Promotions Review',
      description: 'Verify payments and activate ads',
      icon: Megaphone,
      action: () => router.push('/admin/promotions')
    },
    {
      title: 'Promotion Settings',
      description: 'Configure wallets, prices, and limits',
      icon: Wallet,
      action: () => router.push('/admin/settings/promotions')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
      <div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              <h1 className="text-2xl font-bold">Admin Control Panel</h1>
            </div>
          </div>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.firstName || user?.username || 'Admin'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {adminActions.map((action, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={action.action}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {action.title}
              </CardTitle>
              <action.icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add your activity feed items here */}
              <p className="text-sm text-gray-600">Loading recent activities...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingApprovals > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-600">
                    {stats.pendingApprovals} listings pending approval
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => router.push('/admin/listings/pending')}
                  >
                    Review
                  </Button>
                </div>
              )}
              {stats.reportedListings > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">
                    {stats.reportedListings} reported listings
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => router.push('/admin/listings/reported')}
                  >
                    Review
                  </Button>
                </div>
              )}
              {stats.pendingApprovals === 0 && stats.reportedListings === 0 && (
                <p className="text-sm text-gray-600">No pending tasks</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 