"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building,
  User, 
  Settings, 
  Bell,
  LogOut, 
  PlusCircle, 
  Search,
  MessageSquare,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Activity,
  Calendar,
  DollarSign,
  Shield,
  Users as UsersIcon,
  CheckCircle,
  Lock,
  Unlock,
  Mail,
  RefreshCw,
  AlertCircle,
  Home,
  ShoppingCart,
  Briefcase
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { FavoriteButton } from "@/components/ui/favorite-button";

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

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: 'rental' | 'sale' | 'service';
  price: number;
  pricing_frequency: string;
  image_urls: string[];
  views: number;
  createdAt: string;
  status: string;
  moderationStatus: string;
  expiresAt: string;
}

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  expiringSoon: number;
}

interface AdminStats extends DashboardStats {
  totalUsers: number;
  pendingListings: number;
  reportedListings: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    expiringSoon: 0,
    totalUsers: 0,
    pendingListings: 0,
    reportedListings: 0
  });
  const [loadingListings, setLoadingListings] = useState(false);
  const [error, setError] = useState('');
  
  // Add new state for user management
  const [users, setUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFilters, setUserFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  
  // Add new state for favorites
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritesPagination, setFavoritesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
      
      console.log('🔍 Dashboard: Checking auth...', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        apiUrl: process.env.NEXT_PUBLIC_API_URL 
      });
    
    if (!token || !userData) {
        console.log('❌ Dashboard: No auth data, redirecting to login');
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
        console.log('✅ Dashboard: User data parsed:', { 
          id: parsedUser.id, 
          role: parsedUser.role, 
          email: parsedUser.email 
        });
        
      setUser(parsedUser);
      
      // Redirect admins to admin dashboard
      if (parsedUser?.role === 'admin') {
        console.log('🔄 Dashboard: Admin detected, redirecting to admin panel');
        router.push('/admin');
        return;
      }
        
        // Fetch user's listings
        await fetchUserListings(parsedUser, token);
      } catch (parseError) {
        console.error('❌ Dashboard: Error parsing user data:', parseError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('❌ Dashboard: Auth check error:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserListings = async (currentUser?: any, token?: string) => {
    setLoadingListings(true);
    setError('');
    
    try {
      const authToken = token || localStorage.getItem('authToken');
      const userToUse = currentUser || user;
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Choose the correct endpoint based on user role
      let endpoint = '';
      if (userToUse?.role === 'admin') {
        // For admin users, fetch all listings using the admin endpoint
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/listings`;
      } else {
        // For regular users, fetch their own listings
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/listings/user/me`;
      }

      console.log('📡 Dashboard: Fetching listings from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Dashboard: Listings response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dashboard: Listings fetch error:', errorText);
        throw new Error(`Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard: Listings data received:', { 
        success: data.success, 
        listingsCount: data.data?.length || data.listings?.length || 0 
      });

      // Handle different response structures for admin vs user endpoints
      let listingsArray = [];
      if (userToUse?.role === 'admin') {
        // Admin endpoint returns data.listings or data.data
        listingsArray = data.data?.listings || data.data || data.listings || [];
      } else {
        // User endpoint returns data directly
        listingsArray = data.data || data.listings || [];
      }
      
      setListings(listingsArray);
      
      // Calculate stats
      const totalListings = listingsArray.length || 0;
      const activeListings = listingsArray.filter((l: Listing) => l.status === 'active').length || 0;
      const totalViews = listingsArray.reduce((sum: number, l: Listing) => sum + (l.views || 0), 0) || 0;
      const expiringSoon = listingsArray.filter((l: Listing) => {
        if (!l.expiresAt) return false;
        const expiresAt = new Date(l.expiresAt);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      }).length || 0;

      // Admin-specific stats
      if (userToUse?.role === 'admin') {
        const pendingListings = listingsArray.filter((l: Listing) => l.moderationStatus === 'pending').length || 0;
        const reportedListings = listingsArray.filter((l: Listing) => l.isReported).length || 0;

      setStats({
        totalListings,
        activeListings,
        totalViews,
          expiringSoon,
          totalUsers: 0, // Will be updated by fetchUserStats
          pendingListings,
          reportedListings
        });
      } else {
        setStats({
          totalListings,
          activeListings,
          totalViews,
          expiringSoon,
          totalUsers: 0,
          pendingListings: 0,
          reportedListings: 0
        });
      }

    } catch (error) {
      console.error('❌ Dashboard: Error fetching listings:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch listings');
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async (token?: string) => {
    try {
      const authToken = token || localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      console.log('📡 Dashboard: Fetching user stats...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dashboard: User stats fetch error:', errorText);
        throw new Error('Failed to fetch user statistics');
      }

      const data = await response.json();
      console.log('✅ Dashboard: User stats received:', data);
      
      setUserStats(data.data || data.stats || {});
      
      // Update stats with user count
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: data.data?.totalUsers || data.stats?.totalUsers || 0
      }));
      
    } catch (error) {
      console.error('❌ Dashboard: Error fetching user stats:', error);
    }
  };

  // Fetch users with filters
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      
      Object.entries(userFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('📡 Dashboard: Fetching users from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Dashboard: Users response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dashboard: Users fetch error:', errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard: Users data received:', { 
        success: data.success, 
        usersCount: data.data?.length || data.users?.length || 0 
      });

      setUsers(data.data || data.users || []);
      setUserPagination(data.pagination || {
        page: 1,
        pages: 1,
        total: 0,
        limit: 10,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error('❌ Dashboard: Error fetching users:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch users",
        variant: "destructive"
      });
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setUserFilters({ ...userFilters, page: newPage });
    setTimeout(() => fetchUsers(), 100);
  };

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setUserFilters({ ...userFilters, search: value, page: 1 });
  };

  // Auto-fetch users when filters change (with debounce for search)
  useEffect(() => {
    if (showUserManagement && user?.role === 'admin') {
      const timeoutId = setTimeout(() => {
        fetchUsers().catch(error => {
          console.error('❌ Dashboard: Auto-fetch users error:', error);
        });
      }, userFilters.search ? 500 : 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [userFilters, showUserManagement, user?.role]);

  // Handle user actions
  const handleUserAction = async (userId: string, action: string, payload?: any) => {
    setActionLoading(`${action}-${userId}`);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      let endpoint = '';
      let method = 'POST';
      let body = {};

      switch (action) {
        case 'lock':
          endpoint = `/admin/users/${userId}/lock`;
          method = 'PATCH';
          body = { action: 'lock', duration: payload?.duration || 24 };
          break;
        case 'unlock':
          endpoint = `/admin/users/${userId}/lock`;
          method = 'PATCH';
          body = { action: 'unlock' };
          break;
        case 'send-verification':
          endpoint = `/admin/users/${userId}/send-verification`;
          break;
        case 'send-password-reset':
          endpoint = `/admin/users/${userId}/send-password-reset`;
          break;
        case 'reset-quota':
          endpoint = `/admin/users/${userId}/reset-quota`;
          body = payload || {};
          break;
        case 'delete':
          endpoint = `/admin/users/${userId}`;
          method = 'DELETE';
          break;
        default:
          throw new Error('Invalid action');
      }

      const fullEndpoint = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      console.log(`📡 Dashboard: ${action} user ${userId} at:`, fullEndpoint);

      const response = await fetch(fullEndpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' && method !== 'GET' ? JSON.stringify(body) : undefined
      });

      console.log(`📥 Dashboard: ${action} response status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Dashboard: ${action} error:`, errorData);
        throw new Error(errorData.message || `Failed to ${action} user`);
      }

      const data = await response.json();
      console.log(`✅ Dashboard: ${action} success:`, data);
      
      toast({
        title: "Success",
        description: data.message || `User ${action} completed successfully`,
      });

      // Refresh users list and stats
      if (showUserManagement) {
        await fetchUsers();
      }
      await fetchUserStats();
      
    } catch (error) {
      console.error(`❌ Dashboard: Error ${action} user:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} user`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Fetch user's favorites
  const fetchFavorites = async (page = 1) => {
    setLoadingFavorites(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📡 Dashboard: Fetching favorites...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/favorites?page=${page}&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Dashboard: Favorites response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dashboard: Favorites fetch error:', errorText);
        throw new Error(`Failed to fetch favorites: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard: Favorites data received:', { 
        success: data.success, 
        favoritesCount: data.data?.length || 0 
      });

      setFavorites(data.data || []);
      setFavoritesPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10
      });

    } catch (error) {
      console.error('❌ Dashboard: Error fetching favorites:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch favorites",
        variant: "destructive"
      });
      setFavorites([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Add/remove favorite function
  const toggleFavorite = async (listingId: string, isFavorited: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${isFavorited ? 'remove' : 'add'} favorite`);
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message,
      });

      // Refresh favorites if they're currently shown
      if (showFavorites) {
        fetchFavorites(favoritesPagination.currentPage);
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update favorite',
        variant: "destructive"
      });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete listing');
      }

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });

      // Refresh listings
      fetchUserListings();

    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete listing',
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Clear cookies
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/auth/login');
  };

  const formatPrice = (price: number, frequency: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);

    if (frequency === 'fixed') return formattedPrice;
    return `${formattedPrice}/${frequency}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rental': return Home;
      case 'sale': return ShoppingCart;
      case 'service': return Briefcase;
      default: return Building;
    }
  };

  const getStatusColor = (status: string, moderationStatus: string) => {
    if (moderationStatus === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (moderationStatus === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'expired') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, moderationStatus: string) => {
    if (moderationStatus === 'pending') return 'Pending Review';
    if (moderationStatus === 'rejected') return 'Rejected';
    if (status === 'active') return 'Active';
    if (status === 'expired') return 'Expired';
    return status;
  };

  // Admin-specific function to handle moderation
  const handleModeration = async (listingId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}/moderate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} listing`);
      }

      toast({
        title: "Success",
        description: `Listing ${action}ed successfully`,
      });

      // Refresh listings
      fetchUserListings();

    } catch (error) {
      console.error('Error moderating listing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} listing`,
        variant: "destructive"
      });
    }
  };

  // User Detail Modal Component
  const UserDetailModal = () => {
    if (!selectedUser) return null;

    return (
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {selectedUser.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              User Details: {selectedUser.displayName || selectedUser.username}
            </DialogTitle>
            <DialogDescription>
              Manage user account and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Username</label>
                <p className="text-sm">{selectedUser.username || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 'secondary'}>
                  {selectedUser.role}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="flex gap-2">
                  <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {selectedUser.isLocked && (
                    <Badge variant="destructive">Locked</Badge>
                  )}
                  {selectedUser.isVerified && (
                    <Badge variant="outline">Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Login</label>
                <p className="text-sm">
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Upload Quota</label>
                <p className="text-sm">
                  {selectedUser.uploadQuota?.freeUploadsUsed || 0} / {selectedUser.uploadQuota?.freeUploadsLimit || 10} free uploads
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Paid Uploads</label>
                <p className="text-sm">
                  {selectedUser.uploadQuota?.paidUploadsRemaining || 0} remaining
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUserAction(selectedUser._id, 'send-verification')}
                disabled={actionLoading === `send-verification-${selectedUser._id}`}
                className="text-blue-600"
              >
                <Mail className="h-3 w-3 mr-1" />
                Send Verification
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUserAction(selectedUser._id, 'send-password-reset')}
                disabled={actionLoading === `send-password-reset-${selectedUser._id}`}
                className="text-purple-600"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Password Reset
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUserAction(selectedUser._id, 'reset-quota', { freeUploadsLimit: 10 })}
                disabled={actionLoading === `reset-quota-${selectedUser._id}`}
                className="text-green-600"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset Quota
              </Button>
              
              {selectedUser.isLocked ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUserAction(selectedUser._id, 'unlock')}
                  disabled={actionLoading === `unlock-${selectedUser._id}`}
                  className="text-green-600"
                >
                  <Unlock className="h-3 w-3 mr-1" />
                  Unlock Account
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUserAction(selectedUser._id, 'lock')}
                  disabled={actionLoading === `lock-${selectedUser._id}`}
                  className="text-orange-600"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Lock Account
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.username) {
      return user.username;
    }
    return 'User';
  };

  // Enhanced admin section with user management
  const renderAdminSection = () => {
    if (user?.role !== 'admin') return null;

  return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            Admin Dashboard
          </h2>
          <div className="flex gap-2">
            <Button
              variant={showUserManagement ? "default" : "outline"}
              onClick={() => setShowUserManagement(!showUserManagement)}
              className="flex items-center gap-2"
            >
              <UsersIcon className="h-4 w-4" />
              {showUserManagement ? 'Hide' : 'Show'} User Management
            </Button>
            <Button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Full Admin Panel
            </Button>
          </div>
        </div>

        {/* User Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.activeUsers || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.verifiedUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {((userStats.verifiedUsers || 0) / (userStats.totalUsers || 1) * 100).toFixed(1)}% verified
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Locked Accounts</CardTitle>
              <Lock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.lockedUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.adminUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Platform administrators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Interface */}
        {showUserManagement && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search users..."
                    value={userFilters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({...userFilters, role: e.target.value, page: 1})}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="advertiser">Advertiser</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={userFilters.status}
                  onChange={(e) => setUserFilters({...userFilters, status: e.target.value, page: 1})}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="locked">Locked</option>
                </select>
                <select
                  value={userFilters.limit}
                  onChange={(e) => setUserFilters({...userFilters, limit: parseInt(e.target.value), page: 1})}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading users...</span>
                  </div>
                ) : (
                  <>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">User</th>
                          <th className="text-left p-3 font-medium">Role</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Joined</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((userData) => (
                          <tr key={userData._id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                                    {userData.username?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{userData.displayName || userData.username}</div>
                                  <div className="text-sm text-gray-500">{userData.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={userData.role === 'admin' ? 'destructive' : 'secondary'}>
                                {userData.role}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <Badge variant={userData.isActive ? 'default' : 'secondary'}>
                                  {userData.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {userData.isLocked && (
                                  <Badge variant="destructive" className="text-xs">
                                    Locked
                                  </Badge>
                                )}
                                {userData.isVerified && (
                                  <Badge variant="outline" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-sm">
                              {new Date(userData.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                {userData.isLocked ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUserAction(userData._id, 'unlock')}
                                    disabled={actionLoading === `unlock-${userData._id}`}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Unlock account"
                                  >
                                    {actionLoading === `unlock-${userData._id}` ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                                    ) : (
                                      <Unlock className="h-3 w-3" />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUserAction(userData._id, 'lock')}
                                    disabled={actionLoading === `lock-${userData._id}`}
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    title="Lock account"
                                  >
                                    {actionLoading === `lock-${userData._id}` ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                                    ) : (
                                      <Lock className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(userData._id, 'send-verification')}
                                  disabled={actionLoading === `send-verification-${userData._id}`}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Send verification email"
                                >
                                  {actionLoading === `send-verification-${userData._id}` ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                  ) : (
                                    <Mail className="h-3 w-3" />
                                  )}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(userData._id, 'reset-quota', { freeUploadsLimit: 10 })}
                                  disabled={actionLoading === `reset-quota-${userData._id}`}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  title="Reset upload quota"
                                >
                                  {actionLoading === `reset-quota-${userData._id}` ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(userData);
                                    setShowUserModal(true);
                                  }}
                                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                  title="View details"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {userPagination.pages > 1 && (
                      <div className="flex items-center justify-between mt-4 px-2">
                        <div className="text-sm text-gray-500">
                          Showing {((userPagination.page - 1) * userPagination.limit) + 1} to{' '}
                          {Math.min(userPagination.page * userPagination.limit, userPagination.total)} of{' '}
                          {userPagination.total} users
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(userPagination.page - 1)}
                            disabled={!userPagination.hasPrev}
                          >
                            Previous
                          </Button>
                          <span className="flex items-center px-3 text-sm">
                            Page {userPagination.page} of {userPagination.pages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(userPagination.page + 1)}
                            disabled={!userPagination.hasNext}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {users.length === 0 && !loadingUsers && (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Existing admin cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingListings}</div>
              <Button
                variant="ghost"
                className="mt-2 w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={() => router.push('/admin/listings')}
              >
                Review Listings
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reported Content</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reportedListings}</div>
              <Button
                variant="ghost"
                className="mt-2 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => router.push('/admin/listings/reported')}
              >
                Review Reports
              </Button>
            </CardContent>
          </Card>

     
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Detail Modal */}
      <UserDetailModal />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-16 py-3 sm:py-0">
            <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </h1>
              <Badge variant="secondary" className={`text-xs sm:text-sm whitespace-nowrap ${user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {user?.role === 'admin' ? 'Admin' : (user?.telegramId ? 'Telegram User' : 'Email User')}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
              {user?.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => router.push('/admin')} className="whitespace-nowrap">
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Admin Panel</span>
                  <span className="xs:hidden">Admin</span>
                </Button>
              )}
             
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="whitespace-nowrap">
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Main Content */}
            {/* Welcome Message */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                      Welcome back, {user.firstName || user.username || 'User'}! 👋
                    </h2>
                    <p className="text-blue-100 text-sm sm:text-base">
                      Ready to manage your listings? Create new ones or update existing ones.
                    </p>
                  </div>
                  <div className="hidden md:block flex-shrink-0">
                    <div className="bg-white/20 rounded-full p-3">
                      <Building className="h-8 w-8 mx-auto" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-sm">
                  Get started with these popular actions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <Button 
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2 sm:p-4" 
                    variant="outline"
                    onClick={() => router.push('/listings')}
                  >
                    <Search className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Browse Listings</span>
                  </Button>
                  <Button 
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2 sm:p-4" 
                    variant="outline"
                    onClick={() => router.push('/create-listing')}
                  >
                    <PlusCircle className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Create Listing</span>
                  </Button>
                  <Button 
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2 sm:p-4" 
                    variant="outline"
                    onClick={() => router.push('/jobs')}
                  >
                    <Briefcase className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Browse Jobs</span>
                  </Button>
                  {user && (
                    <Button 
                      className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2 sm:p-4" 
                      variant="outline"
                      onClick={() => router.push('/jobs/create')}
                    >
                      <Building className="h-4 w-4 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm">Post Job</span>
                    </Button>
                  )}
                 
                  <Button 
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2 sm:p-4" 
                    variant="outline"
                    onClick={() => {
                      setShowFavorites(!showFavorites);
                      if (!showFavorites) {
                        fetchFavorites();
                      }
                    }}
                  >
                    <Star className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Favorites</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Listings</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalListings}</p>
                    </div>
                    <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Listings</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.activeListings}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Views</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalViews}</p>
                    </div>
                    <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Expiring Soon</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.expiringSoon}</p>
                    </div>
                    <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {user?.role === 'admin' && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
                        <UsersIcon className="h-8 w-8 text-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>

          <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending Review</p>
                          <p className="text-2xl font-bold">{stats.pendingListings}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Admin Section */}
            {renderAdminSection()}

            {/* Favorites Section */}
            {showFavorites && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        My Favorites
                      </CardTitle>
                      <CardDescription>
                        Your favorite listings - easily access properties you're interested in
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFavorites(false)}
                    >
                      Hide Favorites
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingFavorites ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-24 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="space-y-4">
                      {favorites.map((listing) => {
                        const CategoryIcon = getCategoryIcon(listing.category);
                        return (
                          <div key={listing._id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {listing.image_urls.length > 0 ? (
                                    <img
                                      src={listing.image_urls[0]}
                                      alt={listing.title}
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <CategoryIcon className="h-8 w-8 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">{listing.title}</h3>
                                  <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      {formatPrice(listing.price, listing.pricing_frequency)}
                                    </span>
                                    <span className="flex items-center">
                                      <Eye className="h-3 w-3 mr-1" />
                                      {listing.views} views
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Added {new Date(listing.favorited_at || listing.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(listing.status, listing.moderationStatus)}>
                                  {getStatusText(listing.status, listing.moderationStatus)}
                                </Badge>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/listings/${listing._id}`)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                <FavoriteButton
                                  listingId={listing._id}
                                  isFavorited={true}
                                  variant="icon"
                                  size="sm"
                                  onToggle={() => {
                                    // Refresh favorites when removed
                                    fetchFavorites(favoritesPagination.currentPage);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Pagination for favorites */}
                      {favoritesPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-2">
                          <div className="text-sm text-gray-500">
                            Showing {((favoritesPagination.currentPage - 1) * favoritesPagination.limit) + 1} to{' '}
                            {Math.min(favoritesPagination.currentPage * favoritesPagination.limit, favoritesPagination.totalItems)} of{' '}
                            {favoritesPagination.totalItems} favorites
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchFavorites(favoritesPagination.currentPage - 1)}
                              disabled={!favoritesPagination.hasPrevPage}
                            >
                              Previous
                            </Button>
                            <span className="flex items-center px-3 text-sm">
                              Page {favoritesPagination.currentPage} of {favoritesPagination.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchFavorites(favoritesPagination.currentPage + 1)}
                              disabled={!favoritesPagination.hasNextPage}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                      <p className="text-gray-600 mb-4">
                        Start browsing listings and add your favorites to see them here
                      </p>
                      <Button onClick={() => router.push('/listings')}>
                        <Search className="h-4 w-4 mr-2" />
                        Browse Listings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* My Listings */}
          <Card className="mt-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {user?.role === 'admin' ? 'All Listings' : 'My Listings'}
                    </CardTitle>
                    <CardDescription>
                      {user?.role === 'admin' 
                        ? 'Manage and moderate all listings' 
                        : 'Manage your active listings'}
                    </CardDescription>
                  </div>
                  <Button onClick={() => router.push('/create-listing')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {loadingListings ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : listings.length > 0 ? (
                  <div className="space-y-4">
                    {listings.map((listing) => {
                      const CategoryIcon = getCategoryIcon(listing.category);
                      return (
                        <div key={listing._id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                {listing.image_urls.length > 0 ? (
                                  <img
                                    src={listing.image_urls[0]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <CategoryIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{listing.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {formatPrice(listing.price, listing.pricing_frequency)}
                                  </span>
                                  <span className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {listing.views} views
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(listing.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(listing.status, listing.moderationStatus)}>
                                {getStatusText(listing.status, listing.moderationStatus)}
                              </Badge>
                              
                              {user?.role === 'admin' && listing.moderationStatus === 'pending' && (
                                <>
                              <Button
                                variant="outline"
                                size="sm"
                                    onClick={() => handleModeration(listing._id, 'approve')}
                                    className="bg-green-50 hover:bg-green-100 text-green-600"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleModeration(listing._id, 'reject')}
                                    className="bg-red-50 hover:bg-red-100 text-red-600"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (user?.role === 'admin') {
                                    router.push(`/admin/listings/${listing._id}`);
                                  } else {
                                    router.push(`/listings/${listing._id}`);
                                  }
                                }}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (user?.role === 'admin') {
                                    router.push(`/admin/listings/${listing._id}`);
                                  } else {
                                    router.push(`/listings/${listing._id}/edit`);
                                  }
                                }}
                                title={user?.role === 'admin' ? 'View/Edit Details' : 'Edit Listing'}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteListing(listing._id)}
                                title="Delete Listing"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {listings.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={() => router.push('/dashboard/listings')}>
                          View All Listings ({listings.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first listing to get started
                    </p>
                    <Button onClick={() => router.push('/create-listing')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Your First Listing
                    </Button>
              </div>
                )}
            </CardContent>
          </Card>
          </div>
        </div>
        
      </div>
    
  );
}
