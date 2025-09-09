'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, Clock, FileText, GraduationCap, MapPin, Search, 
  Filter, Eye, Download, Edit, Trash2, AlertCircle, CheckCircle,
  XCircle, RefreshCw, Plus, ArrowRight, School, Building
} from "lucide-react"
import Link from 'next/link'

interface Application {
  _id: string
  applicationId: string
  programId: {
    _id: string
    title: string
    institution: { name: string }
    level: string
    location: { city: string }
  }
  personalInfo: {
    firstName: string
    lastName: string
    email: string
  }
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  timeline: Array<{
    status: string
    timestamp: string
    notes?: string
  }>
  submittedAt?: string
  reviewedAt?: string
  documents: {
    [key: string]: {
      uploaded: boolean
      verified: boolean
      filename?: string
    }
  }
  applicationFee?: {
    amount: number
    currency: string
    paid: boolean
    paymentDate?: string
  }
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG = {
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-500', 
    icon: Edit,
    description: 'Application in progress'
  },
  submitted: { 
    label: 'Submitted', 
    color: 'bg-blue-500', 
    icon: FileText,
    description: 'Under initial review'
  },
  under_review: { 
    label: 'Under Review', 
    color: 'bg-yellow-500', 
    icon: Clock,
    description: 'Being evaluated by admissions'
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-500', 
    icon: CheckCircle,
    description: 'Congratulations! You have been accepted'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-500', 
    icon: XCircle,
    description: 'Application was not successful'
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/education/applications/my-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.programId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.programId.institution.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === '' || app.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        case 'program':
          return a.programId.title.localeCompare(b.programId.title)
        default:
          return 0
      }
    })

  const getStatusInfo = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDocumentCompleteness = (documents: Application['documents']) => {
    const totalDocs = Object.keys(documents).length
    const uploadedDocs = Object.values(documents).filter(doc => doc.uploaded).length
    return { uploaded: uploadedDocs, total: totalDocs }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your educational program applications
          </p>
        </div>
        <Link href="/categories/education">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Applications</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Under Review</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {applications.filter(app => app.status === 'under_review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Approved</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {applications.filter(app => app.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Drafts</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {applications.filter(app => app.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by program or institution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                  <SelectItem value="program">By Program</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchApplications} className="text-sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
            <p className="text-muted-foreground mb-4">
              {applications.length === 0 
                ? "You haven't submitted any applications yet." 
                : "No applications match your current filters."
              }
            </p>
            {applications.length === 0 && (
              <Link href="/categories/education">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Your First Application
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredApplications.map((application) => {
            const statusInfo = getStatusInfo(application.status)
            const StatusIcon = statusInfo.icon
            const docStats = getDocumentCompleteness(application.documents)
            
            return (
              <Card key={application._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 text-base sm:text-lg">
                        {application.programId.title}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1 text-sm">
                        <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{application.programId.institution.name}</span>
                      </CardDescription>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{application.programId.location.city}</span>
                      </div>
                    </div>
                    <Badge className={`${statusInfo.color} text-white text-xs flex-shrink-0`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{statusInfo.label}</span>
                      <span className="sm:hidden">{statusInfo.label.charAt(0)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4">
                  {/* Application Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Application ID:</span>
                      <span className="font-mono text-xs">{application.applicationId}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>
                        {application.submittedAt 
                          ? formatDate(application.submittedAt)
                          : 'Not submitted'
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Documents:</span>
                      <span className={docStats.uploaded === docStats.total ? 'text-green-600' : 'text-amber-600'}>
                        {docStats.uploaded}/{docStats.total} uploaded
                      </span>
                    </div>
                  </div>

                  {/* Status Description */}
                  <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs sm:text-sm">{statusInfo.description}</p>
                  </div>

                  {/* Fee Status */}
                  {application.applicationFee && (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Application Fee:</span>
                      <Badge variant={application.applicationFee.paid ? "default" : "destructive"} className="text-xs">
                        {application.applicationFee.paid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Link href={`/dashboard/applications/${application._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </Link>
                    
                    {application.status === 'draft' && (
                      <Link href={`/categories/education/${application.programId._id}/apply?edit=${application._id}`} className="flex-1">
                        <Button size="sm" className="w-full text-xs sm:text-sm">
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Continue</span>
                          <span className="sm:hidden">Edit</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 
