'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search, Filter, Download, UserCheck, UserX, Users, Mail, 
  TrendingUp, Calendar, RefreshCw, Eye, Trash2, MoreHorizontal
} from "lucide-react"
import { useToast } from '@/components/ui/toast'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Subscriber {
  _id: string
  email: string
  status: 'active' | 'unsubscribed' | 'bounced'
  source: 'homepage' | 'search_page' | 'listing_page' | 'manual'
  subscribedAt: string
  unsubscribedAt?: string
  preferences: {
    newsletter: boolean
    updates: boolean
    promotions: boolean
  }
  daysSinceSubscription: number
}

interface SubscriberStats {
  total: number
  thisMonth: number
  active: number
  unsubscribed: number
  bounced: number
}

export default function AdminSubscribersPage() {
  const { toast } = useToast()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<SubscriberStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    source: 'all'
  })
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchSubscribers()
  }, [filters, pagination.page])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.source !== 'all' && { source: filters.source })
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers/admin/subscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.data.subscribers || [])
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        }))
        setStats(data.data.stats)
      } else {
        throw new Error('Failed to fetch subscribers')
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load subscribers',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (subscriberId: string, newStatus: string) => {
    setActionLoading(subscriberId)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers/admin/${subscriberId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Subscriber status updated to ${newStatus}`,
          variant: 'success'
        })
        fetchSubscribers() // Refresh data
      } else {
        throw new Error(`Failed to update status`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update subscriber status',
        variant: 'error'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to delete this subscriber? This action cannot be undone.')) {
      return
    }

    setActionLoading(subscriberId)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers/admin/${subscriberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Subscriber deleted successfully',
          variant: 'success'
        })
        fetchSubscribers() // Refresh data
      } else {
        throw new Error('Failed to delete subscriber')
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber',
        variant: 'error'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const token = localStorage.getItem('authToken')
      const params = new URLSearchParams({
        format,
        ...(filters.status !== 'all' && { status: filters.status })
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers/admin/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `subscribers-${Date.now()}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          const data = await response.json()
          const dataStr = JSON.stringify(data, null, 2)
          const blob = new Blob([dataStr], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `subscribers-${Date.now()}.json`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
        
        toast({
          title: 'Success',
          description: `Subscribers exported as ${format.toUpperCase()}`,
          variant: 'success'
        })
      } else {
        throw new Error('Failed to export subscribers')
      }
    } catch (error) {
      console.error('Error exporting subscribers:', error)
      toast({
        title: 'Error',
        description: 'Failed to export subscribers',
        variant: 'error'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: 'bg-green-500', label: 'Active', icon: UserCheck },
      unsubscribed: { color: 'bg-gray-500', label: 'Unsubscribed', icon: UserX },
      bounced: { color: 'bg-red-500', label: 'Bounced', icon: Mail }
    }
    
    const statusConfig = config[status as keyof typeof config] || { color: 'bg-gray-500', label: status, icon: Users }
    const IconComponent = statusConfig.icon
    
    return (
      <Badge className={`${statusConfig.color} text-white flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && subscribers.length === 0) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">
            Manage your newsletter subscribers and view analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSubscribers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.unsubscribed}</p>
                  <p className="text-sm text-muted-foreground">Unsubscribed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.bounced}</p>
                  <p className="text-sm text-muted-foreground">Bounced</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
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
                  placeholder="Search by email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="homepage">Homepage</SelectItem>
                <SelectItem value="search_page">Search Page</SelectItem>
                <SelectItem value="listing_page">Listing Page</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <div className="space-y-4">
        {subscribers.map((subscriber) => (
          <Card key={subscriber._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{subscriber.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        Subscribed {formatDate(subscriber.subscribedAt)} • {subscriber.daysSinceSubscription} days ago
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {subscriber.source.replace('_', ' ')}
                      </Badge>
                      {getStatusBadge(subscriber.status)}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Newsletter: {subscriber.preferences.newsletter ? '✓' : '✗'}</span>
                    <span>Updates: {subscriber.preferences.updates ? '✓' : '✗'}</span>
                    <span>Promotions: {subscriber.preferences.promotions ? '✓' : '✗'}</span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={actionLoading === subscriber._id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {subscriber.status === 'active' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(subscriber._id, 'unsubscribed')}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Unsubscribe
                      </DropdownMenuItem>
                    )}
                    {subscriber.status === 'unsubscribed' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(subscriber._id, 'active')}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Resubscribe
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(subscriber._id, 'bounced')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Mark as Bounced
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(subscriber._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {subscribers.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Subscribers Found</h3>
              <p className="text-muted-foreground mb-4">
                No subscribers match your current filters.
              </p>
              <Button onClick={() => setFilters({ search: '', status: 'all', source: 'all' })}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}