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
  Building,
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
  Home,
  ShoppingCart,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  isReported?: boolean;
  owner: {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    preferredMethod?: string;
  };
  location: {
    city?: string;
    region?: string;
    address?: string;
  };
}

interface FilterState {
  search: string;
  category: string;
  status: string;
  moderationStatus: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    status: '',
    moderationStatus: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
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

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/listings?${queryParams.toString()}`;
      console.log('🔍 Fetching admin listings from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch listings error:', errorText);
        throw new Error(`Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Listings fetched:', { 
        success: data.success, 
        count: data.data?.listings?.length || 0 
      });

      setListings(data.data?.listings || []);
      setPagination(data.data?.pagination || { total: 0, page: 1, pages: 1 });

    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  };

  const handleModeration = async (listingId: string, action: 'approve' | 'reject', notes?: string) => {
    setActionLoading(`${action}-${listingId}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          notes 
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} listing`);
      }

      toast({
        title: "Success",
        description: `Listing ${action}ed successfully`,
      });

      fetchListings(); // Refresh the list

    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} listing`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setActionLoading(`delete-${listingId}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}`, {
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

      fetchListings(); // Refresh the list

    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete listing',
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
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

  const getStatusColor = (status: string, moderationStatus: string, isReported?: boolean) => {
    if (isReported) return 'bg-red-100 text-red-800 border-red-200';
    if (moderationStatus === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (moderationStatus === 'rejected') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'active' && moderationStatus === 'approved') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'expired') return 'bg-gray-100 text-gray-800 border-gray-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string, moderationStatus: string, isReported?: boolean) => {
    if (isReported) return 'Reported';
    if (moderationStatus === 'pending') return 'Pending Review';
    if (moderationStatus === 'rejected') return 'Rejected';
    if (status === 'active' && moderationStatus === 'approved') return 'Active';
    if (status === 'expired') return 'Expired';
    return status;
  };

  const quickFilters = [
    { label: 'All', key: 'all', value: '' },
    { label: 'Pending Review', key: 'pending', value: 'pending' },
    { label: 'Approved', key: 'approved', value: 'approved' },
    { label: 'Rejected', key: 'rejected', value: 'rejected' },
    { label: 'Reported', key: 'reported', value: 'reported' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Listings Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage and moderate all platform listings
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/admin/listings/create')}
            className="w-full sm:w-auto"
          >
            <Building className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>

        {/* Quick Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {quickFilters.map(filter => (
                <Button
                  key={filter.key}
                  variant={
                    (filter.key === 'reported' && filters.moderationStatus === '' && filters.status === 'reported') ||
                    (filter.key !== 'reported' && filter.key !== 'all' && filters.moderationStatus === filter.value) ||
                    (filter.key === 'all' && filters.moderationStatus === '' && filters.status === '')
                      ? "default" 
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    if (filter.key === 'reported') {
                      handleFilterChange('moderationStatus', '');
                      handleFilterChange('status', 'reported');
                    } else if (filter.key === 'all') {
                      handleFilterChange('moderationStatus', '');
                      handleFilterChange('status', '');
                    } else {
                      handleFilterChange('moderationStatus', filter.value);
                      handleFilterChange('status', '');
                    }
                  }}
                >
                  {filter.label}
                  {filter.key === 'pending' && (
                    <Badge variant="secondary" className="ml-2">
                      {listings.filter(l => l.moderationStatus === 'pending').length}
                    </Badge>
                  )}
                  {filter.key === 'reported' && (
                    <Badge variant="destructive" className="ml-2">
                      {listings.filter(l => l.isReported).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search listings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category */}
              <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="moderationStatus">Status</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Button
                variant="outline"
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                className="justify-start"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{filters.sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                <span className="sm:hidden">{filters.sortOrder === 'desc' ? 'New' : 'Old'}</span>
              </Button>

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
                  category: '',
                  status: '',
                  moderationStatus: '',
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

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Listings ({pagination.total})</CardTitle>
                <CardDescription>
                  Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} listings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading listings...</span>
              </div>
            ) : listings.length > 0 ? (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                  <div className="col-span-4">Listing</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-1">Category</div>
                  <div className="col-span-1">Price</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Actions</div>
                </div>

                {/* Listings */}
                {listings.map((listing) => {
                  const CategoryIcon = getCategoryIcon(listing.category);
                  const isActionLoading = actionLoading && actionLoading.includes(listing._id);
                  
                  return (
                    <div key={listing._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Listing Info */}
                        <div className="lg:col-span-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{listing.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {listing.views} views
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(listing.createdAt).toLocaleDateString()}
                                </span>
                                {listing.location?.city && (
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {listing.location.city}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Owner */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {listing.owner.firstName && listing.owner.lastName 
                                  ? `${listing.owner.firstName} ${listing.owner.lastName}`
                                  : listing.owner.username
                                }
                              </p>
                              <p className="text-xs text-gray-500">{listing.owner.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="lg:col-span-1">
                          <Badge variant="outline" className="capitalize">
                            {listing.category}
                          </Badge>
                        </div>

                        {/* Price */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm font-medium">
                              {formatPrice(listing.price, listing.pricing_frequency)}
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="lg:col-span-2">
                          <div className="flex flex-col space-y-1">
                            <Badge className={getStatusColor(listing.status, listing.moderationStatus, listing.isReported)}>
                              {getStatusText(listing.status, listing.moderationStatus, listing.isReported)}
                            </Badge>
                            {listing.isReported && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Reported
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {/* View Details */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/listings/${listing._id}`)}
                              disabled={isActionLoading}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            {/* Moderation Actions */}
                            {listing.moderationStatus === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleModeration(listing._id, 'approve')}
                                  disabled={isActionLoading}
                                  className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                                >
                                  {actionLoading === `approve-${listing._id}` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleModeration(listing._id, 'reject')}
                                  disabled={isActionLoading}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                >
                                  {actionLoading === `reject-${listing._id}` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                </Button>
                              </>
                            )}

                            {/* Delete */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(listing._id)}
                              disabled={isActionLoading}
                              className="text-red-600 hover:bg-red-50 border-red-200"
                            >
                              {actionLoading === `delete-${listing._id}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.category || filters.moderationStatus || filters.status
                    ? 'Try adjusting your search filters'
                    : 'No listings have been created yet'
                  }
                </p>
                <Button onClick={() => router.push('/admin/listings/create')}>
                  <Building className="h-4 w-4 mr-2" />
                  Create First Listing
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