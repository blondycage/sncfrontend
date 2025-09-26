"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, BedDouble, Bath, Maximize2, Loader2, Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [bedroomFilter, setBedroomFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
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

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...properties];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter(property => {
        const price = property.price;
        switch (priceRange) {
          case "under-100k": return price < 100000;
          case "100k-300k": return price >= 100000 && price < 300000;
          case "300k-500k": return price >= 300000 && price < 500000;
          case "500k-1m": return price >= 500000 && price < 1000000;
          case "over-1m": return price >= 1000000;
          default: return true;
        }
      });
    }

    // Bedroom filter
    if (bedroomFilter !== "all") {
      filtered = filtered.filter(property => {
        const { bedrooms } = extractRoomInfo(property.tags || []);
        return bedrooms === bedroomFilter;
      });
    }

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "views":
          return b.views - a.views;
        default:
          return 0;
      }
    });

    return filtered;
  }, [properties, searchTerm, priceRange, bedroomFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProperties.length / itemsPerPage);
  const paginatedProperties = filteredAndSortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, bedroomFilter, sortBy, selectedFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setPriceRange("all");
    setBedroomFilter("all");
    setSelectedFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Properties & Rentals</h1>
          <p className="text-lg text-muted-foreground">Find your dream home in North Cyprus</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties by title, location, or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedFilter === "all" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              onClick={() => handleFilterChange("all")}
            >
              All Properties
            </Badge>
            <Badge
              variant={selectedFilter === "sale" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              onClick={() => handleFilterChange("sale")}
            >
              For Sale
            </Badge>
            <Badge
              variant={selectedFilter === "rental" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              onClick={() => handleFilterChange("rental")}
            >
              For Rent
            </Badge>
            <Badge
              variant={selectedFilter === "kyrenia" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              onClick={() => handleFilterChange("kyrenia")}
            >
              Kyrenia
            </Badge>
            <Badge
              variant={selectedFilter === "famagusta" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              onClick={() => handleFilterChange("famagusta")}
            >
              Famagusta
            </Badge>
            <Badge
              variant={selectedFilter === "nicosia" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              onClick={() => handleFilterChange("nicosia")}
            >
              Nicosia
            </Badge>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button variant="ghost" onClick={clearAllFilters} className="text-muted-foreground">
                Clear All Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-muted/30 rounded-lg">
                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="views">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="under-100k">Under $100k</SelectItem>
                      <SelectItem value="100k-300k">$100k - $300k</SelectItem>
                      <SelectItem value="300k-500k">$300k - $500k</SelectItem>
                      <SelectItem value="500k-1m">$500k - $1M</SelectItem>
                      <SelectItem value="over-1m">Over $1M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Bedrooms</SelectItem>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4 Bedrooms</SelectItem>
                      <SelectItem value="5">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="text-sm text-muted-foreground bg-background px-3 py-2 rounded border">
                    {loading ? 'Loading...' : `${filteredAndSortedProperties.length} properties found`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading properties...</span>
          </div>
        ) : filteredAndSortedProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground">
              <MapPin className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold">No properties found</h3>
              <p>Try adjusting your filters or check back later for new listings.</p>
              <Button onClick={clearAllFilters} className="mt-4">Clear All Filters</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {paginatedProperties.map((property) => {
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProperties.length)} of {filteredAndSortedProperties.length} properties
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
