"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import { listingsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ListingFormData {
  title: string;
  description: string;
  listingType: 'real_estate' | 'vehicle' | 'other';
  category: 'rental' | 'sale' | 'service';
  tags: string[];
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

const LISTING_TYPES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' }
];

const CATEGORIES = [
  { value: 'rental', label: 'Rental' },
  { value: 'sale', label: 'Sale' },
  { value: 'service', label: 'Service' }
];

const PRICING_FREQUENCIES = {
  rental: [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'weekly', label: 'Per Week' },
    { value: 'monthly', label: 'Per Month' },
   
  ],
  sale: [
    { value: 'fixed', label: 'Fixed Price' }
  ],
  service: [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'fixed', label: 'Fixed Rate' },
    { value: 'per_project', label: 'Per Project' }
  ]
};

// Common tags suggestions for each listing type
const SUGGESTED_TAGS = {
  real_estate: ['apartment', 'house', 'studio', 'furnished', 'unfurnished', 'balcony', 'parking', 'central', 'beachfront', 'mountain view'],
  vehicle: ['automatic', 'manual', 'petrol', 'diesel', 'electric', 'suv', 'sedan', 'hatchback', 'motorcycle', 'bicycle'],
  other: ['electronics', 'furniture', 'clothing', 'books', 'sports', 'tools', 'kitchen', 'garden', 'antique', 'handmade']
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

export function CreateListingForm() {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    listingType: 'other',
    category: 'sale',
    tags: [],
    price: 0,
    pricing_frequency: '',
    image_urls: [],
    contact: {},
    location: {}
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState('');
  const router = useRouter();

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle nested object changes (contact, location)
  const handleNestedChange = (parent: 'contact' | 'location', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle image URLs change
  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      image_urls: urls
    }));
  };

  // Handle adding tags
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
    }
  };

  // Handle removing tags
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle adding suggested tag
  const addSuggestedTag = (tag: string) => {
    addTag(tag);
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(currentTag);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.listingType) {
      newErrors.listingType = 'Listing type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.pricing_frequency) {
      newErrors.pricing_frequency = 'Pricing frequency is required';
    }

    if (formData.image_urls.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 FORM SUBMISSION STARTED');
    console.log('📋 Form Data State:', formData);
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please log in to create a listing');
        router.push('/auth/login');
        return;
      }

      console.log('🔑 Auth token found:', token ? 'Yes' : 'No');

      // Create the listing with the correct structure for backend validation
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        listingType: formData.listingType,
        category: formData.category,
        tags: formData.tags,
        price: Number(formData.price),
        pricing_frequency: formData.pricing_frequency,
        image_urls: formData.image_urls,
        // Only include contact and location if they have values
        ...(Object.keys(formData.contact).length > 0 && { contact: formData.contact }),
        ...(Object.keys(formData.location).length > 0 && { location: formData.location })
      };

      // Debug validation
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Title:', listingData.title, 'Length:', listingData.title.length);
      console.log('Description:', listingData.description, 'Length:', listingData.description.length);
      console.log('Listing Type:', listingData.listingType);
      console.log('Category:', listingData.category);
      console.log('Tags:', listingData.tags);
      console.log('Price:', listingData.price, 'Type:', typeof listingData.price);
      console.log('Pricing Frequency:', listingData.pricing_frequency);
      console.log('Image URLs:', listingData.image_urls);
      console.log('Contact:', listingData.contact);
      console.log('Location:', listingData.location);
      console.log('Full payload being sent:', JSON.stringify(listingData, null, 2));
      console.log('=== END DEBUG ===');

      console.log('📡 Calling API...');
      const response = await listingsApi.createFreeListing(listingData, token);
      console.log('✅ API Response:', response);

      if (response.success) {
        toast.success('Listing created successfully!');
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      toast.error(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Listing</CardTitle>
        <CardDescription>
          Fill out the form below to create your listing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter listing title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Listing Type */}
            <div>
              <Label htmlFor="listingType">Listing Type *</Label>
              <Select 
                value={formData.listingType} 
                onValueChange={(value) => handleChange('listingType', value as 'real_estate' | 'vehicle' | 'other')}
              >
                <SelectTrigger className={errors.listingType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.listingType && <p className="text-red-500 text-sm mt-1">{errors.listingType}</p>}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleChange('category', value as 'rental' | 'sale' | 'service')}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
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
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Pricing Frequency */}
            {formData.category && (
              <div className="md:col-span-2">
                <Label htmlFor="pricing_frequency">Pricing Frequency *</Label>
                <Select 
                  value={formData.pricing_frequency} 
                  onValueChange={(value) => handleChange('pricing_frequency', value)}
                >
                  <SelectTrigger className={errors.pricing_frequency ? 'border-red-500' : ''}>
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
                {errors.pricing_frequency && <p className="text-red-500 text-sm mt-1">{errors.pricing_frequency}</p>}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your listing in detail..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (Optional)</Label>
            <p className="text-sm text-gray-600 mb-2">Add up to 10 tags to make your listing more searchable</p>
            
            {/* Tag Input */}
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter a tag and press Enter or comma..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyPress}
                className="flex-1"
                maxLength={30}
              />
              <Button
                type="button"
                onClick={() => addTag(currentTag)}
                disabled={!currentTag.trim() || formData.tags.length >= 10}
                variant="outline"
              >
                Add
              </Button>
            </div>

            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            {formData.listingType && SUGGESTED_TAGS[formData.listingType] && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Suggested tags for {LISTING_TYPES.find(t => t.value === formData.listingType)?.label}:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS[formData.listingType]
                    .filter(tag => !formData.tags.includes(tag))
                    .slice(0, 8)
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addSuggestedTag(tag)}
                        disabled={formData.tags.length >= 10}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <Label>Images *</Label>
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={5}
              maxSize={10}
              className="mt-2"
              useUploadApi={true}
            />
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
          </div>

          {/* Contact Information */}
          <div>
            <Label className="text-lg font-medium">Contact Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contact.phone || ''}
                  onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contact.email || ''}
                  onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contact.whatsapp || ''}
                  onChange={(e) => handleNestedChange('contact', 'whatsapp', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-lg font-medium">Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.location.address || ''}
                  onChange={(e) => handleNestedChange('location', 'address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Select 
                  value={formData.location.city || ''} 
                  onValueChange={(value) => handleNestedChange('location', 'city', value)}
                >
                  <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
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
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  type="text"
                  placeholder="NY"
                  value={formData.location.region || ''}
                  onChange={(e) => handleNestedChange('location', 'region', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 