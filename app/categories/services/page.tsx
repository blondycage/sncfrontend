'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search, Loader2, Eye, Calendar } from "lucide-react"
import { categoriesApi } from "@/lib/api"
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

interface ServiceListing {
  id: string
  _id: string
  title: string
  description: string
  category: string
  subcategory?: string
  price?: number
  currency?: string
  pricing_frequency?: string
  location?: {
    city: string
    area?: string
  }
  image_urls?: string[]
  images?: string[]
  featured: boolean
  createdAt: string
  created_at?: string
  owner?: {
    firstName: string
    lastName: string
    username: string
  }
  views?: number
}

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<ServiceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  const availableCategories = [
    'all',
    'transportation',
    'legal',
    'cleaning',
    'it-services',
    'events',
    'real-estate',
    'beauty',
    'health',
    'education',
    'consulting'
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
    fetchServices()
  }, [pagination.page, selectedCategory, selectedLocation, sortBy])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params: any = {
        limit: pagination.limit,
        category: 'service',
        sortBy
      }

      if (selectedLocation !== 'all') {
        params.city = selectedLocation
      }

      if (selectedCategory !== 'all') {
        params.subcategory = selectedCategory
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const response = await categoriesApi.getServices(params)

      if (response.success && response.data) {
        const serviceListings = Array.isArray(response.data) ? response.data : [response.data]

        const formattedServices = serviceListings.map((service: any) => ({
          id: service.id || service._id,
          _id: service._id || service.id,
          title: service.title,
          description: service.description,
          category: service.category,
          subcategory: service.subcategory,
          price: service.price,
          currency: service.currency,
          pricing_frequency: service.pricing_frequency,
          location: service.location,
          image_urls: service.image_urls || service.images,
          images: service.images || service.image_urls,
          featured: service.featured || false,
          createdAt: service.createdAt || service.created_at,
          created_at: service.created_at || service.createdAt,
          owner: service.owner,
          views: service.views
        }))

        setServices(formattedServices)
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.totalItems || formattedServices.length,
          pages: Math.ceil((response.pagination?.totalItems || formattedServices.length) / prev.limit)
        }))
      } else {
        setServices([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: 'Error',
        description: 'Failed to load services. Please try again.',
        variant: 'error'
      })
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchServices()
  }

  const formatPrice = (price?: number, currency = 'USD', frequency?: string) => {
    if (!price) return 'Price on request'
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(price)
    return frequency ? `${formatted}/${frequency}` : formatted
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

  return (
    <div className="min-h-screen bg-gradient-purple">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Services & Businesses</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Find professional services and trusted businesses in North Cyprus
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 mb-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryDisplayName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse border-gray-200/50 shadow-sm">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
                  <CardHeader>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2" />
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Services Grid */}
        {!loading && services.length > 0 && (
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/listings/${service._id}`}>
                    <div className="relative">
                      {service.images && service.images.length > 0 ? (
                        <img
                          src={service.images[0]}
                          alt={service.title}
                          className="aspect-video w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-video w-full bg-muted flex items-center justify-center">
                          <div className="text-muted-foreground">No Image</div>
                        </div>
                      )}

                      {service.featured && (
                        <div className="absolute left-2 top-2">
                          <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {service.subcategory && (
                        <div className="absolute right-2 top-2">
                          <Badge className="bg-primary/80 text-white">
                            {getCategoryDisplayName(service.subcategory)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">{service.title}</CardTitle>
                      {service.owner && (
                        <div className="text-sm font-medium text-muted-foreground">
                          {service.owner.firstName} {service.owner.lastName}
                        </div>
                      )}
                      {service.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          {service.location.city}
                          {service.location.area && `, ${service.location.area}`}
                        </div>
                      )}
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(service.createdAt)}
                        </div>
                        {service.views && (
                          <div className="flex items-center text-muted-foreground">
                            <Eye className="mr-1 h-3 w-3" />
                            {service.views}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex justify-between items-center">
                        <div className="font-medium text-lg">
                          {formatPrice(service.price, service.currency, service.pricing_frequency)}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button className="w-full">View Details</Button>
                    </CardFooter>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && services.length === 0 && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find services.
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedLocation('all')
              setSortBy('newest')
            }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && services.length > 0 && pagination.pages > 1 && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mt-8">
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="border-gray-300 hover:bg-gray-50"
              >
                Previous
              </Button>

              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>

              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="border-gray-300 hover:bg-gray-50"
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