'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  Star,
  Globe,
  TrendingUp,
  Eye,
  DollarSign,
  Filter,
  Plus,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { promotionsApi } from '@/lib/api';

interface Promotion {
  _id: string;
  listing: {
    _id: string;
    title: string;
    category: string;
    images: string[];
    price: {
      amount: number;
      currency: string;
    };
  };
  placement: 'homepage' | 'category_top';
  status: 'awaiting_payment' | 'submitted' | 'under_review' | 'active' | 'expired' | 'rejected' | 'cancelled';
  pricing: {
    durationDays: number;
    amount: number;
    currency: string;
    chain: string;
  };
  payment: {
    txHash?: string;
    screenshotUrl?: string;
    verifiedAt?: string;
  };
  schedule: {
    startAt?: string;
    endAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

interface PromotionFilters {
  status: string;
  placement: string;
  search: string;
  sortBy: string;
}

export default function PromotionHistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState<PromotionFilters>({
    status: 'all',
    placement: 'all',
    search: '',
    sortBy: 'newest'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    if (user) {
      fetchPromotions();
    }
  }, [user, filters, pagination.page]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: pagination.page,
        limit: 12
      };

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.placement !== 'all') params.placement = filters.placement;
      if (filters.search) params.search = filters.search;
      if (filters.sortBy !== 'newest') params.sortBy = filters.sortBy;

      // This would be a user-specific promotions endpoint
      const response = await promotionsApi.getUserPromotions(params);

      if (response.success) {
        setPromotions(response.data || []);
        setPagination({
          page: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0
        });
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      // For demo purposes, set empty array
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPromotions();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Promotion history updated'
    });
  };

  const handleFilterChange = (key: keyof PromotionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      placement: 'all',
      search: '',
      sortBy: 'newest'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'submitted': 
      case 'under_review': return 'secondary';
      case 'expired': return 'outline';
      case 'rejected': 
      case 'cancelled': return 'destructive';
      case 'awaiting_payment': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'awaiting_payment': return 'Awaiting Payment';
      case 'submitted': return 'Payment Submitted';
      case 'under_review': return 'Under Review';
      case 'active': return 'Active';
      case 'expired': return 'Expired';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPlacementLabel = (placement: string) => {
    switch (placement) {
      case 'homepage': return 'Homepage Hero';
      case 'category_top': return 'Category Top';
      default: return placement;
    }
  };

  const getPlacementIcon = (placement: string) => {
    switch (placement) {
      case 'homepage': return Globe;
      case 'category_top': return TrendingUp;
      default: return Star;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign in to view your promotion history
            </h1>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/promotions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Promotion History</h1>
              <p className="text-gray-600 mt-1">Track your promotion campaigns</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/promotions/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Promotion
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {promotions.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {promotions.filter(p => ['submitted', 'under_review', 'awaiting_payment'].includes(p.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {promotions.filter(p => p.status === 'expired').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(promotions.reduce((sum, p) => sum + (p.pricing?.amount || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search promotions..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="submitted">Payment Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Placement</label>
                <Select value={filters.placement} onValueChange={(value) => handleFilterChange('placement', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Placements</SelectItem>
                    <SelectItem value="homepage">Homepage Hero</SelectItem>
                    <SelectItem value="category_top">Category Top</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promotions List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : promotions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No promotions yet</h3>
                <p className="text-gray-600">Start promoting your listings to reach more customers</p>
                <Link href="/promotions/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Promotion
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promotions.map((promotion) => {
                const PlacementIcon = getPlacementIcon(promotion.placement);
                return (
                  <Card key={promotion._id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={promotion.listing?.images?.[0] || '/placeholder.jpg'}
                            alt={promotion.listing?.title || 'Listing'}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 line-clamp-1">
                                {promotion.listing?.title || 'Deleted Listing'}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <PlacementIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                  {getPlacementLabel(promotion.placement)}
                                </span>
                                <Badge variant={getStatusBadgeVariant(promotion.status)}>
                                  {getStatusLabel(promotion.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span className="font-medium">{promotion.pricing?.durationDays} days</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Cost:</span>
                              <span className="font-medium">
                                {formatPrice(promotion.pricing?.amount || 0, promotion.pricing?.currency)}
                              </span>
                            </div>
                            {promotion.schedule?.startAt && promotion.schedule?.endAt && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                  {promotion.status === 'active' ? 'Ends:' : 'Period:'}
                                </span>
                                <span className="font-medium">
                                  {promotion.status === 'active' 
                                    ? `${getDaysRemaining(promotion.schedule.endAt)} days left`
                                    : `${formatDate(promotion.schedule.startAt)} - ${formatDate(promotion.schedule.endAt)}`
                                  }
                                </span>
                              </div>
                            )}
                            {promotion.rejectionReason && (
                              <div className="text-sm">
                                <span className="text-red-600 font-medium">Reason: </span>
                                <span className="text-red-600">{promotion.rejectionReason}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <span className="text-xs text-gray-500">
                              Created {formatDate(promotion.createdAt)}
                            </span>
                            <div className="flex items-center space-x-2">
                              {promotion.payment?.txHash && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Open blockchain explorer
                                    window.open(`https://etherscan.io/tx/${promotion.payment.txHash}`, '_blank');
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                              {promotion.status === 'awaiting_payment' && (
                                <Link href={`/promotions/create?listing=${promotion.listing?._id}`}>
                                  <Button size="sm">
                                    Complete Payment
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                  if (pageNum > pagination.pages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
