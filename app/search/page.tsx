'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Filter, MapPin, Calendar, Eye, Heart, 
  Building, Briefcase, GraduationCap, Settings, Star
} from "lucide-react"
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import NotificationSection from '@/components/notification-section'

interface SearchResult {
  _id: string
  title: string
  description: string
  category: string
  type: 'listing' | 'job' | 'education' | 'service'
  price?: number
  currency?: string
  location?: {
    city: string
    area?: string
  }
  images?: string[]
  featured: boolean
  createdAt: string
  owner?: {
    firstName: string
    lastName: string
    username: string
  }
  institution?: {
    name: string
  }
  company?: {
    name: string
  }
  views?: number
  rating?: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [location, setLocation] = useState(searchParams.get('location') || 'all')
  const [sortBy, setSortBy] = useState('relevance')
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    performSearch()
  }, [searchParams, pagination.page, sortBy])

  const performSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(category !== 'all' && { category }),
        ...(location !== 'all' && { location }),
        ...(sortBy !== 'relevance' && { sortBy })
      })

      console.log('🔍 Performing search with params:', Object.fromEntries(params.entries()))

      // Search across multiple endpoints
      const [listingsRes, jobsRes, educationRes] = await Promise.all([
        // Search listings
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings?${params}&limit=8`).catch(() => ({ ok: false })),
        // Search jobs
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?${params}&limit=6`).catch(() => ({ ok: false })),
        // Search education programs  
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/education?${params}&limit=6`).catch(() => ({ ok: false }))
      ])

      const searchResults: SearchResult[] = []

      // Process listings results
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        if (listingsData.success && listingsData.data) {
          const listings = Array.isArray(listingsData.data) ? listingsData.data : [listingsData.data]
          listings.forEach((listing: any) => {
            searchResults.push({
              _id: listing._id,
              title: listing.title,
              description: listing.description,
              category: listing.category,
              type: 'listing',
              price: listing.price,
              currency: listing.currency,
              location: listing.location,
              images: listing.images,
              featured: listing.featured,
              createdAt: listing.createdAt,
              owner: listing.owner,
              views: listing.views
            })
          })
        }
      }

      // Process jobs results
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        if (jobsData.success && jobsData.data) {
          const jobs = Array.isArray(jobsData.data) ? jobsData.data : [jobsData.data]
          jobs.forEach((job: any) => {
            searchResults.push({
              _id: job._id,
              title: job.title,
              description: job.description,
              category: 'jobs',
              type: 'job',
              location: job.location,
              images: job.images,
              featured: job.featured || false,
              createdAt: job.createdAt,
              company: job.company,
              views: job.views
            })
          })
        }
      }

      // Process education results
      if (educationRes.ok) {
        const educationData = await educationRes.json()
        if (educationData.success && educationData.data) {
          const programs = Array.isArray(educationData.data) ? educationData.data : [educationData.data]
          programs.forEach((program: any) => {
            searchResults.push({
              _id: program._id,
              title: program.title,
              description: program.description,
              category: 'education',
              type: 'education',
              location: program.location,
              images: program.images,
              featured: false,
              createdAt: program.createdAt,
              institution: program.institution,
              rating: program.rating
            })
          })
        }
      }

      // Sort results by relevance, date, or other criteria
      const sortedResults = sortResults(searchResults, sortBy)
      
      setResults(sortedResults)
      setTotalResults(sortedResults.length)
      
      console.log('✅ Search completed:', {
        totalResults: sortedResults.length,
        categories: sortedResults.reduce((acc: any, result) => {
          acc[result.category] = (acc[result.category] || 0) + 1
          return acc
        }, {})
      })

    } catch (error) {
      console.error('❌ Search error:', error)
      toast({
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const sortResults = (results: SearchResult[], sortBy: string) => {
    switch (sortBy) {
      case 'date_new':
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'date_old':
        return results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'price_low':
        return results.sort((a, b) => (a.price || 0) - (b.price || 0))
      case 'price_high':
        return results.sort((a, b) => (b.price || 0) - (a.price || 0))
      case 'featured':
        return results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      default: // relevance
        return results.sort((a, b) => {
          // Featured items first
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          // Then by views if available
          if (a.views && b.views) return b.views - a.views
          // Then by creation date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }
  }

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (category !== 'all') params.set('category', category)
    if (location !== 'all') params.set('location', location)

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const getResultUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'listing':
        return `/listings/${result._id}`
      case 'job':
        return `/jobs/${result._id}`
      case 'education':
        return `/categories/education/${result._id}`
      default:
        return `/${result.category}/${result._id}`
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return <Building className="h-4 w-4" />
      case 'job':
        return <Briefcase className="h-4 w-4" />
      case 'education':
        return <GraduationCap className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="container px-4 py-6">
          <form onSubmit={handleNewSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search Query</label>
                <Input
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="properties">Properties</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="kyrenia">Kyrenia</SelectItem>
                    <SelectItem value="famagusta">Famagusta</SelectItem>
                    <SelectItem value="nicosia">Nicosia</SelectItem>
                    <SelectItem value="karpaz">Karpaz Peninsula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="container px-4 py-8">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Search Results
              {searchQuery && (
                <span className="text-muted-foreground font-normal"> for "{searchQuery}"</span>
              )}
            </h1>
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : `Found ${totalResults} results`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="date_new">Newest First</SelectItem>
                <SelectItem value="date_old">Oldest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-4 w-3/4" />
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-muted rounded w-20" />
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={result._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <Link href={getResultUrl(result)}>
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {result.images && result.images.length > 0 ? (
                      <img
                        src={result.images[0]}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        {getTypeIcon(result.type)}
                      </div>
                    )}
                    
                    {result.featured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                      {result.category}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(result.type)}
                      <h3 className="font-semibold line-clamp-1">{result.title}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {result.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      {result.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {result.location.city}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(result.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {result.owner && (
                          <p>{result.owner.firstName} {result.owner.lastName}</p>
                        )}
                        {result.company && (
                          <p>{result.company.name}</p>
                        )}
                        {result.institution && (
                          <p>{result.institution.name}</p>
                        )}
                      </div>
                      
                      {result.price && (
                        <div className="font-semibold text-lg">
                          {formatPrice(result.price, result.currency)}
                        </div>
                      )}
                      
                      {result.views && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Eye className="h-3 w-3 mr-1" />
                          {result.views}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setCategory('all')
              setLocation('all')
              router.push('/search')
            }}>
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <div data-newsletter>
        <NotificationSection source="search_page" />
      </div>
    </div>
  )
}