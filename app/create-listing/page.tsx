"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Upload, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Home,
  ShoppingCart,
  Briefcase,
  Image as ImageIcon,
  Car,
  Building,
  Package
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { listingsApi, uploadApi } from "@/lib/api";

interface ListingFormData {
  title: string;
  description: string;
  listingType: 'real_estate' | 'vehicle' | 'other';
  category: 'rental' | 'sale' | 'service' | '';
  tags: string[];
  price: string;
  currency: string;
  pricing_frequency: string;
  image_urls: string[];
  video_url?: string;
  contact: {
    phone: string;
    email: string;
    preferredMethod: string;
  };
  location: {
    city: string;
    region: string;
    address: string;
  };
}

const LISTING_TYPES = [
  { value: 'real_estate', label: 'Real Estate', icon: Building, description: 'Properties, apartments, houses' },
  { value: 'vehicle', label: 'Vehicle', icon: Car, description: 'Cars, motorcycles, boats' },
  { value: 'other', label: 'Other', icon: Package, description: 'Electronics, furniture, services' }
];

const CATEGORIES = [
  { value: 'rental', label: 'Rental', icon: Home, description: 'Properties for rent' },
  { value: 'sale', label: 'Sale', icon: ShoppingCart, description: 'Items for sale' },
  { value: 'service', label: 'Service', icon: Briefcase, description: 'Services offered' }
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'TRY', label: 'Turkish Lira', symbol: '₺' }
];

const PRICING_FREQUENCIES = {
  rental: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'negotiable', label: 'Negotiable' }
  ],
  sale: [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'negotiable', label: 'Negotiable' },
    { value: 'free', label: 'Free' }
  ],
  service: [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'negotiable', label: 'Negotiable' },
    { value: 'free', label: 'Free' },
    { value: 'yearly', label: 'Yearly' }
  ]
};

// Suggested tags for each listing type
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

