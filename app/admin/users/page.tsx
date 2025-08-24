"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { 
  MoreHorizontal, 
  Search, 
  User, 
  UserPlus, 
  Users as UsersIcon,
  Shield,
  Lock,
  Unlock,
  Mail,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  Loader2,
  Filter
} from "lucide-react";

interface UserData {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  phone?: string;
  isLocked?: boolean;
  lockUntil?: string;
  fullName?: string;
  displayName?: string;
  canUpload?: boolean;
}

interface FilterState {
  search: string;
  role: string;
  status: string;
  verified: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  verifiedUsers: number;
  lockedUsers: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: '',
    status: '',
    verified: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Users fetched:', { success: data.success, count: data.users?.length || 0 });

      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: 20 });

    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(`role-${userId}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update user role');
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      fetchUsers();

    } catch (error) {
      console.error('Error changing user role:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update user role',
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLock = async (userId: string, action: 'lock' | 'unlock') => {
    setActionLoading(`${action}-${userId}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/lock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action,
          duration: action === 'lock' ? 24 : undefined // Lock for 24 hours by default
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} user`);
      }

      toast({
        title: "Success",
        description: `User ${action}ed successfully`,
      });

      fetchUsers();

    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} user`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(`delete-${userId}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
      fetchStats();

    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendVerification = async (userId: string) => {
    setActionLoading(`verify-${userId}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/send-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send verification email');
      }

      toast({
        title: "Success",
        description: "Verification email sent successfully",
      });

    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send verification email',
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'advertiser': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (user: UserData) => {
    if (user.isLocked) return 'bg-red-100 text-red-800 border-red-200';
    if (!user.isActive) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (!user.isVerified) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (user: UserData) => {
    if (user.isLocked) return 'Locked';
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Unverified';
    return 'Active';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage user accounts and permissions
          </p>
          </div>
          
          <Button 
            onClick={() => router.push('/admin/users/create')}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                  </div>
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verified</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.verifiedUsers}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.adminUsers}</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Locked</p>
                    <p className="text-2xl font-bold text-red-600">{stats.lockedUsers}</p>
                  </div>
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 md:col-span-1 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
            />
          </div>

              {/* Role Filter */}
              <Select value={filters.role || 'all'} onValueChange={(value) => handleFilterChange('role', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="advertiser">Advertiser</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>

              {/* Verified Filter */}
              <Select value={filters.verified || 'all'} onValueChange={(value) => handleFilterChange('verified', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Verified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="lastLogin">Last Login</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>

              {/* Items per page */}
              <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  role: '',
                  status: '',
                  verified: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                  page: 1,
                  limit: 20
                })}
                className="col-span-1 sm:col-span-2 md:col-span-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users ({pagination.total})</CardTitle>
                <CardDescription>
                  Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} users
                </CardDescription>
        </div>
      </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="hidden md:table-cell">Last Login</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
                    {users.map((user) => {
                      const isActionLoadingForUser = actionLoading && actionLoading.includes(user._id);
                      
                      return (
                        <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                                <div className="font-medium">{user.displayName || user.username}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                            <Badge className={getRoleColor(user.role)} variant="outline">
                              {user.role}
                            </Badge>
                  </TableCell>
                  <TableCell>
                            <Badge className={getStatusColor(user)} variant="outline">
                              {getStatusText(user)}
                            </Badge>
                  </TableCell>
                          <TableCell className="hidden sm:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoadingForUser}>
                                  {isActionLoadingForUser ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                          <MoreHorizontal className="h-4 w-4" />
                                  )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user._id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user._id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Role Changes */}
                                {user.role !== 'admin' && (
                                  <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'admin')}>
                                    <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                                )}
                                {user.role !== 'advertiser' && (
                                  <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'advertiser')}>
                                    <User className="h-4 w-4 mr-2" />
                                    Make Advertiser
                                  </DropdownMenuItem>
                                )}
                                {user.role !== 'user' && (
                                  <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'user')}>
                                    <User className="h-4 w-4 mr-2" />
                          Make User
                        </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {/* Lock/Unlock */}
                                {user.isLocked ? (
                                  <DropdownMenuItem onClick={() => handleToggleLock(user._id, 'unlock')}>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Unlock User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleToggleLock(user._id, 'lock')}>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Lock User
                                  </DropdownMenuItem>
                                )}
                                
                                {/* Send Verification */}
                                {!user.isVerified && (
                                  <DropdownMenuItem onClick={() => handleSendVerification(user._id)}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Verification
                                  </DropdownMenuItem>
                                )}
                                
                        <DropdownMenuSeparator />
                                
                                {/* Delete User */}
                        <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDeleteUser(user._id)}
                        >
                                  <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                      );
                    })}
          </TableBody>
        </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {Object.values(filters).some(v => v !== '' && v !== 1 && v !== 20 && v !== 'createdAt' && v !== 'desc')
                    ? 'Try adjusting your search filters'
                    : 'No users have been created yet'
                  }
                </p>
                <Button onClick={() => router.push('/admin/users/create')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create First User
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', Math.min(pagination.pages, filters.page + 1))}
                    disabled={filters.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
