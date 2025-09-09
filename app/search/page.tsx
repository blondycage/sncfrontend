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
  const [unsortedResults, setUnsortedResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [location, setLocation] = useState(searchParams.get('city') || searchParams.get('location') || 'all')
  const [sortBy, setSortBy] = useState('relevance')
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    performSearch()
  }, [searchParams, pagination.page])

  // Separate useEffect for sorting - doesn't trigger new API calls
  useEffect(() => {
    if (unsortedResults.length > 0) {
      const sortedResults = sortResults(unsortedResults, sortBy)
      setResults(sortedResults)
    }
  }, [unsortedResults, sortBy])

  // Real-time search - trigger search when search parameters change
  useEffect(() => {
    // Debounce search input to avoid excessive API calls
    const searchTimeout = setTimeout(() => {
      if (searchQuery !== (searchParams.get('search') || '')) {
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set('search', searchQuery.trim())
        if (category !== 'all') params.set('category', category)
        if (location !== 'all') params.set('city', location)

        const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
        router.replace(newUrl) // Use replace instead of push to avoid history buildup
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  // Real-time category and location changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (category !== 'all') params.set('category', category)
    if (location !== 'all') params.set('city', location)

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
    const currentUrl = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    if (newUrl !== currentUrl) {
      router.replace(newUrl)
    }
  }, [category, location])

  const performSearch = async () => {
    setLoading(true)
    try {
      // Build parameters for different endpoints
      const baseParams = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy !== 'relevance' && { sortBy })
      }

      // For listings endpoint - use city filters (listings have their own categories)
      const listingParams = new URLSearchParams({
        ...baseParams,
        ...(location !== 'all' && { city: location }),
        limit: '8'
      })

      // For jobs endpoint - use city filter
      const jobParams = new URLSearchParams({
        ...baseParams,
        ...(location !== 'all' && { city: location }),
        limit: '6'
      })

      // For education endpoint - use city filter  
      const educationParams = new URLSearchParams({
        ...baseParams,
        ...(location !== 'all' && { city: location }),
        limit: '6'
      })

      console.log('🔍 Performing search with params:', {
        listings: Object.fromEntries(listingParams.entries()),
        jobs: Object.fromEntries(jobParams.entries()),
        education: Object.fromEntries(educationParams.entries())
      })

      // Build promises array based on category filter
      const promises = []
      
      // Search listings (if category is 'all' or 'listings')
      if (category === 'all' || category === 'listings') {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings?${listingParams}`).catch(() => ({ ok: false }))
        )
      } else {
        promises.push(Promise.resolve({ ok: false }))
      }
      
      // Search jobs (if category is 'all' or 'jobs')
      if (category === 'all' || category === 'jobs') {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?${jobParams}`).catch(() => ({ ok: false }))
        )
      } else {
        promises.push(Promise.resolve({ ok: false }))
      }
      
      // Search education programs (if category is 'all' or 'education')
      if (category === 'all' || category === 'education') {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/programs?${educationParams}`).catch(() => ({ ok: false }))
        )
      } else {
        promises.push(Promise.resolve({ ok: false }))
      }

      const [listingsRes, jobsRes, educationRes] = await Promise.all(promises)

      const searchResults: SearchResult[] = []

      // Process listings results
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        if (listingsData.success && listingsData.data) {
          const listings = Array.isArray(listingsData.data) ? listingsData.data : [listingsData.data]
          listings.forEach((listing: any) => {
            searchResults.push({
              _id: listing.id || listing._id, // Backend returns 'id', not '_id'
              title: listing.title,
              description: listing.description,
              category: listing.category,
              type: 'listing',
              price: listing.price,
              currency: listing.currency,
              location: listing.location,
              images: listing.image_urls || listing.images, // Backend returns 'image_urls'
              featured: listing.featured,
              createdAt: listing.created_at || listing.createdAt, // Backend returns 'created_at'
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
              _id: job.id || job._id, // Backend returns 'id', not '_id'
              title: job.title,
              description: job.description,
              category: 'jobs',
              type: 'job',
              location: job.location,
              images: job.images || [],
              featured: job.featured || false,
              createdAt: job.createdAt || job.created_at, // Handle both formats
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
              _id: program._id || program.id, // Handle both formats
              title: program.title,
              description: program.description,
              category: 'education',
              type: 'education',
              location: program.location,
              images: program.images || [],
              featured: program.featured || false,
              createdAt: program.createdAt || program.created_at, // Handle both formats
              institution: program.institution,
              rating: program.rating,
              views: program.views
            })
          })
        }
      }

      // Store unsorted results and let the useEffect handle sorting
      setUnsortedResults(searchResults)
      setTotalResults(searchResults.length)
      
      console.log('✅ Search completed:', {
        totalResults: searchResults.length,
        categories: searchResults.reduce((acc: any, result) => {
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
    // Helper function to safely parse dates
    const getValidDate = (dateStr: string) => {
      if (!dateStr) return new Date(0)
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? new Date(0) : date
    }

    // Helper function to get numeric price value
    const getPrice = (item: SearchResult) => {
      if (typeof item.price === 'number') return item.price
      if (typeof item.price === 'string') {
        const parsed = parseFloat(item.price)
        return isNaN(parsed) ? 0 : parsed
      }
      return 0
    }

    // Helper function to check if item is featured
    const isFeatured = (item: SearchResult) => {
      return Boolean(item.featured)
    }

    // Helper function to get views count
    const getViews = (item: SearchResult) => {
      return typeof item.views === 'number' ? item.views : 0
    }

    switch (sortBy) {
      case 'date_new':
        return [...results].sort((a, b) => {
          const dateA = getValidDate(a.createdAt)
          const dateB = getValidDate(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
      
      case 'date_old':
        return [...results].sort((a, b) => {
          const dateA = getValidDate(a.createdAt)
          const dateB = getValidDate(b.createdAt)
          return dateA.getTime() - dateB.getTime()
        })
      
      case 'price_low':
        return [...results].sort((a, b) => {
          // Items with prices come first, then by price ascending
          const priceA = getPrice(a)
          const priceB = getPrice(b)
          
          if (priceA === 0 && priceB === 0) {
            // Both have no price, sort by date
            return getValidDate(b.createdAt).getTime() - getValidDate(a.createdAt).getTime()
          }
          if (priceA === 0) return 1  // A has no price, put it last
          if (priceB === 0) return -1 // B has no price, put it last
          
          return priceA - priceB
        })
      
      case 'price_high':
        return [...results].sort((a, b) => {
          // Items with prices come first, then by price descending
          const priceA = getPrice(a)
          const priceB = getPrice(b)
          
          if (priceA === 0 && priceB === 0) {
            // Both have no price, sort by date
            return getValidDate(b.createdAt).getTime() - getValidDate(a.createdAt).getTime()
          }
          if (priceA === 0) return 1  // A has no price, put it last
          if (priceB === 0) return -1 // B has no price, put it last
          
          return priceB - priceA
        })
      
      case 'featured':
        return [...results].sort((a, b) => {
          const featuredA = isFeatured(a)
          const featuredB = isFeatured(b)
          
          // Featured items first
          if (featuredA && !featuredB) return -1
          if (!featuredA && featuredB) return 1
          
          // If both are featured or both are not featured, sort by date
          return getValidDate(b.createdAt).getTime() - getValidDate(a.createdAt).getTime()
        })
      
      default: // relevance
        return [...results].sort((a, b) => {
          // Priority order: Featured > Views > Date
          
          // 1. Featured items first
          const featuredA = isFeatured(a)
          const featuredB = isFeatured(b)
          if (featuredA && !featuredB) return -1
          if (!featuredA && featuredB) return 1
          
          // 2. Then by views (higher first)
          const viewsA = getViews(a)
          const viewsB = getViews(b)
          if (viewsA !== viewsB) return viewsB - viewsA
          
          // 3. Finally by creation date (newer first)
          return getValidDate(b.createdAt).getTime() - getValidDate(a.createdAt).getTime()
        })
    }
  }

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (category !== 'all') params.set('category', category)
    if (location !== 'all') params.set('city', location)  // Use 'city' parameter

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
                    <SelectItem value="listings">Listings</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
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
                    <SelectItem value="nicosia">Nicosia (Lefkoşa)</SelectItem>
                    <SelectItem value="kyrenia">Kyrenia (Girne)</SelectItem>
                    <SelectItem value="famagusta">Famagusta (Gazimağusa)</SelectItem>
                    <SelectItem value="morphou">Morphou (Güzelyurt)</SelectItem>
                    <SelectItem value="iskele">İskele</SelectItem>
                    <SelectItem value="lefke">Lefke</SelectItem>
                    <SelectItem value="karpaz">Karpaz Peninsula</SelectItem>
                    <SelectItem value="dipkarpaz">Dipkarpaz</SelectItem>
                    <SelectItem value="alsancak">Alsancak</SelectItem>
                    <SelectItem value="lapta">Lapta</SelectItem>
                    <SelectItem value="catalkoy">Çatalköy</SelectItem>
                    <SelectItem value="esentepe">Esentepe</SelectItem>
                    <SelectItem value="bogaz">Boğaz</SelectItem>
                    <SelectItem value="bellapais">Bellapais</SelectItem>
                    <SelectItem value="karaoglanoglu">Karaoğlanoğlu</SelectItem>
                    <SelectItem value="ozankoy">Özanköy</SelectItem>
                    <SelectItem value="tatlisu">Tatlısu</SelectItem>
                    <SelectItem value="yenibogazici">Yeniboğaziçi</SelectItem>
                    <SelectItem value="zeytinlik">Zeytinlik</SelectItem>
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