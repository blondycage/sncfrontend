"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Search,
  Filter,
  Eye,
  Users,
  Hotel,
  GraduationCap,
  DollarSign,
  Phone,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface RoomVariant {
  type: string;
  capacity: number;
  price: number;
  priceFrequency: string;
  available: boolean;
  description?: string;
}

interface Dormitory {
  _id: string;
  title: string;
  description: string;
  university: {
    name: string;
    isFromDropdown: boolean;
  };
  location: {
    city: string;
    region?: string;
    address: string;
  };
  availability: 'available' | 'running_out' | 'unavailable';
  image_urls: string[];
  roomVariants: RoomVariant[];
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
    preferredMethod: string;
  };
  genderRestriction: 'male' | 'female' | 'mixed';
  views: number;
  inquiries: number;
  createdAt: string;
  facilities?: string[];
}

interface DormitoriesResponse {
  success: boolean;
  data: Dormitory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  count: number;
}

export default function DormitoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [universities, setUniversities] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || 'all',
    university: searchParams.get('university') || 'all',
    availability: searchParams.get('availability') || 'all',
    genderRestriction: searchParams.get('genderRestriction') || 'all',
    roomType: searchParams.get('roomType') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    priceFrequency: searchParams.get('priceFrequency') || 'all',
    sortBy: searchParams.get('sortBy') || 'newest'
  });

  const roomTypes = [
    { value: 'single', label: 'Single Room (1 person)' },
    { value: 'double', label: 'Double Room (2 people)' },
    { value: 'triple', label: 'Triple Room (3 people)' },
    { value: 'quad', label: 'Quad Room (4 people)' },
    { value: 'five_person', label: 'Five Person Room' },
    { value: 'six_person', label: 'Six Person Room' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'views', label: 'Most Viewed' }
  ];

  // Fetch dormitories
  const fetchDormitories = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "12"
      });

      // Add filters, excluding 'all' values and empty strings
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          queryParams.append(key, value);
        }
      });

      console.log('🔍 Fetching dormitories with filters:', filters);
      console.log('🔍 Query params:', queryParams.toString());
      console.log('🔍 University filter value:', filters.university);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dormitories?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch dormitories');
      }

      const data: DormitoriesResponse = await response.json();
      setDormitories(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching dormitories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dormitories. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch universities and cities for dropdowns
  const fetchFilterOptions = async () => {
    try {
      const [universitiesRes, citiesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dormitories/universities`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dormitories/cities`)
      ]);

      if (universitiesRes.ok) {
        const universitiesData = await universitiesRes.json();
        setUniversities(universitiesData.data);
      }

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    fetchDormitories(1);
    fetchFilterOptions();
  }, [filters]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: 'all',
      university: 'all',
      availability: 'all',
      genderRestriction: 'all',
      roomType: 'all',
      minPrice: '',
      maxPrice: '',
      priceFrequency: 'all',
      sortBy: 'newest'
    });
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 border-blue-200">Available</Badge>;
      case 'running_out':
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-gradient-to-r from-red-50 to-orange-50">Running Out</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const getGenderBadge = (gender: string) => {
    const colors = {
      male: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      female: 'bg-gradient-to-r from-red-100 to-pink-200 text-red-800 border-red-300',
      mixed: 'bg-gradient-to-r from-purple-100 to-blue-200 text-purple-800 border-purple-300'
    };

    return (
      <Badge variant="outline" className={colors[gender as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {gender.charAt(0).toUpperCase() + gender.slice(1)}
      </Badge>
    );
  };

  const getPriceRange = (roomVariants: RoomVariant[]) => {
    if (!roomVariants?.length) return 'Contact for pricing';

    const prices = roomVariants.filter(v => v.available).map(v => v.price);
    if (prices.length === 0) return 'Contact for pricing';

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const frequency = roomVariants[0]?.priceFrequency || 'monthly';

    return min === max
      ? `$${min}/${frequency}`
      : `$${min} - $${max}/${frequency}`;
  };

  const getRoomTypesText = (roomVariants: RoomVariant[]) => {
    const availableTypes = roomVariants
      .filter(v => v.available)
      .map(v => v.type)
      .slice(0, 2);

    const moreCount = roomVariants.filter(v => v.available).length - 2;

    return availableTypes.length > 0
      ? `${availableTypes.join(', ')}${moreCount > 0 ? ` +${moreCount} more` : ''}`
      : 'No rooms available';
  };

  const DormitoryCard = ({ dormitory }: { dormitory: Dormitory }) => (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            src={dormitory.image_urls[0] || '/placeholder-dormitory.jpg'}
            alt={dormitory.title}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="absolute top-2 left-2">
          {getAvailabilityBadge(dormitory.availability)}
        </div>
        <div className="absolute top-2 right-2">
          {getGenderBadge(dormitory.genderRestriction)}
        </div>
        {dormitory.image_urls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            +{dormitory.image_urls.length - 1} photos
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-red-600 transition-colors">
              {dormitory.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <GraduationCap className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{dormitory.university.name}</span>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{dormitory.location.city}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{getRoomTypesText(dormitory.roomVariants)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent font-extrabold">
              {getPriceRange(dormitory.roomVariants)}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Eye className="w-4 h-4 mr-1" />
              <span>{dormitory.views}</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => router.push(`/dormitories/${dormitory._id}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DormitoryListItem = ({ dormitory }: { dormitory: Dormitory }) => (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={dormitory.image_urls[0] || '/placeholder-dormitory.jpg'}
              alt={dormitory.title}
              width={200}
              height={130}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {dormitory.image_urls.length > 1 && (
              <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                +{dormitory.image_urls.length - 1}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-red-600 transition-colors line-clamp-2">
                  {dormitory.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  <span>{dormitory.university.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent font-extrabold">
                  {getPriceRange(dormitory.roomVariants)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{dormitory.views}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{dormitory.location.city}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{getRoomTypesText(dormitory.roomVariants)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getAvailabilityBadge(dormitory.availability)}
                {getGenderBadge(dormitory.genderRestriction)}
              </div>
              <Button
                onClick={() => router.push(`/dormitories/${dormitory._id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 shadow-lg border-b">
        <div className="container px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              Student Dormitories in North Cyprus
            </h1>
            <p className="text-lg text-blue-100">
              Find comfortable and affordable student accommodation near your university
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search dormitories..."
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Select value={filters.city} onValueChange={(value) => updateFilters({ city: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* University */}
                <div>
                  <label className="text-sm font-medium mb-2 block">University</label>
                  <Select value={filters.university} onValueChange={(value) => updateFilters({ university: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {universities.map((uni) => (
                        <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <Select value={filters.availability} onValueChange={(value) => updateFilters({ availability: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="running_out">Running Out</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Restriction */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Gender</label>
                  <Select value={filters.genderRestriction} onValueChange={(value) => updateFilters({ genderRestriction: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Room Type</label>
                  <Select value={filters.roomType} onValueChange={(value) => updateFilters({ roomType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                    />
                  </div>
                </div>

                {/* Price Frequency */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Per</label>
                  <Select value={filters.priceFrequency} onValueChange={(value) => updateFilters({ priceFrequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="semester">Semester</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {loading ? 'Loading...' : `${pagination.total || 0} dormitories found`}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : dormitories.length === 0 ? (
              <Card className="p-12 text-center">
                <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No dormitories found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters to find more results.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </Card>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {dormitories.map((dormitory) => (
                    viewMode === 'grid' ? (
                      <DormitoryCard key={dormitory._id} dormitory={dormitory} />
                    ) : (
                      <DormitoryListItem key={dormitory._id} dormitory={dormitory} />
                    )
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => fetchDormitories(pagination.page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {[...Array(pagination.pages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.pages ||
                          (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === pagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => fetchDormitories(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                          return <span key={pageNum} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => fetchDormitories(pagination.page + 1)}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}