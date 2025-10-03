"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Vehicle {
  _id?: string
  id?: string
  title: string
  description: string
  price: number
  pricing_frequency: string
  currency?: string
  image_urls: string[]
  primaryImage?: string
  location?: {
    city: string
    region?: string
  }
  category: string
  listingType?: string
  views?: number
}

interface VehicleSectionProps {
  title: string
  vehicles: Vehicle[]
  loading?: boolean
  onSeeMore: () => void
  maxItems?: number
  showScrollButtons?: boolean
}

export function VehicleSection({
  title,
  vehicles,
  loading = false,
  onSeeMore,
  maxItems = 6,
  showScrollButtons = true
}: VehicleSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0)

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('vehicle-scroll-container')
    if (container) {
      const scrollAmount = 312 // Width of one card (288px) plus gap (24px)
      const newPosition = direction === 'left'
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount

      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  const formatPrice = (price?: number, currency = 'USD', frequency?: string) => {
    if (!price) return 'Price on request'
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(price)
    return frequency && frequency !== 'fixed' ? `${formatted}/${frequency}` : formatted
  }

  const getCategoryDisplayName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Limit the number of vehicles displayed
  const displayVehicles = vehicles.slice(0, maxItems)
  const skeletonCount = Math.max(0, maxItems - displayVehicles.length)

  return (
    <div className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 text-center sm:text-left">{title}</h2>

        <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
          {showScrollButtons && (
            <div className="flex space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('left')}
                disabled={scrollPosition <= 0}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('right')}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={onSeeMore}
            className="flex items-center space-x-1 text-sm sm:text-base"
          >
            <span>See more</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          id="vehicle-scroll-container"
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Actual Vehicles */}
          {displayVehicles.map((vehicle) => (
            <div key={vehicle._id || vehicle.id} className="flex-shrink-0 w-72">
              <Link href={`/listings/${vehicle._id || vehicle.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative">
                    {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
                      <img
                        src={vehicle.primaryImage || vehicle.image_urls[0]}
                        alt={vehicle.title}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Car className="h-12 w-12 text-gray-400" />
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

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-1 text-lg">{vehicle.title}</CardTitle>
                    {vehicle.location && (
                      <CardDescription className="text-sm">
                        {vehicle.location.city}
                        {vehicle.location.region && `, ${vehicle.location.region}`}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {vehicle.description}
                    </p>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center pt-2">
                    <div className="font-semibold text-lg">
                      {formatPrice(vehicle.price, vehicle.currency, vehicle.pricing_frequency)}
                    </div>
                    {vehicle.views !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {vehicle.views} views
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}

          {/* Skeleton Loaders */}
          {(loading || skeletonCount > 0) && Array.from({ length: loading ? maxItems : skeletonCount }).map((_, index) => (
            <div key={`skeleton-${index}`} className="flex-shrink-0 w-72">
              <Card className="overflow-hidden animate-pulse">
                <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                <CardHeader>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2" />
                  <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6" />
                </CardContent>
                <CardFooter>
                  <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-1/3" />
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