export default function CreateListingPage() {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    listingType: 'other',
    category: '',
    tags: [],
    price: '',
    currency: 'USD',
    pricing_frequency: '',
    image_urls: [],
    video_url: '',
    contact: {
      phone: '',
      email: '',
      preferredMethod: 'phone'
    },
    location: {
      city: '',
      region: '',
      address: ''
    }
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [step, setStep] = useState(1);

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof ListingFormData];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleListingTypeChange = (listingType: string) => {
    setFormData(prev => ({
      ...prev,
      listingType: listingType as 'real_estate' | 'vehicle' | 'other',
      tags: [] // Reset tags when listing type changes
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: category as 'rental' | 'sale' | 'service',
      pricing_frequency: '' // Reset pricing frequency when category changes
    }));
  };

  // Tag management functions
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

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSuggestedTag = (tag: string) => {
    addTag(tag);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(currentTag);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const total = selectedFiles.length + formData.image_urls.length + files.length;
    if (total > 10) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 10 images",
        variant: "error"
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    
    try {
      new URL(imageUrlInput);
      const total = selectedFiles.length + formData.image_urls.length + 1;
      if (total > 10) {
        toast({
          title: "Too many images",
          description: "You can add a maximum of 10 images",
          variant: "error"
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "error"
      });
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (formData.title.length < 5) return 'Title must be at least 5 characters';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.description.length < 10) return 'Description must be at least 10 characters';
    if (!formData.listingType) return 'Listing type is required';
    if (!formData.category) return 'Category is required';
    if (!formData.price) return 'Price is required';
    if (parseFloat(formData.price) <= 0) return 'Price must be greater than 0';
    if (!formData.pricing_frequency) return 'Pricing frequency is required';
    if (selectedFiles.length === 0 && formData.image_urls.length === 0) {
      return 'At least one image is required';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let allImageUrls = [...formData.image_urls];

      // First upload any selected files to get their URLs
      if (selectedFiles.length > 0) {
        try {
          const uploadResult = await uploadApi.uploadImages(selectedFiles);
          allImageUrls = [...allImageUrls, ...uploadResult.data.urls];
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload images. Please try again.');
        }
      }

      // Now create the listing with all image URLs
      const listingData: any = {
        title: formData.title,
        description: formData.description,
        listingType: formData.listingType,
        category: formData.category as 'rental' | 'sale' | 'service',
        tags: formData.tags,
        price: parseFloat(formData.price),
        currency: formData.currency,
        pricing_frequency: formData.pricing_frequency,
        image_urls: allImageUrls,
        contact: formData.contact,
        location: formData.location
      };

      if (formData.video_url && formData.video_url.trim()) {
        listingData.video_url = formData.video_url.trim();
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const result = await listingsApi.createFreeListing(listingData, token);

      toast({
        title: "Success! 🎉",
        description: "Your listing has been created successfully",
        variant: "default"
      });
if(user?.role === "admin"){
  router.push('/admin/listings');
}else{
  router.push('/dashboard');
}

    } catch (error: any) {
      console.error('Error creating listing:', error);
      const errorMessage = error?.message || 'Failed to create listing. Please try again.';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title.trim() || !formData.description.trim() || !formData.listingType || !formData.category) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to create a listing</p>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Free Listing</h1>
          <p className="text-gray-600">Share your rental, item for sale, or service with the community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Tags</span>
            <span>Details</span>
            <span>Images</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about what you're offering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Beautiful 2BR Apartment, iPhone 13 Pro, Web Development Services"
                    maxLength={100}
                  />
                  <p className="text-sm text-gray-500">{formData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of your listing..."
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-sm text-gray-500">{formData.description.length}/2000 characters</p>
                </div>

                {/* Listing Type */}
                <div className="space-y-2">
                  <Label>Listing Type *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {LISTING_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`
                            p-4 border rounded-lg cursor-pointer transition-all
                            ${formData.listingType === type.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => handleListingTypeChange(type.value)}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-6 w-6 text-blue-600" />
                            <div>
                              <h3 className="font-medium">{type.label}</h3>
                              <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div
                          key={category.value}
                          className={`
                            p-4 border rounded-lg cursor-pointer transition-all
                            ${formData.category === category.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => handleCategoryChange(category.value)}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-6 w-6 text-blue-600" />
                            <div>
                              <h3 className="font-medium">{category.label}</h3>
                              <p className="text-sm text-gray-500">{category.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Tags */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Add tags to make your listing more searchable (up to 10 tags)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Tag Input */}
                <div className="space-y-2">
                  <Label>Add Tags (Optional)</Label>
                  <div className="flex gap-2">
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
                </div>

                {/* Current Tags */}
                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your Tags ({formData.tags.length}/10)</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-gray-500 hover:text-gray-700 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Tags */}
                {formData.listingType && SUGGESTED_TAGS[formData.listingType] && (
                  <div className="space-y-2">
                    <Label>Suggested Tags for {LISTING_TYPES.find(t => t.value === formData.listingType)?.label}</Label>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_TAGS[formData.listingType]
                        .filter(tag => !formData.tags.includes(tag))
                        .slice(0, 10)
                        .map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSuggestedTag(tag)}
                            disabled={formData.tags.length >= 10}
                            className="text-sm"
                          >
                            + {tag}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing and Details */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Details</CardTitle>
                <CardDescription>
                  Set your price and provide additional information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Price and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Currency Selection */}
                  <div className="space-y-2">
                    <Label>Currency *</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleInputChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{currency.symbol}</span>
                              <span>{currency.label}</span>
                              <span className="text-gray-500">({currency.value})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {CURRENCIES.find(c => c.value === formData.currency)?.symbol || '$'}
                      </span>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Frequency */}
                {formData.category && (
                  <div className="space-y-2">
                    <Label>Pricing Frequency *</Label>
                    <Select
                      value={formData.pricing_frequency}
                      onValueChange={(value) => handleInputChange('pricing_frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICING_FREQUENCIES[formData.category as keyof typeof PRICING_FREQUENCIES]?.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.contact.phone}
                        onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                        placeholder="+90 555 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => handleInputChange('contact.email', e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Contact Method</Label>
                    <Select
                      value={formData.contact.preferredMethod}
                      onValueChange={(value) => handleInputChange('contact.preferredMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select
                        value={formData.location.city}
                        onValueChange={(value) => handleInputChange('location.city', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {NORTHERN_CYPRUS_CITIES.map((city) => (
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
                        value={formData.location.region}
                        onChange={(e) => handleInputChange('location.region', e.target.value)}
                        placeholder="Kyrenia"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.location.address}
                      onChange={(e) => handleInputChange('location.address', e.target.value)}
                      placeholder="Street address or general area"
                    />
                  </div>
                </div>

                {/* Video URL (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="video_url">YouTube Video URL (Optional)</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url || ''}
                    onChange={(e) => handleInputChange('video_url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  />
                  <p className="text-xs text-gray-500">Add a YouTube link to showcase a video tour of your listing.</p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Images */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Add photos to make your listing more attractive (at least 1 required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* File Upload */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="images" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">Upload images</span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </Label>
                      <p className="text-sm text-gray-500">PNG, JPG, WebP up to 10MB each (max 10 images total)</p>
                    </div>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files</Label>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image URL Input */}
                  <div className="space-y-2">
                    <Label>Or add image URLs</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <Button type="button" onClick={addImageUrl}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Image URLs */}
                  {formData.image_urls.length > 0 && (
                    <div className="space-y-2">
                      <Label>Image URLs</Label>
                      <div className="space-y-2">
                        {formData.image_urls.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm truncate">{url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImageUrl(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Listing...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Listing
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
} 
