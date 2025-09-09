'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  Search,
  Filter,
  ExternalLink,
  Calendar,
  User,
  MapPin,
  Star,
  AlertTriangle,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { adminPromotionsApi } from '@/lib/api';

interface PromotionPayment {
  _id: string;
  listing: {
    _id: string;
    title: string;
    category: string;
    isExpired: boolean;
    primaryImage: string | null;
    id: string;
  };
  owner: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    displayName: string;
    canUpload: boolean;
    id: string;
  };
  pricing: {
    placement: 'homepage' | 'category_top';
    durationDays: number;
    amount: number;
    currency: string;
    chain: string;
  };
  payment: {
    walletAddress: string;
    screenshotUrl?: string;
    txHash?: string;
    verifiedAt?: string;
    reviewer?: string;
  };
  schedule?: {
    startAt: string;
    endAt: string;
  };
  metrics: {
    clicks: number;
    lastClickAt?: string;
  };
  placement: 'homepage' | 'category_top';
  listingCategory: string;
  status: 'awaiting_payment' | 'submitted' | 'active' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

interface PaymentFilters {
  status: string;
  placement: string;
  chain: string;
  search: string;
  sortBy: string;
}

export default function PaymentReviewPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [payments, setPayments] = useState<PromotionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    placement: 'all',
    chain: 'all',
    search: '',
    sortBy: 'newest'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const [selectedPayment, setSelectedPayment] = useState<PromotionPayment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: pagination.page,
        limit: 20
      };

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.placement !== 'all') params.placement = filters.placement;
      if (filters.chain !== 'all') params.chain = filters.chain;
      if (filters.search) params.search = filters.search;
      if (filters.sortBy !== 'newest') params.sortBy = filters.sortBy;

      const response = await adminPromotionsApi.list(params);

      if (response.success) {
        setPayments(response.data || []);
        setPagination({
          page: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      placement: 'all',
      chain: 'all',
      search: '',
      sortBy: 'newest'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleApprove = async (paymentId: string, durationDays?: number) => {
    try {
      setProcessing(paymentId);
      const response = await adminPromotionsApi.updateStatus(paymentId, 'approve', durationDays);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment approved and promotion activated'
        });
        fetchPayments();
        setShowDetailsDialog(false);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive'
      });
      return;
    }

    try {
      setProcessing(selectedPayment._id);
      const response = await adminPromotionsApi.updateStatus(selectedPayment._id, 'reject');
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment rejected'
        });
        fetchPayments();
        setShowRejectDialog(false);
        setShowDetailsDialog(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'payment_submitted': return 'default';
      case 'approved': return 'default';
      case 'active': return 'default';
      case 'rejected': return 'destructive';
      case 'expired': return 'secondary';
      case 'payment_pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getPlacementLabel = (placement: string) => {
    switch (placement) {
      case 'homepage': return 'Homepage Hero';
      case 'category_top': return 'Category Top';
      default: return placement;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Review</h1>
          <p className="text-gray-600 mt-1">Review and approve promotion payments</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter(p => p.status === 'submitted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {payments.filter(p => p.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(payments.reduce((sum, p) => sum + (p.pricing?.amount || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Placement</Label>
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
            <div className="space-y-2">
              <Label>Blockchain</Label>
              <Select value={filters.chain} onValueChange={(value) => handleFilterChange('chain', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chains</SelectItem>
                  <SelectItem value="eth">Ethereum</SelectItem>
                  <SelectItem value="usdt_trc20">USDT (TRC20)</SelectItem>
                  <SelectItem value="btc">Bitcoin</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="bsc">BSC</SelectItem>
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Submissions ({pagination.total})
            </CardTitle>
            {payments.filter(p => p.status === 'submitted').length > 0 && (
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  {payments.filter(p => p.status === 'submitted').length} pending review
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Listing Details</TableHead>
                  <TableHead className="font-semibold">Promotion</TableHead>
                  <TableHead className="font-semibold">Payment Info</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Timeline</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <DollarSign className="h-8 w-8" />
                        <p className="font-medium">No payment submissions found</p>
                        <p className="text-sm">Payment submissions will appear here once users submit promotion payments</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                                {payment.listing?.title || (
                                  <span className="text-gray-400 italic">Deleted Listing</span>
                                )}
                              </h4>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {payment.owner ? 
                                    payment.owner.fullName || payment.owner.displayName || payment.owner.username : 
                                    'Unknown User'
                                  }
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {payment.listingCategory ? 
                                    `Category: ${payment.listingCategory}` : 
                                    'Category not specified'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <Badge variant={payment.placement === 'homepage' ? 'default' : 'secondary'} className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {getPlacementLabel(payment.placement)}
                          </Badge>
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{payment.pricing?.durationDays || 0} days</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">{formatPrice(payment.pricing?.amount || 0)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              payment.pricing?.chain === 'eth' ? 'bg-blue-500' :
                              payment.pricing?.chain === 'usdt_trc20' ? 'bg-green-500' :
                              payment.pricing?.chain === 'btc' ? 'bg-orange-500' :
                              payment.pricing?.chain === 'polygon' ? 'bg-purple-500' :
                              payment.pricing?.chain === 'bsc' ? 'bg-yellow-500' :
                              payment.pricing?.chain === 'tron' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            <span className="text-xs text-gray-600 capitalize font-medium">{payment.pricing?.chain?.replace('_', ' ') || 'N/A'}</span>
                          </div>
                          {payment.payment?.txHash && (
                            <div className="text-xs">
                              <span className="text-gray-500">TX: </span>
                              <span className="font-mono text-gray-700 bg-gray-100 px-1 rounded">
                                {payment.payment.txHash.slice(0, 6)}...{payment.payment.txHash.slice(-4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <Badge 
                            variant={getStatusBadgeVariant(payment.status)}
                            className={`text-xs ${
                              payment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              payment.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                              payment.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                              payment.status === 'awaiting_payment' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            {payment.status === 'submitted' && <Clock className="h-3 w-3 mr-1" />}
                            {payment.status === 'active' && <Check className="h-3 w-3 mr-1" />}
                            {payment.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                            {payment.status === 'awaiting_payment' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {payment.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {payment.status === 'active' && payment.schedule?.endAt && (
                            <div className="text-xs text-gray-500">
                              Expires: {formatDate(payment.schedule.endAt)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-gray-500">Created:</span>
                            <div className="font-medium text-gray-900">{formatDate(payment.createdAt)}</div>
                          </div>
                          {payment.payment?.verifiedAt && (
                            <div className="text-xs">
                              <span className="text-gray-500">Verified:</span>
                              <div className="text-gray-700">{formatDate(payment.payment.verifiedAt)}</div>
                            </div>
                          )}
                          {payment.schedule?.startAt && (
                            <div className="text-xs">
                              <span className="text-gray-500">Started:</span>
                              <div className="text-gray-700">{formatDate(payment.schedule.startAt)}</div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailsDialog(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'submitted' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(payment._id, payment.pricing?.durationDays)}
                                disabled={processing === payment._id}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                title="Approve Payment"
                              >
                                {processing === payment._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowRejectDialog(true);
                                }}
                                disabled={processing === payment._id}
                                className="h-8 w-8 p-0"
                                title="Reject Payment"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * 20) + 1} to {Math.min(pagination.page * 20, pagination.total)} of {pagination.total} payments
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Review Details
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={getStatusBadgeVariant(selectedPayment.status)}
                    className={`text-sm px-3 py-1 ${
                      selectedPayment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      selectedPayment.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                      selectedPayment.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                      selectedPayment.status === 'awaiting_payment' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                  >
                    {selectedPayment.status === 'submitted' && <Clock className="h-4 w-4 mr-1" />}
                    {selectedPayment.status === 'active' && <Check className="h-4 w-4 mr-1" />}
                    {selectedPayment.status === 'rejected' && <X className="h-4 w-4 mr-1" />}
                    {selectedPayment.status === 'awaiting_payment' && <AlertTriangle className="h-4 w-4 mr-1" />}
                    {selectedPayment.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Payment ID: <span className="font-mono text-xs">{selectedPayment._id}</span>
                  </span>
                </div>
                {selectedPayment.status === 'active' && selectedPayment.schedule?.endAt && (
                  <div className="text-sm">
                    <span className="text-gray-500">Expires: </span>
                    <span className="font-medium">{formatDate(selectedPayment.schedule.endAt)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Listing & Promotion Details */}
                <div className="space-y-6">
                  {/* Listing Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Listing Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</Label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedPayment.listing?.title || (
                            <span className="text-gray-400 italic">Deleted Listing</span>
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {selectedPayment.owner ? 
                              selectedPayment.owner.fullName || selectedPayment.owner.displayName || selectedPayment.owner.username : 
                              'Unknown User'
                            }
                          </span>
                        </div>
                        {selectedPayment.owner?.email && (
                          <p className="text-xs text-gray-500 ml-6">{selectedPayment.owner.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {selectedPayment.listingCategory ? 
                              `Category: ${selectedPayment.listingCategory}` : 
                              'Category not specified'
                            }
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</Label>
                        <p className="text-sm capitalize mt-1">{selectedPayment.listing?.category || 'N/A'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Promotion Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Promotion Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Placement</Label>
                          <Badge variant={selectedPayment.placement === 'homepage' ? 'default' : 'secondary'} className="mt-1">
                            <Star className="h-3 w-3 mr-1" />
                            {getPlacementLabel(selectedPayment.placement)}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</Label>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{selectedPayment.pricing?.durationDays || 0} days</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Payment Details */}
                <div className="space-y-6">
                  {/* Payment Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-lg font-bold text-green-700">{formatPrice(selectedPayment.pricing?.amount || 0)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Blockchain</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedPayment.pricing?.chain === 'eth' ? 'bg-blue-500' :
                            selectedPayment.pricing?.chain === 'usdt_trc20' ? 'bg-green-500' :
                            selectedPayment.pricing?.chain === 'btc' ? 'bg-orange-500' :
                            selectedPayment.pricing?.chain === 'polygon' ? 'bg-purple-500' :
                            selectedPayment.pricing?.chain === 'bsc' ? 'bg-yellow-500' :
                            selectedPayment.pricing?.chain === 'tron' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <span className="text-sm font-medium capitalize">{selectedPayment.pricing?.chain?.replace('_', ' ') || 'N/A'}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Wallet Address</Label>
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-700 break-all mt-1">
                          {selectedPayment.payment?.walletAddress || 'N/A'}
                        </p>
                      </div>

                      {selectedPayment.payment?.txHash && (
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaction Hash</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-700 break-all flex-1">
                              {selectedPayment.payment.txHash}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const blockExplorerUrl = selectedPayment.pricing?.chain === 'eth' ? 
                                  `https://etherscan.io/tx/${selectedPayment.payment?.txHash}` :
                                  selectedPayment.pricing?.chain === 'usdt_trc20' ?
                                  `https://tronscan.org/#/transaction/${selectedPayment.payment?.txHash}` :
                                  selectedPayment.pricing?.chain === 'btc' ?
                                  `https://blockstream.info/tx/${selectedPayment.payment?.txHash}` :
                                  selectedPayment.pricing?.chain === 'polygon' ?
                                  `https://polygonscan.com/tx/${selectedPayment.payment?.txHash}` :
                                  selectedPayment.pricing?.chain === 'bsc' ?
                                  `https://bscscan.com/tx/${selectedPayment.payment?.txHash}` :
                                  '#';
                                window.open(blockExplorerUrl, '_blank');
                              }}
                              title="View on Block Explorer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Created</p>
                            <p className="text-xs text-gray-500">{formatDate(selectedPayment.createdAt)}</p>
                          </div>
                        </div>
                        
                        {selectedPayment.payment?.verifiedAt && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                            <div>
                              <p className="text-sm font-medium">Payment Verified</p>
                              <p className="text-xs text-gray-500">{formatDate(selectedPayment.payment.verifiedAt)}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedPayment.schedule?.startAt && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                            <div>
                              <p className="text-sm font-medium">Activated</p>
                              <p className="text-xs text-gray-500">{formatDate(selectedPayment.schedule.startAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedPayment.payment?.screenshotUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Payment Screenshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <img 
                        src={selectedPayment.payment.screenshotUrl} 
                        alt="Payment screenshot"
                        className="max-w-full h-auto rounded-lg border shadow-sm"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">Click image to view full size</p>
                        <Link 
                          href={selectedPayment.payment.screenshotUrl} 
                          target="_blank"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in New Tab
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason */}
              {selectedPayment.rejectionReason && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Rejection Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{selectedPayment.rejectionReason}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {selectedPayment.status === 'submitted' && (
                <div className="flex justify-end space-x-3 pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setShowRejectDialog(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject Payment
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPayment._id, selectedPayment.pricing?.durationDays)}
                    disabled={processing === selectedPayment._id}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {processing === selectedPayment._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve & Activate
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">Please provide a reason for rejecting this payment.</p>
            </div>
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this payment is being rejected..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processing}
              >
                Reject Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
