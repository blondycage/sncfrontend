'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search, Loader2, Eye, Calendar, Car } from "lucide-react"
import { listingsApi } from "@/lib/api"
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

interface VehicleListing {
  id: string
  _id: string
  title: string
  description: string
  listingType: string
  category: string
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

export default function VehiclesPage() {
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<VehicleListing[]>([])
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

  const vehicleCategories = [
    'all',
    'cars',
    'motorcycles',
    'trucks',
    'vans',
    'boats',
    'heavy-machinery',
    'parts-accessories'
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
    fetchVehicles()
  }, [pagination.page, selectedCategory, selectedLocation, sortBy])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        listingType: 'vehicle',
        sortBy
      }

      if (selectedLocation !== 'all') {
        params.city = selectedLocation
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const response = await listingsApi.getListings(params)

      if (response.success && response.data) {
        const vehicleListings = Array.isArray(response.data) ? response.data : [response.data]

        const formattedVehicles = vehicleListings.map((vehicle: any) => ({
          id: vehicle.id || vehicle._id,
          _id: vehicle._id || vehicle.id,
          title: vehicle.title,
          description: vehicle.description,
          listingType: vehicle.listingType,
          category: vehicle.category,
          price: vehicle.price,
          currency: vehicle.currency,
          pricing_frequency: vehicle.pricing_frequency,
          location: vehicle.location,
          image_urls: vehicle.image_urls || vehicle.images,
          images: vehicle.images || vehicle.image_urls,
          featured: vehicle.featured || false,
          createdAt: vehicle.createdAt || vehicle.created_at,
          created_at: vehicle.created_at || vehicle.createdAt,
          owner: vehicle.owner,
          views: vehicle.views
        }))

        setVehicles(formattedVehicles)
        setPagination(prev => ({
          ...prev,
          total: (response as any)?.pagination?.totalItems || formattedVehicles.length,
          pages: Math.ceil(((response as any)?.pagination?.totalItems || formattedVehicles.length) / prev.limit)
        }))
      } else {
        setVehicles([])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vehicles. Please try again.',
        variant: 'error'
      })
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchVehicles()
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
    <div className="min-h-screen bg-gradient-teal">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <Car className="h-12 w-12 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">DriveYourType</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Find your perfect vehicle in North Cyprus - cars, motorcycles, boats, and more
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
                  placeholder="Search vehicles..."
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
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicle Types</SelectItem>
                  {vehicleCategories.slice(1).map(category => (
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

        {/* Vehicles Grid */}
        {!loading && vehicles.length > 0 && (
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/listings/${vehicle._id}`}>
                    <div className="relative">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img
                          src={vehicle.images[0]}
                          alt={vehicle.title}
                          className="aspect-video w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Car className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {vehicle.featured && (
                        <div className="absolute left-2 top-2">
                          <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {vehicle.category && (
                        <div className="absolute right-2 top-2">
                          <Badge className="bg-primary/80 text-white">
                            {getCategoryDisplayName(vehicle.category)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">{vehicle.title}</CardTitle>
                      {vehicle.owner && (
                        <div className="text-sm font-medium text-muted-foreground">
                          {vehicle.owner.firstName} {vehicle.owner.lastName}
                        </div>
                      )}
                      {vehicle.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          {vehicle.location.city}
                          {vehicle.location.area && `, ${vehicle.location.area}`}
                        </div>
                      )}
                      <CardDescription className="line-clamp-2">
                        {vehicle.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(vehicle.createdAt)}
                        </div>
                        {vehicle.views && (
                          <div className="flex items-center text-muted-foreground">
                            <Eye className="mr-1 h-3 w-3" />
                            {vehicle.views}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex justify-between items-center">
                        <div className="font-medium text-lg">
                          {formatPrice(vehicle.price, vehicle.currency, vehicle.pricing_frequency)}
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
        {!loading && vehicles.length === 0 && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-12 text-center">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Vehicles Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find vehicles.
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedLocation('all')
              setSortBy('newest')
            }} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && vehicles.length > 0 && pagination.pages > 1 && (
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