"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyCard, PropertyCardSkeleton } from "@/components/property-card"

interface Property {
  _id?: string
  id?: string
  title: string
  description: string
  price: number
  pricing_frequency: string
  image_urls: string[]
  primaryImage?: string
  location: {
    city: string
    region?: string
  }
  category: string
  rating?: number
  reviews?: number
  views?: number
}

interface PropertySectionProps {
  title: string
  category: string
  cityFilter?: string
  properties: Property[]
  loading?: boolean
  onSeeMore: () => void
  maxItems?: number
  showScrollButtons?: boolean
}

export function PropertySection({
  title,
  category,
  cityFilter,
  properties,
  loading = false,
  onSeeMore,
  maxItems = 6,
  showScrollButtons = true
}: PropertySectionProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('property-favorites')
    if (savedFavorites) {
      try {
        const favoritesArray = JSON.parse(savedFavorites)
        setFavorites(new Set(favoritesArray))
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
  }, [])

  const handleFavoriteToggle = (propertyId: string, isFavorite: boolean) => {
    const newFavorites = new Set(favorites)
    if (isFavorite) {
      newFavorites.add(propertyId)
    } else {
      newFavorites.delete(propertyId)
    }
    setFavorites(newFavorites)
    
    // Save to localStorage
    try {
      localStorage.setItem('property-favorites', JSON.stringify(Array.from(newFavorites)))
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`property-scroll-${category}`)
    if (container) {
      const scrollAmount = 312 // Width of one card (288px) plus gap (24px)
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  // Fill with skeletons if we don't have enough properties
  const displayItems = [...properties.slice(0, maxItems)]
  const skeletonCount = Math.max(0, maxItems - displayItems.length)
  
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
          id={`property-scroll-${category}`}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Actual Properties */}
          {displayItems.map((property) => (
            <div key={property._id || property.id} className="flex-shrink-0 w-72">
              <PropertyCard
                id={property._id || property.id}
                title={property.title}
                location={property.location}
                price={property.price}
                pricingFrequency={property.pricing_frequency || 'per night'}
                rating={property.rating || (Math.random() * 0.5 + 4.5)} // Random rating between 4.5-5.0 if not available
                imageUrl={property.primaryImage || property.image_urls?.[0] || '/placeholder.svg'}
                category={property.category}
                isFavorite={favorites.has(property._id || property.id)}
                onFavoriteToggle={handleFavoriteToggle}
                guestFavoriteText="Guest favorite"
              />
            </div>
          ))}

          {/* Skeleton Loaders */}
          {(loading || skeletonCount > 0) && Array.from({ length: loading ? maxItems : skeletonCount }).map((_, index) => (
            <div key={`skeleton-${index}`} className="flex-shrink-0 w-72">
              <PropertyCardSkeleton />
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