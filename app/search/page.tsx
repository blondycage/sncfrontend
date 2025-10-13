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
    region?: string
    address?: string
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
  // Job-specific fields
  jobType?: string
  workLocation?: string
  salary?: {
    min: number
    max: number
    currency: string
    frequency: string
  }
  applicationDeadline?: string
  // Education-specific fields
  level?: string
  fieldOfStudy?: string
  tuition?: {
    amount: number
    currency: string
    period: string
  }
  duration?: {
    value: number
    unit: string
  }
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
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'all')
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
    } else {
      // Clear results when unsortedResults is empty
      setResults([])
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
        if (listingType !== 'all') params.set('listingType', listingType)
        if (location !== 'all') params.set('city', location)

        const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
        router.replace(newUrl) // Use replace instead of push to avoid history buildup
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  // Real-time category, listing type, and location changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (category !== 'all') params.set('category', category)
    if (listingType !== 'all') params.set('listingType', listingType)
    if (location !== 'all') params.set('city', location)

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
    const currentUrl = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

    if (newUrl !== currentUrl) {
      router.replace(newUrl)
    }
  }, [category, listingType, location])

  const performSearch = async () => {
    setLoading(true)
    try {
      // Map frontend sort values to backend sort values
      const getSortByValue = (sortValue: string) => {
        switch (sortValue) {
          case 'date_new': return 'newest'
          case 'date_old': return 'oldest'
          case 'price_low': return 'price-low'
          case 'price_high': return 'price-high'
          case 'featured': return 'featured'
          case 'relevance': return 'newest' // Default to newest for relevance
          default: return 'newest'
        }
      }

      // Build base parameters
      const baseParams = {
        page: pagination.page.toString(),
        ...(searchQuery && { search: searchQuery.trim() }),
        ...(location !== 'all' && { city: location }),
        sortBy: getSortByValue(sortBy)
      }

      // Calculate limits based on category selection
      let listingLimit = 0, jobLimit = 0, educationLimit = 0
      const totalLimit = pagination.limit

      // Determine which endpoints to query based on category filter
      if (category === 'all') {
        // Distribute results evenly when showing all categories
        listingLimit = Math.ceil(totalLimit / 3)
        jobLimit = Math.ceil(totalLimit / 3)
        educationLimit = Math.ceil(totalLimit / 3)
      } else if (category === 'rental' || category === 'sale' || category === 'service') {
        // These are listing categories
        listingLimit = totalLimit
      } else if (category === 'jobs') {
        jobLimit = totalLimit
      } else if (category === 'education') {
        educationLimit = totalLimit
      }

      // Build endpoint-specific parameters for listings
      const listingParams = new URLSearchParams({
        ...baseParams,
        limit: listingLimit.toString(),
        ...(category !== 'all' && (category === 'rental' || category === 'sale' || category === 'service') && { category }),
        ...(listingType !== 'all' && { listingType })
      })

      const jobParams = new URLSearchParams({
        ...baseParams,
        limit: jobLimit.toString()
      })

      const educationParams = new URLSearchParams({
        ...baseParams,
        limit: educationLimit.toString()
      })

      console.log('🔍 Performing search with params:', {
        listings: Object.fromEntries(listingParams.entries()),
        jobs: Object.fromEntries(jobParams.entries()),
        education: Object.fromEntries(educationParams.entries())
      })

      // Build promises array based on category filter and limits
      const promises = []

      // Search listings (only if we need listing results)
      if (listingLimit > 0) {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings?${listingParams}`).catch(() => ({ ok: false }))
        )
      } else {
        promises.push(Promise.resolve({ ok: false }))
      }

      // Search jobs (only if we need job results)
      if (jobLimit > 0) {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?${jobParams}`).catch(() => ({ ok: false }))
        )
      } else {
        promises.push(Promise.resolve({ ok: false }))
      }

      // Search education programs (only if we need education results)
      if (educationLimit > 0) {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/programs?${educationParams}`).catch(() => ({ ok: false }))
        )
      } else {
        promises.push(Promise.resolve({ ok: false }))
      }

      const [listingsRes, jobsRes, educationRes] = await Promise.all(promises)

      const searchResults: SearchResult[] = []

      // Track pagination info
      let totalPages = 0
      let totalCount = 0

      // Process listings results
      if (listingsRes.ok && 'json' in listingsRes) {
        const listingsData = await (listingsRes as Response).json()
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

          // Extract pagination info if available
          if (listingsData.pagination) {
            totalPages = Math.max(totalPages, listingsData.pagination.pages || 0)
            totalCount += listingsData.pagination.total || 0
          }
        }
      }

      // Process jobs results
      if (jobsRes.ok && 'json' in jobsRes) {
        const jobsData = await (jobsRes as Response).json()
        if (jobsData.success && jobsData.data) {
          const jobs = Array.isArray(jobsData.data) ? jobsData.data : [jobsData.data]
          jobs.forEach((job: any) => {
            searchResults.push({
              _id: job._id || job.id,
              title: job.title,
              description: job.description,
              category: 'jobs',
              type: 'job',
              location: job.location,
              images: [], // Jobs should not display images in search results
              featured: job.featured || false,
              createdAt: job.createdAt || job.created_at,
              company: job.company,
              views: job.views,
              // Job-specific fields
              jobType: job.jobType,
              workLocation: job.workLocation,
              salary: job.salary,
              applicationDeadline: job.applicationDeadline
            })
          })

          // Extract pagination info if available
          if (jobsData.pagination) {
            totalPages = Math.max(totalPages, jobsData.pagination.pages || 0)
            totalCount += jobsData.pagination.total || 0
          }
        }
      }

      // Process education results
      if (educationRes.ok && 'json' in educationRes) {
        const educationData = await (educationRes as Response).json()
        if (educationData.success && educationData.data) {
          const programs = Array.isArray(educationData.data) ? educationData.data : [educationData.data]
          programs.forEach((program: any) => {
            searchResults.push({
              _id: program._id || program.id,
              title: program.title,
              description: program.description,
              category: 'education',
              type: 'education',
              location: program.location,
              images: [], // Education programs should not display images in search results
              featured: program.featured || false,
              createdAt: program.createdAt || program.created_at,
              institution: program.institution,
              views: program.views,
              // Education-specific fields
              level: program.level,
              fieldOfStudy: program.fieldOfStudy,
              tuition: program.tuition,
              duration: program.duration
            })
          })

          // Extract pagination info if available
          if (educationData.pagination) {
            totalPages = Math.max(totalPages, educationData.pagination.pages || 0)
            totalCount += educationData.pagination.total || 0
          }
        }
      }

      // Store unsorted results and let the useEffect handle sorting
      setUnsortedResults(searchResults)
      setTotalResults(searchResults.length)

      // Update pagination state
      setPagination(prev => ({
        ...prev,
        total: totalCount || searchResults.length,
        pages: totalPages || Math.ceil((totalCount || searchResults.length) / prev.limit)
      }))
      
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
    if (listingType !== 'all') params.set('listingType', listingType)
    if (location !== 'all') params.set('city', location)  // Use 'city' parameter

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  // Function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ?
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark> : part
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      {/* Search Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleNewSearch}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Search Query</label>
                <Input
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="rental">Rentals</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-white mb-2 block">Listing Type</label>
                <Select value={listingType} onValueChange={setListingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="vehicle">Vehicles</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-white mb-2 block">Location</label>
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
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Search Results
              {searchQuery && (
                <span className="text-muted-foreground font-normal"> for "{searchQuery}"</span>
              )}
            </h1>
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : (
                <>
                  Found {totalResults} results
                  {searchQuery && ` for "${searchQuery}"`}
                  {category !== 'all' && ` in ${category}`}
                  {location !== 'all' && ` in ${location}`}
                </>
              )}
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border-gray-200/50 shadow-sm">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2" />
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-4 w-3/4" />
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20" />
                      <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <>
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={result._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <Link href={getResultUrl(result)}>
                  {/* Image - Only show for listings */}
                  {result.type === 'listing' ? (
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
                  ) : (
                    // Header section for jobs and education (no image)
                    <div className="relative p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(result.type)}
                          <Badge variant="secondary">
                            {result.type === 'job' ? 'Job Opportunity' : 'Education Program'}
                          </Badge>
                        </div>

                        {result.featured && (
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Additional type-specific info */}
                      {result.type === 'job' && result.jobType && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{result.jobType}</Badge>
                          {result.workLocation && <Badge variant="outline">{result.workLocation}</Badge>}
                        </div>
                      )}

                      {result.type === 'education' && result.level && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{result.level}</Badge>
                          {result.fieldOfStudy && <Badge variant="outline">{result.fieldOfStudy}</Badge>}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(result.type)}
                      <h3 className="font-semibold line-clamp-1">
                        {highlightSearchTerm(result.title, searchQuery)}
                      </h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {highlightSearchTerm(result.description, searchQuery)}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      {result.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {highlightSearchTerm(result.location.city || '', searchQuery)}
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
                          <p>
                            {highlightSearchTerm(`${result.owner.firstName} ${result.owner.lastName}`, searchQuery)}
                          </p>
                        )}
                        {result.company && (
                          <p>{highlightSearchTerm(result.company.name, searchQuery)}</p>
                        )}
                        {result.institution && (
                          <p>{highlightSearchTerm(result.institution.name, searchQuery)}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Price/Salary/Tuition display */}
                        {result.type === 'listing' && result.price && (
                          <div className="font-semibold text-lg">
                            {formatPrice(result.price, result.currency)}
                          </div>
                        )}

                        {result.type === 'job' && result.salary && (
                          <div className="text-sm font-semibold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: result.salary.currency,
                              minimumFractionDigits: 0
                            }).format(result.salary.min)}
                            {result.salary.max !== result.salary.min && (
                              <>
                                {' - '}
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: result.salary.currency,
                                  minimumFractionDigits: 0
                                }).format(result.salary.max)}
                              </>
                            )}
                            <span className="text-xs text-muted-foreground">
                              /{result.salary.frequency}
                            </span>
                          </div>
                        )}

                        {result.type === 'education' && result.tuition && (
                          <div className="text-sm font-semibold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: result.tuition.currency,
                              minimumFractionDigits: 0
                            }).format(result.tuition.amount)}
                            <span className="text-xs text-muted-foreground">
                              /{result.tuition.period.replace('per_', '')}
                            </span>
                          </div>
                        )}

                        {result.views && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Eye className="h-3 w-3 mr-1" />
                            {result.views}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
            </div>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  let pageNum
                  if (pagination.pages <= 7) {
                    pageNum = i + 1
                  } else if (pagination.page <= 4) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.pages - 3) {
                    pageNum = pagination.pages - 6 + i
                  } else {
                    pageNum = pagination.page - 3 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
          </>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-16 text-center shadow-lg border border-gray-200">
            <Search className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              No Results Found
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Try another search with different keywords or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setCategory('all')
                setListingType('all')
                setLocation('all')
                router.push('/search')
              }}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3"
            >
              Try Another Search
            </Button>
          </div>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-b from-gray-50/30 to-gray-100/50 py-12 border-t border-gray-200/30" data-newsletter>
        <NotificationSection source="search_page" />
      </section>
    </div>
  )
}