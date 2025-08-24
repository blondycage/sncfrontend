"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Calendar, Eye, DollarSign, Star } from 'lucide-react';
import { listingsApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { ReportButton } from '@/components/ui/report-button';

interface Listing {
  id: string;
  title: string;
  description: string;
  listingType?: string;
  category: string;
  tags?: string[];
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
  primaryImage?: string;
  isFavorited?: boolean;
}

interface Filters {
  search: string;
  listingType: string;
  category: string;
  city: string;
  tags: string;
  minPrice: string;
  maxPrice: string;
  pricing_frequency: string;
  sortBy: string;
}

const LISTING_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' }
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'rental', label: 'Rental' },
  { value: 'sale', label: 'Sale' },
  { value: 'service', label: 'Service' }
];

const PRICING_FREQUENCIES = [
  { value: 'all', label: 'All Frequencies' },
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'weekly', label: 'Per Week' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'fixed', label: 'Fixed Price' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
];

const NORTHERN_CYPRUS_CITIES = [
  { value: 'all', label: 'All Cities' },
  { value: 'nicosia', label: 'Nicosia (Lefkoşa)' },
  { value: 'kyrenia', label: 'Kyrenia (Girne)' },
  { value: 'famagusta', label: 'Famagusta (Gazimağusa)' },
  { value: 'morphou', label: 'Morphou (Güzelyurt)' },
  { value: 'lefka', label: 'Lefka (Lefke)' },
  { value: 'lapithos', label: 'Lapithos (Lapta)' },
  { value: 'bellapais', label: 'Bellapais (Beylerbeyi)' },
  { value: 'bogaz', label: 'Boğaz' },
  { value: 'catalkoy', label: 'Çatalköy' },
  { value: 'esentepe', label: 'Esentepe' },
  { value: 'iskele', label: 'İskele' },
  { value: 'karaoglanoglu', label: 'Karaoğlanoğlu' },
  { value: 'kayalar', label: 'Kayalar' },
  { value: 'ozankoy', label: 'Özanköy' },
  { value: 'tatlisu', label: 'Tatlısu' },
  { value: 'yenibogazici', label: 'Yeniboğaziçi' },
  { value: 'zeytinlik', label: 'Zeytinlik' },
  { value: 'dipkarpaz', label: 'Dipkarpaz' },
  { value: 'karpas', label: 'Karpas Peninsula' },
  { value: 'other', label: 'Other' }
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12
  });
  const [filters, setFilters] = useState<Filters>({
    search: '',
    listingType: 'all',
    category: 'all',
    city: 'all',
    tags: '',
    minPrice: '',
    maxPrice: '',
    pricing_frequency: 'all',
    sortBy: 'newest'
  });

  // Fetch listings
  const fetchListings = async (page = 1) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching listings with filters:', filters);

      // Build query parameters
      const params: any = {
        page,
        limit: 12,
        sortBy: filters.sortBy
      };

      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.listingType && filters.listingType !== 'all') params.listingType = filters.listingType;
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.city && filters.city !== 'all') params.city = filters.city;
      if (filters.tags) params.tags = filters.tags.split(',').map(tag => tag.trim());
      if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
      if (filters.pricing_frequency && filters.pricing_frequency !== 'all') params.pricing_frequency = filters.pricing_frequency;

      console.log('📡 API Request params:', params);

      const response = await listingsApi.getListings(params);
      console.log('📥 API Response:', response);

      if (response.success) {
        const baseListings: Listing[] = response.data || [];
        setListings(baseListings);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12
        });
      } else {
        throw new Error(response.message || 'Failed to fetch listings');
      }
    } catch (error: any) {
      console.error('❌ Error fetching listings:', error);
      toast.error(error.message || 'Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Load listings on component mount and filter changes
  useEffect(() => {
    fetchListings(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle search
  const handleSearch = () => {
    fetchListings(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchListings(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sponsored listings */}
      {/* Sponsored listings removed from listings page as requested */}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse All Listings</h1>
        <p className="text-gray-600">Discover amazing listings from our community</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search listings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Listing Type */}
            <div>
              <Select 
                value={filters.listingType} 
                onValueChange={(value) => handleFilterChange('listingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Listing Type" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div>
              <Select 
                value={filters.city} 
                onValueChange={(value) => handleFilterChange('city', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {NORTHERN_CYPRUS_CITIES.map(city => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tags */}
            <div>
              <Input
                placeholder="Tags (comma-separated)"
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>

            {/* Pricing Frequency */}
            <div>
              <Select 
                value={filters.pricing_frequency} 
                onValueChange={(value) => handleFilterChange('pricing_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pricing Frequency" />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_FREQUENCIES.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div>
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  search: '',
                  listingType: 'all',
                  category: 'all',
                  city: 'all',
                  tags: '',
                  minPrice: '',
                  maxPrice: '',
                  pricing_frequency: 'all',
                  sortBy: 'newest'
                })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {listings.length} of {pagination.totalItems} listings
          {filters.search && ` for "${filters.search}"`}
        </p>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No listings found matching your criteria</p>
          <Button onClick={() => setFilters({
            search: '',
            listingType: 'all',
            category: 'all',
            city: 'all',
            tags: '',
            minPrice: '',
            maxPrice: '',
            pricing_frequency: 'all',
            sortBy: 'newest'
          })}>
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow h-full">
              {/* Image */}
              <Link href={`/listings/${listing.id}`}>
                <div className="relative h-48 overflow-hidden rounded-t-lg cursor-pointer">
                  {listing.primaryImage ? (
                    <Image
                      src={listing.primaryImage}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="secondary" className="bg-white/90">
                      {listing.category}
                    </Badge>
                    {listing.listingType && (
                      <Badge variant="outline" className="bg-blue-100/90 text-blue-800 border-blue-200">
                        {listing.listingType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    )}
                    {listing.is_paid && (
                      <Badge variant="default" className="bg-yellow-500">
                        Premium
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <FavoriteButton
                      listingId={listing.id}
                      isFavorited={listing.isFavorited || false}
                      variant="icon"
                      size="sm"
                      className="bg-white/90 hover:bg-white shadow-sm"
                    />
                    <ReportButton
                      listingId={listing.id}
                      listingTitle={listing.title}
                      variant="icon"
                      size="sm"
                      className="bg-white/90 hover:bg-white shadow-sm text-red-600 hover:text-red-700"
                    />
                  </div>
                </div>
              </Link>

              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Title */}
                <Link href={`/listings/${listing.id}`}>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600">
                    {listing.title}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                  {listing.description}
                </p>

                {/* Tags */}
                {listing.tags && listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {listing.tags.slice(0, 4).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {listing.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200">
                        +{listing.tags.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">
                    {formatPrice(listing.price, listing.pricing_frequency)}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(listing.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {listing.views}
                  </div>
                </div>

                {/* Location */}
                {listing.location?.city && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {NORTHERN_CYPRUS_CITIES.find(city => city.value === listing.location?.city)?.label || listing.location.city}
                    </span>
                  </div>
                )}

                {/* Owner and Actions */}
                <div className="mt-2 pt-2 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    by {listing.owner.firstName && listing.owner.lastName 
                      ? `${listing.owner.firstName} ${listing.owner.lastName}`
                      : listing.owner.username}
                  </p>
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </Button>
          
          {[...Array(pagination.totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={pagination.currentPage === i + 1 ? "default" : "outline"}
              onClick={() => handlePageChange(i + 1)}
              className="w-10"
            >
              {i + 1}
            </Button>
          ))}
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 