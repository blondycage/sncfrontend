'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle,
  DollarSign, CreditCard, FileImage, Download, ExternalLink,
  TrendingUp, Users, Wallet, BarChart3, RefreshCw
} from "lucide-react"
import { useToast } from '@/components/ui/toast'

interface Payment {
  _id: string
  paymentId: string
  user: { firstName: string; lastName: string; email: string }
  itemType: 'promotion' | 'listing' | 'property' | 'education_application' | 'featured_listing'
  paymentType: 'promotion_fee' | 'listing_fee' | 'featured_listing' | 'application_fee' | 'premium_placement' | 'service_payment'
  status: 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected' | 'refunded'
  pricing: {
    amount: number
    currency: string
    chain: string
    description: string
  }
  payment: {
    walletAddress: string
    txHash?: string
    screenshotUrl?: string
    verifiedAt?: string
    reviewer?: { firstName: string; lastName: string }
  }
  metadata: {
    duration?: number
    placement?: string
    features?: string[]
    serviceDetails?: {
      listingTitle?: string
      listingCategory?: string
      ownerName?: string
      ownerContact?: string
      customAmount?: number
      agreedTerms?: string
    }
  }
  itemReference?: any
  timeline: Array<{
    status: string
    date: string
    notes?: string
    updatedBy?: { firstName: string; lastName: string }
  }>
  createdAt: string
}

interface PaymentStats {
  totalPayments: number
  pendingPayments: number
  verifiedPayments: number
  rejectedPayments: number
  totalRevenue: number
  monthlyRevenue: number
}

