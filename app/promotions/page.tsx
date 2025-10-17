'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Star, 
  TrendingUp, 
  Globe, 
  Search, 
  Plus,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Filter,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { promotionsApi, listingsApi } from '@/lib/api';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    frequency?: string;
  };
  category: string;
  location: {
    city: string;
    area: string;
  };
  images: string[];
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  views: number;
}

interface PromotionConfig {
  prices: {
    homepage: Array<{ days: number; amount: number; currency: string }>;
    category_top: Array<{ days: number; amount: number; currency: string }>;
  };
  chains: Array<{
    name: string;
    displayName: string;
    enabled: boolean;
  }>;
}

export default function PromotionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [config, setConfig] = useState<PromotionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [configResponse, listingsResponse] = await Promise.all([
        promotionsApi.getPublicConfig(),
        listingsApi.getUserListings(localStorage.getItem('authToken') || '')
      ]);

      if (configResponse.success) {
        setConfig(configResponse.data);
      }

      if (listingsResponse.success) {
        setUserListings(listingsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promotion data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = userListings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Star className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Promote Your Listings
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get more visibility and reach more potential customers
            </p>
            <Link href="/auth/login">
              <Button size="lg">
                Sign In to Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Boost Your Listings
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Get premium placement and reach thousands of potential customers
            </p>
            <div className="flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 mr-2" />
                <span>Increase Visibility</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-6 w-6 mr-2" />
                <span>More Views</span>
              </div>
              <div className="flex items-center">
                <Star className="h-6 w-6 mr-2" />
                <span>Premium Placement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Promotion Plans */}
        {config && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Promotion Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Homepage Hero */}
              <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-yellow-600" />
                    Homepage Hero
                    <Badge className="bg-yellow-500 text-yellow-900">Premium</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Featured prominently on the homepage for maximum visibility
                    </p>
                    <div className="space-y-2">
                      {config.prices.homepage.map((price, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{price.days} days</span>
                          <span className="font-bold">{formatPrice(price.amount, price.currency)}</span>
                        </div>
                      ))}
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ Homepage banner placement</li>
                      <li>✓ Maximum visibility</li>
                      <li>✓ Priority in search results</li>
                      <li>✓ Mobile-optimized display</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Category Top */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    Category Top
                    <Badge variant="outline">Popular</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Appear at the top of your category for targeted exposure
                    </p>
                    <div className="space-y-2">
                      {config.prices.category_top.map((price, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{price.days} days</span>
                          <span className="font-bold">{formatPrice(price.amount, price.currency)}</span>
                        </div>
                      ))}
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ Top of category listings</li>
                      <li>✓ Targeted audience</li>
                      <li>✓ Category page prominence</li>
                      <li>✓ Increased click-through rate</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Your Listings */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Listings</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Link href="/create-listing">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Listing
                </Button>
              </Link>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  {userListings.length === 0 ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">No listings yet</h3>
                      <p className="text-gray-600">Create your first listing to start promoting it</p>
                      <Link href="/create-listing">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Listing
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">No listings found</h3>
                      <p className="text-gray-600">Try adjusting your search terms</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={listing.images[0] || '/placeholder.jpg'}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90">
                        {listing.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location.city}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views} views
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(listing.price.amount, listing.price.currency)}
                        {listing.price.frequency && (
                          <span className="text-sm text-gray-500">/{listing.price.frequency}</span>
                        )}
                      </div>
                      <Link href={`/promotions/create?listing=${listing._id}`}>
                        <Button size="sm">
                          <Star className="h-4 w-4 mr-2" />
                          Promote
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Choose Your Listing</h3>
              <p className="text-gray-600">Select the listing you want to promote from your collection</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Select Placement</h3>
              <p className="text-gray-600">Choose between Homepage Hero or Category Top placement</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Make Payment</h3>
              <p className="text-gray-600">Pay securely using cryptocurrency and upload proof</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Go Live</h3>
              <p className="text-gray-600">Your promotion goes live after admin approval</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Boost Your Listing?</h2>
              <p className="text-blue-100 mb-6">
                Join thousands of users who have successfully promoted their listings
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/promotions/create">
                  <Button size="lg" variant="secondary">
                    Start Promoting Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/promotions/history">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                    View Promotion History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
