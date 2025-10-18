"use client";

import { useState, useEffect, useRef } from 'react';
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
  X,
  MessageCircle
} from 'lucide-react';
import { useToast } from "@/components/ui/toast";
import PromoteModal from "@/components/promotions/PromoteModal";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { ReportButton } from "@/components/ui/report-button";
import { ShareDropdown } from "@/components/share-dropdown";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: 'rental' | 'sale' | 'service';
  price: number;
  pricing_frequency: string;
  currency?: string;
  image_urls: string[];
  video_url?: string;
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
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentType: 'service_payment',
    chain: 'eth',
    amount: 0
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
    
    // Cleanup function to abort ongoing requests and reset state
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchingRef.current = false;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchListing = async () => {
    // Prevent multiple simultaneous requests
    if (fetchingRef.current) {
      console.log('🚫 Request already in progress, skipping...');
      return;
    }
    
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    fetchingRef.current = true;
    
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching listing:', id);
      
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, {
        headers,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Listing not found');
        }
        throw new Error('Failed to fetch listing');
      }

      const data = await response.json();
      console.log('✅ Listing fetched successfully');
      setListing(data.data);
      setIsFavorited(data.data.isFavorited || false);
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔄 Request aborted');
        return;
      }
      console.error('❌ Error fetching listing:', error);
      setError(error instanceof Error ? error.message : 'Failed to load listing');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      abortControllerRef.current = null;
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

  const handlePayment = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to make payments",
        variant: "error"
      });
      router.push('/auth/login');
      return;
    }

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "error"
      });
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemType: 'listing',
          itemId: listing?._id,
          paymentType: 'service_payment',
          chain: paymentData.chain,
          amount: paymentData.amount,
          description: `Payment for ${listing?.title}`,
          serviceDetails: {
            listingTitle: listing?.title,
            listingCategory: listing?.category,
            ownerName: listing?.owner?.firstName + ' ' + listing?.owner?.lastName,
            ownerContact: listing?.owner?.email
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      const data = await response.json();
      
      toast({
        title: "Payment Created",
        description: `Payment request for ${paymentData.amount} USD created successfully.`
      });

      // Redirect to payment page or show payment details
      router.push(`/payments/${data.data.payment._id}`);
      
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create payment",
        variant: "error"
      });
    } finally {
      setPaymentLoading(false);
      setPaymentOpen(false);
    }
  };

  const formatPrice = (price: number, frequency: string, currency: string = 'USD') => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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

  const handleWhatsAppMessage = () => {
    const phone = listing?.contact?.phone || listing?.contact?.whatsapp;
    if (!phone) {
      toast({
        title: "No Contact Number",
        description: "No contact number available for this listing",
        variant: "error"
      });
      return;
    }
    
    const listingUrl = `${window.location.origin}/listings/${listing._id}`;
    const message = `Hi I am interested in ${listing.title} from searchnorthcyprus.org ${listingUrl}`;
    const whatsappUrl = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="relative w-full h-full max-w-5xl max-h-full flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-white/20 backdrop-blur border-white/20"
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
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur border-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur border-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {currentImageIndex + 1} / {listing.image_urls.length}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blue">
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
    <div className="min-h-screen bg-gradient-blue">
      <ImageModal />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm sm:text-base"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Back</span>
            </Button>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <FavoriteButton
                listingId={listing._id}
                isFavorited={listing.isFavorited || false}
                size="sm"
              />

              <ShareDropdown
                title={listing.title}
                description={listing.description}
                variant="outline"
                size="sm"
              />

              {!listing.isOwner && (
                <ReportButton
                  listingId={listing._id}
                  listingTitle={listing.title}
                  size="sm"
                />
              )}
              
              {listing.isOwner && (
                <div className="flex gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setPromoteOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    Promote
                  </Button>
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
            </div>
            
            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-1">
              <FavoriteButton
                listingId={listing._id}
                isFavorited={listing.isFavorited || false}
                size="sm"
              />
              <ShareDropdown
                title={listing.title}
                description={listing.description}
                variant="outline"
                size="sm"
              />
              {listing.isOwner && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setPromoteOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden bg-white border-b px-4 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {listing.isOwner ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/listings/${id}/edit`)}
                className="whitespace-nowrap"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="text-red-600 hover:text-red-700 whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          ) : (
            <ReportButton
              listingId={listing._id}
              listingTitle={listing.title}
              size="sm"
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PromoteModal open={promoteOpen} onOpenChange={setPromoteOpen} listingId={String(id)} listingCategory={listing.category} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                {listing.image_urls.length > 0 ? (
                  <div className="relative">
                    <img
                      src={listing.image_urls[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-48 xs:h-64 sm:h-80 lg:h-96 object-cover rounded-t-lg cursor-pointer"
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
                  <div className="w-full h-48 xs:h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <CategoryIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Thumbnail strip */}
                {listing.image_urls.length > 1 && (
                  <div className="p-3 sm:p-4 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {listing.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${listing.title} ${index + 1}`}
                        className={`w-14 h-14 sm:w-16 sm:h-16 object-cover rounded cursor-pointer border-2 flex-shrink-0 ${
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
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <CategoryIcon className="h-5 w-5 text-gray-500" />
                    <Badge variant="secondary" className="text-xs sm:text-sm">{listing.category}</Badge>
                    <Badge className={`${getStatusColor(listing.status, listing.moderationStatus)} text-xs sm:text-sm`}>
                      {getStatusText(listing.status, listing.moderationStatus)}
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">{listing.title}</h1>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
                    {formatPrice(listing.price, listing.pricing_frequency, listing.currency)}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{listing.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base leading-relaxed">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Video (YouTube) */}
            {listing.video_url && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Video Tour</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <iframe
                      className="h-full w-full"
                      src={(function(url:string){
                        try {
                          const u=new URL(url);
                          // YouTube watch or share links -> embed
                          if (u.hostname.includes('youtube.com')) {
                            const v=u.searchParams.get('v');
                            if (v) return `https://www.youtube.com/embed/${v}`;
                            // youtu.be with /embed or other paths
                            if (u.pathname.startsWith('/embed/')) return url;
                          }
                          if (u.hostname.includes('youtu.be')) {
                            const id=u.pathname.replace('/','');
                            if (id) return `https://www.youtube.com/embed/${id}`;
                          }
                          return url;
                        } catch { return url; }
                      })(listing.video_url)}
                      title="YouTube video player"
                      frameBorder={0}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            {(listing.location.address || listing.location.city) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {listing.location.address && (
                      <p className="text-gray-700 text-sm sm:text-base">{listing.location.address}</p>
                    )}
                    <div className="flex flex-wrap gap-1 text-xs sm:text-sm text-gray-500">
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
          <div className="space-y-4 sm:space-y-6">
            {/* Owner Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Listed by
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={listing.owner.avatar} />
                    <AvatarFallback className="text-sm">
                      {listing.owner.firstName?.[0] || listing.owner.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {listing.owner.firstName && listing.owner.lastName 
                        ? `${listing.owner.firstName} ${listing.owner.lastName}` 
                        : listing.owner.username}
                    </p>
                    {listing.owner.role && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {listing.owner.role}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleWhatsAppMessage}
                    className="w-full text-sm sm:text-base bg-green-600 hover:bg-green-700" 
                    size="sm"
                    disabled={!listing?.contact?.phone && !listing?.contact?.whatsapp}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp Owner
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-sm sm:text-base opacity-50 cursor-not-allowed" 
                    size="sm"
                    disabled={true}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Telegram (Coming Soon)
                  </Button>
                  
                  {/* Pay Now Button - Only show for non-owners */}
                  {!listing.isOwner && (
                    <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full text-sm sm:text-base bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                          size="sm"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay for Service
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Pay for Service</DialogTitle>
                          <DialogDescription>
                            Pay the owner directly for this {listing?.category?.toLowerCase() || 'service'}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="bg-gradient-blue p-3 rounded-lg">
                            <h4 className="font-semibold text-sm">{listing?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Owner: {listing?.owner?.firstName} {listing?.owner?.lastName}
                            </p>
                            {listing?.price && (
                              <p className="text-sm text-muted-foreground">
                                Listed Price: {formatPrice(listing.price, listing.pricing_frequency || 'one-time', listing.currency)}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="amount">Payment Amount (USD)</Label>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={paymentData.amount || ''}
                              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                              className="mt-1"
                              min="0"
                              step="0.01"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter the agreed amount with the service provider
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="chain">Payment Method</Label>
                            <Select 
                              value={paymentData.chain} 
                              onValueChange={(value) => setPaymentData(prev => ({ ...prev, chain: value }))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                                <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                                <SelectItem value="usdt_erc20">USDT (ERC20)</SelectItem>
                                <SelectItem value="usdt_trc20">USDT (TRC20)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handlePayment}
                            disabled={paymentLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {paymentLoading ? 'Creating...' : 'Proceed to Payment'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            {(listing.contact.phone || listing.contact.email || listing.contact.whatsapp) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {listing.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <a href={`tel:${listing.contact.phone}`} className="text-blue-600 hover:underline text-sm sm:text-base break-all">
                        {listing.contact.phone}
                      </a>
                    </div>
                  )}
                  {listing.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <a href={`mailto:${listing.contact.email}`} className="text-blue-600 hover:underline text-sm sm:text-base break-all">
                        {listing.contact.email}
                      </a>
                    </div>
                  )}
                  {listing.contact.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={`https://wa.me/${listing.contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi I am interested in ${listing.title} from searchnorthcyprus.org ${window.location.href}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline text-sm sm:text-base break-all"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Safety Tips</CardTitle>
                <CardDescription className="text-sm">Please keep these safety tips in mind</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <p className="text-xs sm:text-sm">• Meet in a public place for viewings and transactions</p>
                <p className="text-xs sm:text-sm">• Never send money or payments before seeing the property</p>
                <p className="text-xs sm:text-sm">• Be wary of deals that seem too good to be true</p>
                <p className="text-xs sm:text-sm">• Report suspicious listings or behavior</p>
              </CardContent>
            </Card>

            {/* Report Button */}
            {!listing.isOwner && (
              <Card className="lg:block hidden">
                <CardContent className="pt-6">
                  <Button 
                    variant="outline" 
                    className="w-full text-sm sm:text-base" 
                    onClick={handleReport}
                    disabled={actionLoading === 'report'}
                    size="sm"
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