export default function AdminPaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: '',
    notes: ''
  })
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    paymentType: 'all',
    itemType: 'all',
    chain: 'all'
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [paymentsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/admin/payments?limit=50`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/admin/stats`, { headers }).catch(() => null)
      ])

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.data || [])
      }

      if (statsRes?.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      } else {
        // Calculate stats from payments data
        const paymentsData = payments
        const totalPayments = paymentsData.length
        const pendingPayments = paymentsData.filter(p => ['pending', 'submitted', 'under_review'].includes(p.status)).length
        const verifiedPayments = paymentsData.filter(p => p.status === 'verified').length
        const rejectedPayments = paymentsData.filter(p => p.status === 'rejected').length
        const totalRevenue = paymentsData.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.pricing.amount, 0)
        
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const monthlyRevenue = paymentsData
          .filter(p => p.status === 'verified' && new Date(p.createdAt) >= thirtyDaysAgo)
          .reduce((sum, p) => sum + p.pricing.amount, 0)

        setStats({
          totalPayments,
          pendingPayments,
          verifiedPayments,
          rejectedPayments,
          totalRevenue,
          monthlyRevenue
        })
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedPayment || !reviewData.status) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/admin/${selectedPayment._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment status updated successfully',
          variant: 'default'
        })
        setReviewDialog(false)
        setReviewData({ status: '', notes: '' })
        setSelectedPayment(null)
        fetchPayments() // Refresh data
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to update payment status',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'error'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-gray-500', label: 'Pending', icon: Clock },
      submitted: { color: 'bg-blue-500', label: 'Submitted', icon: FileImage },
      under_review: { color: 'bg-yellow-500', label: 'Under Review', icon: Eye },
      verified: { color: 'bg-green-500', label: 'Verified', icon: CheckCircle },
      rejected: { color: 'bg-red-500', label: 'Rejected', icon: XCircle },
      refunded: { color: 'bg-purple-500', label: 'Refunded', icon: CreditCard }
    }
    
    const statusConfig = config[status as keyof typeof config] || { color: 'bg-gray-500', label: status, icon: Clock }
    const IconComponent = statusConfig.icon
    
    return (
      <Badge className={`${statusConfig.color} text-white flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    )
  }

  const getPaymentTypeLabel = (type: string) => {
    const labels = {
      'promotion_fee': 'Promotion Fee',
      'listing_fee': 'Listing Fee', 
      'featured_listing': 'Featured Listing',
      'application_fee': 'Application Fee',
      'premium_placement': 'Premium Placement',
      'service_payment': 'Service Payment'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getChainBadge = (chain: string) => {
    const colors = {
      'btc': 'bg-orange-500',
      'eth': 'bg-blue-600',
      'usdt_erc20': 'bg-green-600',
      'usdt_trc20': 'bg-green-500'
    }
    return (
      <Badge className={`${colors[chain as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {chain.toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !filters.search || 
      payment.user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.payment.txHash?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || payment.status === filters.status
    const matchesPaymentType = filters.paymentType === 'all' || payment.paymentType === filters.paymentType
    const matchesItemType = filters.itemType === 'all' || payment.itemType === filters.itemType
    const matchesChain = filters.chain === 'all' || payment.pricing.chain === filters.chain
    
    return matchesSearch && matchesStatus && matchesPaymentType && matchesItemType && matchesChain
  })

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Payment Administration</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and verify payments across the platform
          </p>
        </div>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-xs text-green-600">{stats.verifiedPayments} verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-xs text-orange-600">Awaiting verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xs text-green-600">All verified payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-xs text-purple-600">Last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.paymentType} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, paymentType: value }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="promotion_fee">Promotion Fee</SelectItem>
                <SelectItem value="featured_listing">Featured Listing</SelectItem>
                <SelectItem value="listing_fee">Listing Fee</SelectItem>
                <SelectItem value="application_fee">Application Fee</SelectItem>
                <SelectItem value="service_payment">Service Payment</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.chain} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, chain: value }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="btc">Bitcoin</SelectItem>
                <SelectItem value="eth">Ethereum</SelectItem>
                <SelectItem value="usdt_erc20">USDT (ERC20)</SelectItem>
                <SelectItem value="usdt_trc20">USDT (TRC20)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">
                        {payment.user.firstName} {payment.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{payment.user.email}</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">#{payment.paymentId}</p>
                      <p className="text-muted-foreground">{getPaymentTypeLabel(payment.paymentType)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        {formatCurrency(payment.pricing.amount, payment.pricing.currency)}
                      </span>
                    </div>
                    {getChainBadge(payment.pricing.chain)}
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>

                  {payment.pricing.description && (
                    <p className="text-sm text-muted-foreground">{payment.pricing.description}</p>
                  )}

                  {payment.paymentType === 'service_payment' && payment.metadata?.serviceDetails && (
                    <div className="text-sm space-y-1 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="font-medium text-blue-900">Service Payment Details:</p>
                      {payment.metadata.serviceDetails.listingTitle && (
                        <p><span className="font-medium">For:</span> {payment.metadata.serviceDetails.listingTitle}</p>
                      )}
                      {payment.metadata.serviceDetails.ownerName && (
                        <p><span className="font-medium">Service Provider:</span> {payment.metadata.serviceDetails.ownerName}</p>
                      )}
                      {payment.metadata.serviceDetails.customAmount && (
                        <p><span className="font-medium">Custom Amount:</span> {formatCurrency(payment.metadata.serviceDetails.customAmount)}</p>
                      )}
                    </div>
                  )}

                  {payment.payment.txHash && (
                    <div className="text-sm">
                      <span className="font-medium">TX Hash: </span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {payment.payment.txHash.substring(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    {getStatusBadge(payment.status)}
                    {payment.payment.verifiedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Verified {formatDate(payment.payment.verifiedAt)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {payment.payment.screenshotUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.payment.screenshotUrl, '_blank')}
                      >
                        <FileImage className="h-4 w-4 mr-1" />
                        View Proof
                      </Button>
                    )}
                    
                    <Dialog open={reviewDialog && selectedPayment?._id === payment._id} 
                            onOpenChange={(open) => {
                              setReviewDialog(open)
                              if (open) {
                                setSelectedPayment(payment)
                                setReviewData({ status: payment.status, notes: '' })
                              }
                            }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Review Payment #{payment.paymentId}</DialogTitle>
                          <DialogDescription>
                            Update the payment status and add review notes
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="font-medium">User</Label>
                              <p>{payment.user.firstName} {payment.user.lastName}</p>
                              <p className="text-muted-foreground">{payment.user.email}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Amount</Label>
                              <p>{formatCurrency(payment.pricing.amount, payment.pricing.currency)}</p>
                              <p className="text-muted-foreground">{payment.pricing.chain.toUpperCase()}</p>
                            </div>
                          </div>

                          {payment.paymentType === 'service_payment' && payment.metadata?.serviceDetails && (
                            <div className="bg-blue-50 p-4 rounded border">
                              <Label className="font-medium text-blue-900">Service Payment Details</Label>
                              <div className="mt-2 space-y-2 text-sm">
                                {payment.metadata.serviceDetails.listingTitle && (
                                  <div>
                                    <span className="font-medium">Service/Listing:</span> {payment.metadata.serviceDetails.listingTitle}
                                  </div>
                                )}
                                {payment.metadata.serviceDetails.listingCategory && (
                                  <div>
                                    <span className="font-medium">Category:</span> {payment.metadata.serviceDetails.listingCategory}
                                  </div>
                                )}
                                {payment.metadata.serviceDetails.ownerName && (
                                  <div>
                                    <span className="font-medium">Service Provider:</span> {payment.metadata.serviceDetails.ownerName}
                                  </div>
                                )}
                                {payment.metadata.serviceDetails.ownerContact && (
                                  <div>
                                    <span className="font-medium">Provider Contact:</span> {payment.metadata.serviceDetails.ownerContact}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {payment.payment.txHash && (
                            <div>
                              <Label className="font-medium">Transaction Hash</Label>
                              <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                                {payment.payment.txHash}
                              </p>
                            </div>
                          )}

                          {payment.payment.screenshotUrl && (
                            <div>
                              <Label className="font-medium">Payment Proof</Label>
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  onClick={() => window.open(payment.payment.screenshotUrl, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Screenshot
                                </Button>
                              </div>
                            </div>
                          )}

                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={reviewData.status} onValueChange={(value) => setReviewData(prev => ({ ...prev, status: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="notes">Review Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add notes about this review..."
                              value={reviewData.notes}
                              onChange={(e) => setReviewData(prev => ({ ...prev, notes: e.target.value }))}
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setReviewDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleStatusUpdate} disabled={!reviewData.status}>
                            Update Status
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
              <p className="text-muted-foreground mb-4">
                No payments match your current filters.
              </p>
              <Button onClick={() => setFilters({ search: '', status: 'all', paymentType: 'all', itemType: 'all', chain: 'all' })}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}