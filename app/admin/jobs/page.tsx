'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  Building, 
  MapPin,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Trash2
} from 'lucide-react'

interface Job {
  id: string
  title: string
  role: string
  description: string
  company?: {
    name?: string
  }
  location?: {
    city?: string
    country?: string
    remote?: boolean
    hybrid?: boolean
  }
  salary?: {
    min?: number
    max?: number
    currency?: string
    frequency?: string
    negotiable?: boolean
  }
  jobType: string
  workLocation: string
  status: string
  moderationStatus: string
  createdAt: string
  updatedAt: string
  applicationCount: number
  views: number
  moderatedBy?: {
    _id: string
    username?: string
    firstName?: string
    lastName?: string
  } | null
  moderationNotes?: string
  postedBy?: {
    _id: string
    username?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
}

interface JobStats {
  total: number
  pending: number
  approved: number
  rejected: number
  expired: number
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | null>(null)
  const [moderationNotes, setModerationNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchStats()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/jobs`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        console.log('Jobs API response:', result) // Debug log
        
        // Ensure we have valid job data
        const jobsData = result.success ? (result.data || []) : []
        
        // Validate and clean job data
        const validJobs = jobsData.filter((job: any) => job && job.id && job.title)
        
        setJobs(validJobs)
      } else {
        console.error('Failed to fetch jobs, status:', response.status)
        toast.error(`Failed to fetch jobs (${response.status})`)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/jobs/stats/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        const statsData = result.success ? result.data : {}
        setStats({
          total: statsData.overview?.total || 0,
          pending: statsData.overview?.pending || 0,
          approved: statsData.overview?.approved || 0,
          rejected: statsData.overview?.rejected || 0,
          expired: statsData.overview?.filled || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleModeration = async (jobId: string, action: 'approve' | 'reject', notes?: string) => {
    setSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/jobs/${jobId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          moderationStatus: action === 'approve' ? 'approved' : 'rejected',
          moderationNotes: notes || ''
        })
      })

      if (response.ok) {
        toast.success(`Job ${action}d successfully`)
        await fetchJobs()
        await fetchStats()
        setSelectedJob(null)
        setModerationAction(null)
        setModerationNotes('')
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to ${action} job`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} job`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        toast.success('Job deleted successfully')
        await fetchJobs()
        await fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete job')
      }
    } catch (error) {
      toast.error('Failed to delete job')
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (!job) return false
    
    const matchesSearch = 
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || job.moderationStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatSalary = (job: Job) => {
    if (!job.salary) {
      return 'Not disclosed'
    }
    
    const { min, max, currency, frequency, negotiable } = job.salary
    
    if (negotiable && !min && !max) {
      return 'Negotiable'
    }
    
    const currencySymbol = currency || '$'
    
    if (min && max) {
      return `${currencySymbol}${min?.toLocaleString()} - ${currencySymbol}${max?.toLocaleString()}`
    } else if (min) {
      return `From ${currencySymbol}${min?.toLocaleString()}`
    } else if (max) {
      return `Up to ${currencySymbol}${max?.toLocaleString()}`
    }
    
    return 'Not disclosed'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Management</h1>
        <p className="text-muted-foreground">Manage and moderate job listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Jobs</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
          <CardDescription>
            {statusFilter === 'all' ? 'All jobs' : `Jobs with status: ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.role}</div>
                      <div className="text-xs text-muted-foreground">
                        Posted by: {job.postedBy ? 
                          `${job.postedBy.firstName || ''} ${job.postedBy.lastName || ''}`.trim() || 
                          job.postedBy.username || 
                          job.postedBy.email || 
                          'Unknown User'
                          : 'Unknown User'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {job.company?.name || 'Unknown Company'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div>{job.location?.city || 'Unknown'}, {job.location?.country || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.workLocation || 'Not specified'}
                          {job.location?.remote && ' • Remote'}
                          {job.location?.hybrid && ' • Hybrid'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">{formatSalary(job)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job.moderationStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(job.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {job.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applicationCount}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Job Details</DialogTitle>
                            <DialogDescription>
                              Review and moderate this job listing
                            </DialogDescription>
                          </DialogHeader>
                          {selectedJob && (
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold">{selectedJob.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.role} at {selectedJob.company?.name || 'Unknown Company'}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Location:</strong> {selectedJob.location?.city || 'Unknown'}, {selectedJob.location?.country || 'Unknown'}
                                </div>
                                <div>
                                  <strong>Job Type:</strong> {selectedJob.jobType || 'Not specified'}
                                </div>
                                <div>
                                  <strong>Work Location:</strong> {selectedJob.workLocation || 'Not specified'}
                                </div>
                                <div>
                                  <strong>Status:</strong> {selectedJob.moderationStatus || 'Unknown'}
                                </div>
                              </div>

                              {selectedJob.moderationNotes && (
                                <div>
                                  <strong>Previous Notes:</strong>
                                  <p className="text-sm text-muted-foreground mt-1">{selectedJob.moderationNotes}</p>
                                </div>
                              )}

                              {selectedJob.moderationStatus === 'pending' && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="notes">Moderation Notes</Label>
                                    <Textarea
                                      id="notes"
                                      value={moderationNotes}
                                      onChange={(e) => setModerationNotes(e.target.value)}
                                      placeholder="Add notes about your decision..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleModeration(selectedJob.id, 'approve', moderationNotes)}
                                      disabled={submitting}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleModeration(selectedJob.id, 'reject', moderationNotes)}
                                      disabled={submitting}
                                      variant="destructive"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {job.moderationStatus === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleModeration(job.id, 'approve')}
                            disabled={submitting}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleModeration(job.id, 'reject')}
                            disabled={submitting}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredJobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No jobs found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
