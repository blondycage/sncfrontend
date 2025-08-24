"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Building,
  Flag,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Activity,
  Calendar,
  Eye,
  MessageSquare,
  Briefcase,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';


interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  pendingApprovals: number;
  reportedListings: number;
  totalJobs: number;
  totalEducation: number;
  activePromotions: number;
  totalViews: number;
  recentActivity: {
    newUsers: number;
    newListings: number;
    newReports: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingApprovals: 0,
    reportedListings: 0,
    totalJobs: 0,
    totalEducation: 0,
    activePromotions: 0,
    totalViews: 0,
    recentActivity: {
      newUsers: 0,
      newListings: 0,
      newReports: 0
    }
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
          totalUsers: data.data?.users?.total || 0,
          totalListings: data.data?.listings?.total || 0,
          pendingApprovals: data.data?.listings?.pending || 0,
          reportedListings: data.data?.listings?.reported || data.data?.listings?.flagged || 0,
          totalJobs: data.data?.jobs?.total || 0,
          totalEducation: data.data?.education?.total || 0,
          activePromotions: data.data?.promotions?.active || 0,
          totalViews: data.data?.analytics?.totalViews || 0,
          recentActivity: {
            newUsers: data.data?.recent?.newUsers || 5, // Default some demo values
            newListings: data.data?.recent?.newListings || 12,
            newReports: data.data?.recent?.newReports || 0
          }
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

  // Calculate some derived metrics
  const totalContent = stats.totalListings + stats.totalJobs + stats.totalEducation;
  const tasksProgress = stats.pendingApprovals + stats.reportedListings;

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
          Welcome back, {user?.firstName || user?.username || 'Admin'}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <p className="text-xs sm:text-sm text-green-600 mt-1">
              +{stats.recentActivity.newUsers} this week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Content</CardTitle>
            <Building className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalContent}</div>
            <p className="text-xs sm:text-sm text-green-600 mt-1">
              +{stats.recentActivity.newListings} new items
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Pending Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{tasksProgress}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Approvals: {stats.pendingApprovals}</span>
                <span>Reports: {stats.reportedListings}</span>
              </div>
              <Progress value={(tasksProgress / Math.max(totalContent, 1)) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Views</CardTitle>
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Platform engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 sm:mb-8">
        <Card className="text-center">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs sm:text-sm text-gray-600">Listings</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs sm:text-sm text-gray-600">Jobs</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalEducation}</div>
            <p className="text-xs sm:text-sm text-gray-600">Education</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.activePromotions}</div>
            <p className="text-xs sm:text-sm text-gray-600">Active Promos</p>
          </CardContent>
        </Card>

        <Card className="text-center col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mx-auto mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.reportedListings}</div>
            <p className="text-xs sm:text-sm text-gray-600">Reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards and Activity */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Priority Actions */}
        <div className="lg:col-span-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Priority Actions</h3>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {stats.pendingApprovals > 0 && (
              <Card 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-orange-500"
                onClick={() => router.push('/admin/listings/pending')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold truncate">Pending Approvals</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{stats.pendingApprovals} items waiting</p>
                      </div>
                    </div>
                    <Button size="sm" className="self-start sm:self-center">Review</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.reportedListings > 0 && (
              <Card 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-red-500"
                onClick={() => router.push('/admin/listings/reported')}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold truncate">Reported Content</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{stats.reportedListings} reports pending</p>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" className="self-start sm:self-center">Handle</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => router.push('/admin/users')}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold truncate">User Management</h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Manage user accounts</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="self-start sm:self-center">Manage</Button>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => router.push('/admin/analytics')}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold truncate">Analytics</h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">View detailed reports</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="self-start sm:self-center">View</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{stats.recentActivity.newUsers} new users this week</p>
                    <p className="text-xs text-gray-500">User registrations</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{stats.recentActivity.newListings} new listings</p>
                    <p className="text-xs text-gray-500">Content submissions</p>
                  </div>
                </div>
                
                {stats.recentActivity.newReports > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{stats.recentActivity.newReports} new reports</p>
                      <p className="text-xs text-gray-500">Requires attention</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 sm:pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs sm:text-sm"
                    onClick={() => router.push('/admin/activity')}
                  >
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    View All Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
