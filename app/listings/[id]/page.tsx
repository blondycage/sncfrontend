"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Eye, 
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Flag,
  User,
  Building,
  Home,
  ShoppingCart,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: 'rental' | 'sale' | 'service';
  price: number;
  pricing_frequency: string;
  image_urls: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  moderationStatus: string;
  expiresAt: string;
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  location: {
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  owner: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: string;
    phone?: string;
    email?: string;
  };
  isFavorited?: boolean;
  isOwner?: boolean;
  listingType?: string;
  tags?: string[];
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Listing not found');
        }
        throw new Error('Failed to fetch listing');
      }

      const data = await response.json();
      setListing(data.data);
      setIsFavorited(data.data.isFavorited || false);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError(error instanceof Error ? error.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to add favorites",
        variant: "error"
      });
      router.push('/auth/login');
      return;
    }

    setActionLoading('favorite');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}/favorite`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      setIsFavorited(!isFavorited);
      toast({
        title: "Success",
        description: isFavorited ? "Removed from favorites" : "Added to favorites"
      });
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Listing link copied to clipboard"
      });
    }
  };

  const handleReport = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to report listings",
        variant: "error"
      });
      router.push('/auth/login');
      return;
    }

    setActionLoading('report');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Inappropriate content' })
      });

      if (!response.ok) {
        throw new Error('Failed to report listing');
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this listing. We'll review it shortly."
      });
    } catch (error) {
      console.error('Error reporting listing:', error);
      toast({
        title: "Error",
        description: "Failed to report listing",
        variant: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setActionLoading('delete');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number, frequency: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);

    if (frequency === 'fixed') return formattedPrice;
    return `${formattedPrice}/${frequency}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rental': return Home;
      case 'sale': return ShoppingCart;
      case 'service': return Briefcase;
      default: return Building;
    }
  };

  const getStatusColor = (status: string, moderationStatus: string) => {
    if (moderationStatus === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (moderationStatus === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'expired') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, moderationStatus: string) => {
    if (moderationStatus === 'pending') return 'Pending Review';
    if (moderationStatus === 'rejected') return 'Rejected';
    if (status === 'active') return 'Active';
    if (status === 'expired') return 'Expired';
    return status;
  };

  const nextImage = () => {
    if (listing && listing.image_urls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.image_urls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing && listing.image_urls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.image_urls.length - 1 : prev - 1
      );
    }
  };

  const ImageModal = () => {
    if (!showImageModal || !listing || listing.image_urls.length === 0) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-full">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur"
            onClick={() => setShowImageModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <img
            src={listing.image_urls[currentImageIndex]}
            alt={listing.title}
            className="max-w-full max-h-full object-contain"
          />
          
          {listing.image_urls.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {listing.image_urls.length}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Building className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Listing Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/listings')}>
              Browse Other Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const CategoryIcon = getCategoryIcon(listing.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <ImageModal />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                disabled={actionLoading === 'favorite'}
                className={isFavorited ? 'text-red-500 border-red-200' : ''}
              >
                <Heart className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              {listing.isOwner && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/listings/${id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={actionLoading === 'delete'}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
              
              {!listing.isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                  disabled={actionLoading === 'report'}
                  className="text-red-600 hover:text-red-700"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                {listing.image_urls.length > 0 ? (
                  <div className="relative">
                    <img
                      src={listing.image_urls[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-64 sm:h-96 object-cover rounded-t-lg cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    />
                    
                    {listing.image_urls.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {currentImageIndex + 1} / {listing.image_urls.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-96 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <CategoryIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Thumbnail strip */}
                {listing.image_urls.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {listing.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${listing.title} ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Title and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon className="h-5 w-5 text-gray-500" />
                      <Badge variant="secondary">{listing.category}</Badge>
                      <Badge className={getStatusColor(listing.status, listing.moderationStatus)}>
                        {getStatusText(listing.status, listing.moderationStatus)}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(listing.price, listing.pricing_frequency)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Location */}
            {(listing.location.address || listing.location.city) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {listing.location.address && (
                      <p className="text-gray-700">{listing.location.address}</p>
                    )}
                    <div className="flex gap-2 text-sm text-gray-500">
                      {listing.location.city && <span>{listing.location.city}</span>}
                      {listing.location.region && <span>• {listing.location.region}</span>}
                      {listing.location.country && <span>• {listing.location.country}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Listed by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.owner.avatar} />
                    <AvatarFallback>
                      {listing.owner.firstName?.[0] || listing.owner.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {listing.owner.firstName && listing.owner.lastName 
                        ? `${listing.owner.firstName} ${listing.owner.lastName}` 
                        : listing.owner.username}
                    </p>
                    {listing.owner.role && (
                      <Badge variant="outline" className="text-xs">
                        {listing.owner.role}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button className="w-full mb-2">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            {(listing.contact.phone || listing.contact.email || listing.contact.whatsapp) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {listing.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${listing.contact.phone}`} className="text-blue-600 hover:underline">
                        {listing.contact.phone}
                      </a>
                    </div>
                  )}
                  {listing.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${listing.contact.email}`} className="text-blue-600 hover:underline">
                        {listing.contact.email}
                      </a>
                    </div>
                  )}
                  {listing.contact.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`https://wa.me/${listing.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        WhatsApp: {listing.contact.whatsapp}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Safety Tips */}
            <Card className="bg-yellow-50">
              <CardHeader>
                <CardTitle>Safety Tips</CardTitle>
                <CardDescription>Please keep these safety tips in mind</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">• Meet in a public place for viewings and transactions</p>
                <p className="text-sm">• Never send money or payments before seeing the property</p>
                <p className="text-sm">• Be wary of deals that seem too good to be true</p>
                <p className="text-sm">• Report suspicious listings or behavior</p>
              </CardContent>
            </Card>

            {/* Report Button */}
            {!listing.isOwner && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleReport}
                    disabled={actionLoading === 'report'}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}