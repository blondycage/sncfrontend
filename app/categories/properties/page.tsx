"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, BedDouble, Bath, Maximize2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { listingsApi } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Listing {
  id: string;
  title: string;
  description: string;
  listingType: string;
  category: string;
  tags: string[];
  price: number;
  pricing_frequency: string;
  image_urls: string[];
  created_at: string;
  owner: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  location?: {
    city?: string;
    region?: string;
    address?: string;
  };
  views: number;
  is_paid: boolean;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const router = useRouter();

  // Fetch real estate listings from the backend
  const fetchProperties = async (filter = "all") => {
    try {
      setLoading(true);
      
      const params: any = {
        listingType: "real_estate",
        limit: 50,
        sortBy: "newest"
      };

      // Apply category filter
      if (filter === "sale") {
        params.category = "sale";
      } else if (filter === "rental") {
        params.category = "rental";
      }

      // Apply city filter
      if (filter === "kyrenia" || filter === "famagusta" || filter === "nicosia") {
        params.city = filter;
      }

      console.log('🏠 Fetching properties with params:', params);
      const response = await listingsApi.getListings(params);
      
      if (response.success) {
        setProperties(response.data || []);
        console.log('✅ Properties fetched:', response.data?.length || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch properties');
      }
    } catch (error: any) {
      console.error('❌ Error fetching properties:', error);
      toast.error(error.message || 'Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(selectedFilter);
  }, [selectedFilter]);

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  // Format price display
  const formatPrice = (price: number, frequency: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);

    const frequencyMap: Record<string, string> = {
      hourly: '/hr',
      daily: '/day',
      weekly: '/week',
      monthly: '/month',
      fixed: ''
    };

    return `${formattedPrice}${frequencyMap[frequency] || ''}`;
  };

  // Extract bedroom/bathroom count from tags
  const extractRoomInfo = (tags: string[]) => {
    const bedrooms = tags.find(tag => tag.includes('bedroom'))?.replace(/\D/g, '') || '1';
    const bathrooms = tags.find(tag => tag.includes('bathroom'))?.replace(/\D/g, '') || '1';
    return { bedrooms, bathrooms };
  };

  // Extract area from tags
  const extractArea = (tags: string[]) => {
    const areaTag = tags.find(tag => tag.includes('sqm') || tag.includes('m²') || tag.includes('sq'));
    return areaTag || 'N/A';
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Properties & Rentals</h1>
        <p className="mt-2 text-muted-foreground">Find your dream home in North Cyprus</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge 
          variant={selectedFilter === "all" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleFilterChange("all")}
        >
          All Properties
        </Badge>
        <Badge 
          variant={selectedFilter === "sale" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleFilterChange("sale")}
        >
          For Sale
        </Badge>
        <Badge 
          variant={selectedFilter === "rental" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleFilterChange("rental")}
        >
          For Rent
        </Badge>
        <Badge 
          variant={selectedFilter === "kyrenia" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleFilterChange("kyrenia")}
        >
          Kyrenia
        </Badge>
        <Badge 
          variant={selectedFilter === "famagusta" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleFilterChange("famagusta")}
        >
          Famagusta
        </Badge>
        <Badge 
          variant={selectedFilter === "nicosia" ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleFilterChange("nicosia")}
        >
          Nicosia
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading properties...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground">
            <MapPin className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No properties found</h3>
            <p>Try adjusting your filters or check back later for new listings.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const { bedrooms, bathrooms } = extractRoomInfo(property.tags || []);
            const area = extractArea(property.tags || []);
            
            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={property.image_urls?.[0] || "/placeholder.svg"}
                    alt={property.title}
                    className="aspect-video w-full object-cover"
                  />
                  {property.is_paid && (
                    <div className="absolute left-2 top-2">
                      <Badge className="bg-amber-500 text-white hover:bg-amber-600">Featured</Badge>
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">
                      {formatPrice(property.price, property.pricing_frequency)}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{property.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {property.location?.city ? 
                      `${property.location.city.charAt(0).toUpperCase() + property.location.city.slice(1)}${property.location.region ? `, ${property.location.region}` : ''}` : 
                      'North Cyprus'
                    }
                  </div>
                  <CardDescription className="line-clamp-3">{property.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <BedDouble className="mr-1 h-4 w-4" />
                      <span className="text-sm">{bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="mr-1 h-4 w-4" />
                      <span className="text-sm">{bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center">
                      <Maximize2 className="mr-1 h-4 w-4" />
                      <span className="text-sm">{area}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/listings/${property.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
}
