'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, Eye, CheckCircle, XCircle, Clock, AlertCircle,
  DollarSign, CreditCard, Wallet, ArrowRight
} from "lucide-react"
import { useToast } from '@/components/ui/toast'

interface Payment {
  _id: string
  paymentId: string
  itemType: 'promotion' | 'listing' | 'property' | 'education_application' | 'featured_listing'
  paymentType: 'promotion_fee' | 'listing_fee' | 'featured_listing' | 'application_fee' | 'premium_placement' | 'service_payment'
  status: 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected' | 'refunded'
  pricing: {
    amount: number
    currency: string
    chain: string
    description: string
  }
  metadata: {
    serviceDetails?: {
      listingTitle?: string
      ownerName?: string
    }
  }
  itemReference?: any
  createdAt: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    paymentType: 'all'
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const params = new URLSearchParams()
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.paymentType !== 'all') params.set('paymentType', filters.paymentType)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/me?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.data || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load payments',
          variant: 'error'
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

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-gray-500', label: 'Pending', icon: Clock },
      submitted: { color: 'bg-blue-500', label: 'Submitted', icon: Eye },
      under_review: { color: 'bg-yellow-500', label: 'Under Review', icon: AlertCircle },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      payment.paymentId.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.pricing.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.metadata?.serviceDetails?.listingTitle?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || payment.status === filters.status
    const matchesPaymentType = filters.paymentType === 'all' || payment.paymentType === filters.paymentType
    
    return matchesSearch && matchesStatus && matchesPaymentType
  })

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-soft py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">My Payments</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              View and manage your payment transactions
            </p>
          </div>
          <Button onClick={fetchPayments} variant="outline" size="sm" className="self-start sm:self-center">
            Refresh
          </Button>
        </div>

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
                <SelectItem value="service_payment">Service Payment</SelectItem>
                <SelectItem value="promotion_fee">Promotion Fee</SelectItem>
                <SelectItem value="featured_listing">Featured Listing</SelectItem>
                <SelectItem value="listing_fee">Listing Fee</SelectItem>
                <SelectItem value="application_fee">Application Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment._id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">#{payment.paymentId}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentTypeLabel(payment.paymentType)}
                      </p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        {formatCurrency(payment.pricing.amount, payment.pricing.currency)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {payment.pricing.chain.toUpperCase()}
                    </Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>

                  {payment.pricing.description && (
                    <p className="text-sm text-muted-foreground">{payment.pricing.description}</p>
                  )}

                  {payment.paymentType === 'service_payment' && payment.metadata?.serviceDetails && (
                    <div className="text-sm bg-blue-50 p-2 rounded">
                      <span className="font-medium">Service:</span> {payment.metadata.serviceDetails.listingTitle}
                      {payment.metadata.serviceDetails.ownerName && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium">Provider:</span> {payment.metadata.serviceDetails.ownerName}
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/payments/${payment._id}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
                {payments.length === 0 
                  ? "You haven't made any payments yet." 
                  : "No payments match your current filters."
                }
              </p>
              {payments.length > 0 && (
                <Button onClick={() => setFilters({ search: '', status: 'all', paymentType: 'all' })}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}