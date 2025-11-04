"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { listingsApi } from "@/lib/api"
import { MapPin, Eye, Wrench } from "lucide-react"

interface HomeAppliance {
  _id?: string
  id?: string
  title: string
  description: string
  price: number
  currency: string
  pricing_frequency: string
  image_urls: string[]
  primaryImage?: string
  location?: {
    city: string
    region?: string
  }
  category: string
  listingType: string
  views?: number
  tags?: string[]
  createdAt?: string
}

interface HomeAppliancesSectionProps {
  title: string
  appliances: HomeAppliance[]
  loading: boolean
  onSeeMore: () => void
  maxItems?: number
}

export function HomeAppliancesSection({
  title,
  appliances,
  loading,
  onSeeMore,
  maxItems = 6
}: HomeAppliancesSectionProps) {
  const router = useRouter()

  const formatPrice = (price: number, currency: string, frequency: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

    const frequencyMap: { [key: string]: string } = {
      'fixed': '',
      'negotiable': ' (Negotiable)',
      'free': ' (Free)',
    }

    return `${formattedPrice}${frequencyMap[frequency] || ''}`
  }

  const handleApplianceClick = (appliance: HomeAppliance) => {
    const applianceId = appliance.id || appliance._id
    if (applianceId) {
      router.push(`/listings/${applianceId}`)
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <Button variant="outline">
            See More
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded mb-4 w-3/4" />
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-100 rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (appliances.length === 0) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="text-center py-12">
          <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No home appliances available at the moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <Button
          variant="outline"
          onClick={onSeeMore}
        >
          See More
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appliances.slice(0, maxItems).map((appliance) => (
          <Card
            key={appliance.id || appliance._id}
            className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleApplianceClick(appliance)}
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={appliance.image_urls[0] || '/placeholder.svg'}
                alt={appliance.title}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">{appliance.title}</h3>
                <Badge variant="secondary" className="ml-2">
                  {appliance.category}
                </Badge>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {appliance.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(appliance.price, appliance.currency, appliance.pricing_frequency)}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="h-4 w-4 mr-1" />
                  {appliance.views || 0}
                </div>
              </div>

              {appliance.location?.city && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {appliance.location.city}
                </div>
              )}

              {appliance.tags && appliance.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {appliance.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {appliance.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{appliance.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}