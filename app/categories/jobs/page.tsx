'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Search, Eye, Calendar, Briefcase, Building2 } from "lucide-react"
import { categoriesApi } from "@/lib/api"
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

interface JobListing {
  _id: string
  id: string
  title: string
  description: string
  company?: {
    name: string
    logo?: string
  }
  location?: {
    city: string
    area?: string
  }
  jobType?: string
  workLocation?: string
  salary?: {
    min: number
    max: number
    currency: string
    frequency: string
  }
  applicationDeadline?: string
  featured: boolean
  createdAt: string
  views?: number
  applicationsCount?: number
}

export default function JobsPage() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobType, setSelectedJobType] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  const jobTypes = [
    'all',
    'full-time',
    'part-time',
    'contract',
    'internship',
    'temporary',
    'remote'
  ]

  const locations = [
    'all',
    'nicosia',
    'kyrenia',
    'famagusta',
    'morphou',
    'iskele',
    'lefke'
  ]

  useEffect(() => {
    fetchJobs()
  }, [pagination.page, selectedJobType, selectedLocation, sortBy])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy
      }

      if (selectedLocation !== 'all') {
        params.city = selectedLocation
      }

      if (selectedJobType !== 'all') {
        params.jobType = selectedJobType
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const response = await categoriesApi.getJobs(params)

      if (response.success && response.data) {
        const jobListings = Array.isArray(response.data) ? response.data : [response.data]

        const formattedJobs = jobListings.map((job: any) => ({
          _id: job._id || job.id,
          id: job.id || job._id,
          title: job.title,
          description: job.description,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          workLocation: job.workLocation,
          salary: job.salary,
          applicationDeadline: job.applicationDeadline,
          featured: job.featured || false,
          createdAt: job.createdAt || job.created_at,
          views: job.views,
          applicationsCount: job.applicationsCount
        }))

        setJobs(formattedJobs)
        setPagination(prev => ({
          ...prev,
          total: (response as any)?.pagination?.totalItems || formattedJobs.length,
          pages: Math.ceil(((response as any)?.pagination?.totalItems || formattedJobs.length) / prev.limit)
        }))
      } else {
        setJobs([])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again.',
        variant: 'error'
      })
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchJobs()
  }

  const formatSalary = (salary?: any) => {
    if (!salary) return 'Salary not specified'
    const { min, max, currency = 'USD', frequency = 'month' } = salary

    if (min && max && min !== max) {
      return `${currency === 'USD' ? '$' : currency}${min.toLocaleString()} - ${currency === 'USD' ? '$' : currency}${max.toLocaleString()}/${frequency}`
    } else if (min || max) {
      const amount = min || max
      return `${currency === 'USD' ? '$' : currency}${amount.toLocaleString()}/${frequency}`
    }

    return 'Salary not specified'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryDisplayName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const isDeadlineClose = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  return (
    <div className="min-h-screen bg-gradient-teal py-8">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 py-16 mb-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <Briefcase className="h-12 w-12 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">Jobs & Opportunities</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Find your dream job and build your career in North Cyprus
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-8 mb-12">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-10"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  {jobTypes.slice(1).map(type => (
                    <SelectItem key={type} value={type}>
                      {getCategoryDisplayName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.slice(1).map(location => (
                    <SelectItem key={location} value={location}>
                      {getCategoryDisplayName(location)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="salary_high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary_low">Salary: Low to High</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 mb-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse border-gray-200/50 shadow-sm">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24" />
                      <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-20" />
                    </div>
                  </div>
                  <CardHeader className="p-6">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-3" />
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-3 w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2" />
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && jobs.length > 0 && (
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card key={job._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Link href={`/jobs/${job._id}`}>
                    {/* Header section with no image */}
                    <div className="relative p-6 bg-gradient-to-r from-blue-50 to-green-50 border-b">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          <Badge variant="secondary" className="text-xs">
                            {job.jobType ? getCategoryDisplayName(job.jobType) : 'Job Opportunity'}
                          </Badge>
                        </div>

                        {job.featured && (
                          <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Application deadline warning */}
                      {job.applicationDeadline && isDeadlineClose(job.applicationDeadline) && (
                        <div className="mb-3">
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Deadline Soon: {formatDate(job.applicationDeadline)}
                          </Badge>
                        </div>
                      )}

                      {/* Work location */}
                      {job.workLocation && (
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{getCategoryDisplayName(job.workLocation)}</Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="p-6">
                      <CardTitle className="line-clamp-2 text-lg leading-tight">{job.title}</CardTitle>
                      {job.company && (
                        <div className="text-sm font-medium text-primary flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          {job.company.name}
                        </div>
                      )}
                      {job.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {job.location.city}
                          {job.location.area && `, ${job.location.area}`}
                        </div>
                      )}
                      <CardDescription className="line-clamp-3 leading-relaxed">
                        {job.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formatDate(job.createdAt)}
                          </div>
                          {job.views && (
                            <div className="flex items-center text-muted-foreground">
                              <Eye className="mr-2 h-4 w-4" />
                              {job.views}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm font-medium text-green-600">
                            <DollarSign className="mr-1 h-4 w-4" />
                            <span className="line-clamp-1">{formatSalary(job.salary)}</span>
                          </div>
                          {job.applicationsCount && (
                            <div className="text-xs text-muted-foreground">
                              {job.applicationsCount} applications
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <Button className="w-full h-11">View Details & Apply</Button>
                    </CardFooter>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && jobs.length === 0 && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-16 text-center">
            <Briefcase className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No Jobs Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Try adjusting your search terms or filters to find job opportunities.
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedJobType('all')
              setSelectedLocation('all')
              setSortBy('newest')
            }} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700" size="lg">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && jobs.length > 0 && pagination.pages > 1 && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 mt-12">
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="border-gray-300 hover:bg-gray-50 h-11 px-6"
              >
                Previous
              </Button>

              <span className="flex items-center px-6 text-sm text-muted-foreground bg-white/70 rounded-lg">
                Page {pagination.page} of {pagination.pages}
              </span>

              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="border-gray-300 hover:bg-gray-50 h-11 px-6"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
