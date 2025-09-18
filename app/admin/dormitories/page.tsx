"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Hotel,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  MapPin,
  ArrowUpDown,
  Loader2,
  Plus,
  GraduationCap,
  Users,
  Phone
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Dormitory {
  _id: string;
  title: string;
  description: string;
  university: {
    name: string;
    isFromDropdown: boolean;
  };
  location: {
    city: string;
    address: string;
  };
  availability: 'available' | 'running_out' | 'unavailable';
  image_urls: string[];
  roomVariants: Array<{
    type: string;
    capacity: number;
    price: number;
    priceFrequency: string;
    available: boolean;
  }>;
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  views: number;
  inquiries: number;
  createdAt: string;
  status: string;
  moderationStatus: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  genderRestriction: 'male' | 'female' | 'mixed';
  isReported?: boolean;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  approved: number;
  rejected: number;
  reported: number;
  availability: {
    available: number;
    runningOut: number;
    unavailable: number;
  };
}

export default function AdminDormitoriesPage() {
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    moderationStatus: "all",
    availability: "all",
    city: "all",
    university: "all",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const router = useRouter();
  const { toast } = useToast();

  const fetchDormitories = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v !== 'all'))
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dormitories');
      }

      const data = await response.json();
      setDormitories(data.data.dormitories);
      setTotalPages(data.data.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dormitories');
      toast({
        title: "Error",
        description: "Failed to fetch dormitories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchDormitories();
    fetchStats();
  }, [page, sortBy, sortOrder, filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dormitory?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete dormitory');

      toast({
        title: "Success",
        description: "Dormitory deleted successfully",
      });

      fetchDormitories();
      fetchStats();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete dormitory",
        variant: "destructive",
      });
    }
  };

  const handleModerate = async (id: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories/${id}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action, notes })
      });

      if (!response.ok) throw new Error(`Failed to ${action} dormitory`);

      toast({
        title: "Success",
        description: `Dormitory ${action}d successfully`,
      });

      fetchDormitories();
      fetchStats();
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${action} dormitory`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getModerationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-700"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'running_out':
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Running Out</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const getPriceRange = (roomVariants: Dormitory['roomVariants']) => {
    if (!roomVariants?.length) return 'N/A';

    const prices = roomVariants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return min === max ? `$${min}` : `$${min} - $${max}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dormitories Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage student dormitories and accommodation
          </p>
        </div>
        <Button onClick={() => router.push('/admin/dormitories/create')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Dormitory
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dormitories</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availability.available}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reported</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reported}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dormitories..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.moderationStatus} onValueChange={(value) => setFilters({ ...filters, moderationStatus: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Moderation Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.availability} onValueChange={(value) => setFilters({ ...filters, availability: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="running_out">Running Out</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />

            <Input
              placeholder="University"
              value={filters.university}
              onChange={(e) => setFilters({ ...filters, university: e.target.value })}
            />
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

      {/* Dormitories List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Dormitories</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="inquiries">Inquiries</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading dormitories...</span>
            </div>
          ) : dormitories.length === 0 ? (
            <div className="text-center py-8">
              <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No dormitories found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or create a new dormitory.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dormitories.map((dormitory) => (
                <div key={dormitory._id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-3">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{dormitory.title}</h3>
                        {dormitory.isReported && (
                          <Badge variant="destructive" className="text-xs mt-1 sm:mt-0 w-fit">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Reported
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            {dormitory.university.name}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {dormitory.location.city}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 mr-2" />
                            {dormitory.contact.phone}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-2" />
                            {dormitory.roomVariants.length} room types
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {getPriceRange(dormitory.roomVariants)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Eye className="w-4 h-4 mr-2" />
                            {dormitory.views} views, {dormitory.inquiries} inquiries
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="w-4 h-4 mr-2" />
                            {dormitory.owner.firstName} {dormitory.owner.lastName}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(dormitory.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {getStatusBadge(dormitory.status)}
                        {getModerationBadge(dormitory.moderationStatus)}
                        {getAvailabilityBadge(dormitory.availability)}
                        <Badge variant="outline">{dormitory.genderRestriction}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 lg:space-y-0 lg:ml-4 justify-start lg:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/dormitories/${dormitory._id}`)}
                        className="flex-1 lg:flex-none"
                      >
                        <Eye className="w-4 h-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">View</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/dormitories/${dormitory._id}/edit`)}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="w-4 h-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      {dormitory.moderationStatus === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleModerate(dormitory._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 flex-1 lg:flex-none"
                          >
                            <CheckCircle className="w-4 h-4 mr-1 lg:mr-2" />
                            <span className="hidden sm:inline">Approve</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleModerate(dormitory._id, 'reject')}
                            className="flex-1 lg:flex-none"
                          >
                            <XCircle className="w-4 h-4 mr-1 lg:mr-2" />
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </>
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(dormitory._id)}
                        className="flex-1 lg:flex-none"
                      >
                        <Trash2 className="w-4 h-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}