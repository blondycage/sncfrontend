"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface ListingFormData {
  title: string;
  description: string;
  category: 'rental' | 'sale' | 'service';
  price: number;
  pricing_frequency: string;
  image_urls: string[];
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
}

const CATEGORIES = [
  { value: 'rental', label: 'Rental' },
  { value: 'sale', label: 'Sale' },
  { value: 'service', label: 'Service' }
];

const PRICING_FREQUENCIES = {
  rental: [
    { value: 'daily', label: 'Per Day' },
    { value: 'weekly', label: 'Per Week' },
    { value: 'monthly', label: 'Per Month' },
    { value: 'yearly', label: 'Per Year' },
    { value: 'negotiable', label: 'Negotiable' }
  ],
  sale: [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'negotiable', label: 'Negotiable' },
    { value: 'free', label: 'Free' }
  ],
  service: [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'fixed', label: 'Fixed Rate' },
    { value: 'negotiable', label: 'Negotiable' },
    { value: 'free', label: 'Free' },
    { value: 'yearly', label: 'Per Year' }
  ]
};

const NORTHERN_CYPRUS_CITIES = [
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

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    category: 'sale',
    price: 0,
    pricing_frequency: '',
    image_urls: [],
    contact: {},
    location: {}
  });

  useEffect(() => {
    fetchListingData();
  }, [listingId]);

  const fetchListingData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }

      const data = await response.json();
      const listing = data.data || data.listing;

      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || 'sale',
        price: listing.price || 0,
        pricing_frequency: listing.pricing_frequency || '',
        image_urls: listing.image_urls || [],
        contact: listing.contact || {},
        location: listing.location || {}
      });
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch listing');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: 'contact' | 'location', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      image_urls: urls
    }));
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }

    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (formData.description.length < 20) {
      setError('Description must be at least 20 characters');
      return false;
    }

    if (!formData.category) {
      setError('Category is required');
      return false;
    }

    if (!formData.price || formData.price <= 0) {
      setError('Valid price is required');
      return false;
    }

    if (!formData.pricing_frequency) {
      setError('Pricing frequency is required');
      return false;
    }

    if (formData.image_urls.length === 0) {
      setError('At least one image is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: Number(formData.price),
        pricing_frequency: formData.pricing_frequency,
        image_urls: formData.image_urls,
        ...(Object.keys(formData.contact).length > 0 && { contact: formData.contact }),
        ...(Object.keys(formData.location).length > 0 && { location: formData.location })
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update listing');
      }

      toast({
        title: "Success!",
        description: "Listing updated successfully",
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Update listing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Listing</h1>
            <p className="text-muted-foreground">Update your listing details</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential listing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter listing title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value as 'rental' | 'sale' | 'service')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              {formData.category && (
                <div className="space-y-2">
                  <Label htmlFor="pricing_frequency">Pricing Frequency *</Label>
                  <Select 
                    value={formData.pricing_frequency} 
                    onValueChange={(value) => handleInputChange('pricing_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_FREQUENCIES[formData.category]?.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description and Images */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Description and images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your listing in detail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Images *</Label>
                <ImageUpload
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  maxSize={10}
                  className="mt-2"
                  useUploadApi={true}
                  initialImages={formData.image_urls}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How buyers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+90 (555) 123-4567"
                  value={formData.contact.phone || ''}
                  onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contact.email || ''}
                  onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+90 (555) 123-4567"
                  value={formData.contact.whatsapp || ''}
                  onChange={(e) => handleNestedChange('contact', 'whatsapp', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where is this located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={formData.location.address || ''}
                  onChange={(e) => handleNestedChange('location', 'address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select 
                  value={formData.location.city || ''} 
                  onValueChange={(value) => handleNestedChange('location', 'city', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
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
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="Region/District"
                  value={formData.location.region || ''}
                  onChange={(e) => handleNestedChange('location', 'region', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Listing</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 
