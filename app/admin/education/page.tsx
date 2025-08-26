'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Users, GraduationCap,
  FileText, Clock, CheckCircle, XCircle, Building, MapPin,
  Calendar, DollarSign, Star, BarChart3, TrendingUp, RefreshCw
} from "lucide-react"
import Link from 'next/link'

interface Program {
  _id: string
  title: string
  institution: { name: string }
  level: string
  fieldOfStudy: string
  location: { city: string }
  tuition: { amount: number; currency: string; period: string }
  featured: boolean
  status: 'active' | 'inactive' | 'pending'
  viewCount: number
  applicationCount: number
  createdAt: string
}

interface Application {
  _id: string
  applicationId: string
  programId: { title: string; institution: { name: string } }
  personalInfo: { firstName: string; lastName: string; email: string }
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedAt: string
}

interface AdminStats {
  totalPrograms: number
  activePrograms: number
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  monthlyApplications: number
  monthlyViews: number
}

export default function AdminEducationPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [programFilters, setProgramFilters] = useState({
    search: '',
    status: 'all',
    level: 'all',
    featured: 'all'
  })
  const [applicationFilters, setApplicationFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'newest'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [programsRes, applicationsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/education/programs`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/education/applications`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/education/stats`, { headers })
      ])

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData.programs || [])
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData.applications || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProgramAction = async (programId: string, action: 'feature' | 'unfeature' | 'activate' | 'deactivate' | 'delete') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/education/programs/${programId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error performing program action:', error)
    }
  }

  const handleApplicationAction = async (applicationId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/education/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status, notes })
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = !programFilters.search || 
      program.title.toLowerCase().includes(programFilters.search.toLowerCase()) ||
      program.institution.name.toLowerCase().includes(programFilters.search.toLowerCase())
    const matchesStatus = programFilters.status === 'all' || program.status === programFilters.status
    const matchesLevel = programFilters.level === 'all' || program.level === programFilters.level
    const matchesFeatured = programFilters.featured === 'all' || 
      (programFilters.featured === 'featured' && program.featured) ||
      (programFilters.featured === 'not-featured' && !program.featured)
    
    return matchesSearch && matchesStatus && matchesLevel && matchesFeatured
  })

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = !applicationFilters.search ||
        app.personalInfo.firstName.toLowerCase().includes(applicationFilters.search.toLowerCase()) ||
        app.personalInfo.lastName.toLowerCase().includes(applicationFilters.search.toLowerCase()) ||
        app.personalInfo.email.toLowerCase().includes(applicationFilters.search.toLowerCase()) ||
        app.programId.title.toLowerCase().includes(applicationFilters.search.toLowerCase())
      const matchesStatus = applicationFilters.status === 'all' || app.status === applicationFilters.status
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (applicationFilters.sortBy) {
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        case 'name':
          return `${a.personalInfo.firstName} ${a.personalInfo.lastName}`.localeCompare(
            `${b.personalInfo.firstName} ${b.personalInfo.lastName}`
          )
        default:
          return 0
      }
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: 'bg-green-500', label: 'Active' },
      inactive: { color: 'bg-gray-500', label: 'Inactive' },
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      submitted: { color: 'bg-blue-500', label: 'Submitted' },
      under_review: { color: 'bg-yellow-500', label: 'Under Review' },
      approved: { color: 'bg-green-500', label: 'Approved' },
      rejected: { color: 'bg-red-500', label: 'Rejected' }
    }
    
    const statusConfig = config[status as keyof typeof config] || { color: 'bg-gray-500', label: status }
    
    return (
      <Badge className={`${statusConfig.color} text-white`}>
        {statusConfig.label}
      </Badge>
    )
  }

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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Education Administration</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage educational programs and applications
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <Button onClick={fetchData} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/education/programs/new" className="w-full sm:w-auto">
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPrograms}</p>
                  <p className="text-sm text-muted-foreground">Total Programs</p>
                  <p className="text-xs text-green-600">{stats.activePrograms} active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-xs text-blue-600">{stats.pendingApplications} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.monthlyApplications}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-xs text-purple-600">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{(stats.approvedApplications / stats.totalApplications * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                  <p className="text-xs text-orange-600">{stats.approvedApplications} approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="programs" className="w-full">
        <TabsList>
          <TabsTrigger value="programs">Programs ({programs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          {/* Program Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search programs..."
                      value={programFilters.search}
                      onChange={(e) => setProgramFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select 
                  value={programFilters.status} 
                  onValueChange={(value) => setProgramFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={programFilters.level} 
                  onValueChange={(value) => setProgramFilters(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={programFilters.featured} 
                  onValueChange={(value) => setProgramFilters(prev => ({ ...prev, featured: value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Featured status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="featured">Featured Only</SelectItem>
                    <SelectItem value="not-featured">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Programs List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPrograms.map((program) => (
              <Card key={program._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-lg">
                        {program.title}
                        {program.featured && (
                          <Star className="h-4 w-4 text-amber-500 inline ml-2" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {program.institution.name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(program.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{program.level.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      <span>{program.location.city}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      <span>
                        {program.tuition.currency === 'USD' ? '$' : program.tuition.currency}
                        {program.tuition.amount.toLocaleString()}/{program.tuition.period}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{program.applicationCount} applications</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      {program.viewCount} views • Created {formatDate(program.createdAt)}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/admin/education/programs/${program._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/education/programs/${program._id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProgramAction(program._id, program.featured ? 'unfeature' : 'feature')}
                      >
                        <Star className={`h-4 w-4 ${program.featured ? 'text-amber-500' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProgramAction(program._id, program.status === 'active' ? 'deactivate' : 'activate')}
                      >
                        {program.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Programs Found</h3>
                <p className="text-muted-foreground mb-4">
                  No programs match your current filters.
                </p>
                <Button onClick={() => setProgramFilters({ search: '', status: 'all', level: 'all', featured: 'all' })}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {/* Application Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      value={applicationFilters.search}
                      onChange={(e) => setApplicationFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select 
                  value={applicationFilters.status} 
                  onValueChange={(value) => setApplicationFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={applicationFilters.sortBy} 
                  onValueChange={(value) => setApplicationFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">By Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <div className="space-y-4">
            {!!filteredApplications && filteredApplications.map((application) => (
              <Card key={application._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">
                            {application.personalInfo.firstName} {application.personalInfo.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{application.personalInfo.email}</p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">
                            {application.programId?.title || 'Program Title N/A'}
                          </p>
                          <p className="text-muted-foreground">
                            {application.programId?.institution?.name || 'Institution N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Submitted</p>
                        <p>{formatDate(application.submittedAt)}</p>
                      </div>
                      
                      {getStatusBadge(application.status)}
                      
                      <div className="flex space-x-2">
                        <Link href={`/admin/education/applications/${application._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </Link>
                        
                        {application.status === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApplicationAction(application._id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApplicationAction(application._id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground mb-4">
                  No applications match your current filters.
                </p>
                <Button onClick={() => setApplicationFilters({ search: '', status: 'all', sortBy: 'newest' })}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 
