"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: number
  pricingFrequency: string
  rating?: number
  reviewCount?: number
  imageUrl?: string
  category: string
  isFavorite?: boolean
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void
  guestFavoriteText?: string
  className?: string
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  pricingFrequency,
  rating = 4.9,
  reviewCount = 0,
  imageUrl = "/placeholder.svg",
  category,
  isFavorite = false,
  onFavoriteToggle,
  guestFavoriteText = "Guest favorite",
  className = ""
}: PropertyCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFavoriteState = !favorite
    setFavorite(newFavoriteState)
    onFavoriteToggle?.(id, newFavoriteState)
  }

  const formatPrice = () => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)

    return `${formattedPrice} ${pricingFrequency || 'per night'}`
  }

  const getDetailPageUrl = () => {
    switch (category) {
      case 'jobs':
        return `/jobs/${id}`
      case 'education':
        return `/categories/education/${id}`
      case 'service':
        return `/listings/${id}`
      default:
        return `/listings/${id}`
    }
  }

  return (
    <div className={`group relative cursor-pointer ${className}`}>
      <Link href={getDetailPageUrl()}>
        <div className="relative overflow-hidden rounded-xl">
          {/* Guest Favorite Badge */}
          {rating >= 4.8 && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-white text-gray-800 text-xs font-medium px-2 py-1 shadow-sm">
                {guestFavoriteText}
              </Badge>
            </div>
          )}

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 z-10 h-8 w-8 p-0 hover:bg-white/20 group"
            onClick={handleFavoriteClick}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                favorite
                  ? "fill-red-500 text-red-500"
                  : "fill-black/50 text-white stroke-2"
              }`}
            />
          </Button>

          {/* Image - hide for jobs and education */}
          {category !== 'jobs' && category !== 'education' && (
            <div className="relative aspect-[4/3]">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Image Loading Skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </div>
          )}
          
          {/* Content for jobs and education without image */}
          {(category === 'jobs' || category === 'education') && (
            <div className="p-6 bg-gray-50 rounded-xl min-h-[120px] flex flex-col justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {category === 'jobs' ? '💼' : '🎓'}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {title}
                </h3>
                <p className="text-gray-600 text-xs mb-2">
                  {location.city}{location.region ? `, ${location.region}` : ''}
                </p>
                <p className="font-semibold text-gray-900 text-sm">
                  {formatPrice()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Property Details - only for properties and services */}
        {category !== 'jobs' && category !== 'education' && (
          <div className="pt-3 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 truncate pr-2">
                {title}
              </h3>
              
              {rating && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Star className="h-4 w-4 fill-black text-black" />
                  <span className="text-sm font-medium text-gray-900">
                    {rating.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm truncate">
              {location.city}{location.region ? `, ${location.region}` : ''}
            </p>

            <p className="font-semibold text-gray-900 mt-2">
              {formatPrice()}
            </p>
          </div>
        )}
      </Link>
    </div>
  )
}

// Skeleton component for loading state
export function PropertyCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}