"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Hotel,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";

interface RoomVariant {
  type: string;
  capacity: number;
  price: number;
  priceFrequency: string;
  available: boolean;
  description: string;
}

interface FormData {
  title: string;
  description: string;
  university: {
    name: string;
    isFromDropdown: boolean;
  };
  location: {
    city: string;
    region: string;
    address: string;
  };
  availability: string;
  image_urls: string[];
  roomVariants: RoomVariant[];
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    preferredMethod: string;
  };
  genderRestriction: string;
  facilities: string[];
  rules: string[];
}

const NORTH_CYPRUS_UNIVERSITIES = [
  'Eastern Mediterranean University (EMU)',
  'Near East University (NEU)',
  'European University of Lefke (EUL)',
  'Girne American University (GAU)',
  'Cyprus International University (CIU)',
  'University of Kyrenia',
  'Final International University',
  'Middle East Technical University Northern Cyprus Campus (METU NCC)',
  'American University of Cyprus',
  'Cyprus West University',
  'Arkın University of Creative Arts and Design',
  'University of Mediterranean Karpasia'
];

const NORTH_CYPRUS_CITIES = [
  'Nicosia', 'Kyrenia', 'Famagusta', 'Morphou', 'Lefke', 'İskele',
  'Alsancak', 'Lapta', 'Çatalköy', 'Esentepe', 'Boğaz', 'Dipkarpaz'
];

const COMMON_FACILITIES = [
  'WiFi', 'Parking', 'Kitchen', 'TV', 'AC', 'Gym', 'Security', 'Laundry',
  'Study Room', 'Common Area', 'Garden', 'Balcony', 'Swimming Pool'
];

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room', capacity: 1 },
  { value: 'double', label: 'Double Room', capacity: 2 },
  { value: 'triple', label: 'Triple Room', capacity: 3 },
  { value: 'quad', label: 'Quad Room', capacity: 4 },
  { value: 'five_person', label: 'Five Person Room', capacity: 5 },
  { value: 'six_person', label: 'Six Person Room', capacity: 6 }
];

export default function CreateDormitoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customUniversity, setCustomUniversity] = useState('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    university: {
      name: '',
      isFromDropdown: true
    },
    location: {
      city: '',
      region: '',
      address: ''
    },
    availability: 'available',
    image_urls: [],
    roomVariants: [{
      type: 'single',
      capacity: 1,
      price: 0,
      priceFrequency: 'monthly',
      available: true,
      description: ''
    }],
    contact: {
      phone: '',
      email: '',
      whatsapp: '',
      preferredMethod: 'whatsapp'
    },
    genderRestriction: 'mixed',
    facilities: [],
    rules: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.university.name.trim()) throw new Error('University is required');
      if (!formData.location.city.trim()) throw new Error('City is required');
      if (!formData.location.address.trim()) throw new Error('Address is required');
      if (!formData.contact.phone.trim()) throw new Error('Phone number is required');
      if (!formData.image_urls.length) throw new Error('At least one image is required');

      // Clean up data
      const cleanedData = {
        ...formData,
        image_urls: formData.image_urls,
        rules: formData.rules.filter(rule => rule.trim()),
        university: {
          name: formData.university.isFromDropdown ? formData.university.name : customUniversity,
          isFromDropdown: formData.university.isFromDropdown
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create dormitory');
      }

      toast({
        title: "Success",
        description: "Dormitory created successfully",
      });

      router.push('/admin/dormitories');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create dormitory',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      image_urls: urls
    }));
  };

  const addRoomVariant = () => {
    setFormData(prev => ({
      ...prev,
      roomVariants: [...prev.roomVariants, {
        type: 'single',
        capacity: 1,
        price: 0,
        priceFrequency: 'monthly',
        available: true,
        description: ''
      }]
    }));
  };

  const removeRoomVariant = (index: number) => {
    if (formData.roomVariants.length > 1) {
      setFormData(prev => ({
        ...prev,
        roomVariants: prev.roomVariants.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRoomVariant = (index: number, field: keyof RoomVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      roomVariants: prev.roomVariants.map((variant, i) => {
        if (i === index) {
          const updated = { ...variant, [field]: value };
          // Auto-update capacity based on room type
          if (field === 'type') {
            const roomType = ROOM_TYPES.find(t => t.value === value);
            if (roomType) {
              updated.capacity = roomType.capacity;
            }
          }
          return updated;
        }
        return variant;
      })
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/dormitories')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dormitories
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Dormitory</h1>
          <p className="text-muted-foreground">
            Add a new student dormitory to the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide basic details about the dormitory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Dormitory Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Student Residences Near EMU"
                  required
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability Status *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="running_out">Running Out</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the dormitory, amenities, and what makes it special..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="genderRestriction">Gender Restriction</Label>
              <Select
                value={formData.genderRestriction}
                onValueChange={(value) => setFormData(prev => ({ ...prev, genderRestriction: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="male">Male Only</SelectItem>
                  <SelectItem value="female">Female Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* University & Location */}
        <Card>
          <CardHeader>
            <CardTitle>University & Location</CardTitle>
            <CardDescription>
              Specify the university and location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>University Selection</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fromDropdown"
                    checked={formData.university.isFromDropdown}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      university: { ...prev.university, isFromDropdown: !!checked }
                    }))}
                  />
                  <Label htmlFor="fromDropdown">Select from predefined universities</Label>
                </div>

                {formData.university.isFromDropdown ? (
                  <Select
                    value={formData.university.name}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      university: { ...prev.university, name: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      {NORTH_CYPRUS_UNIVERSITIES.map((uni) => (
                        <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    placeholder="Enter university name manually"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.location.city}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {NORTH_CYPRUS_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.location.region}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, region: e.target.value }
                  }))}
                  placeholder="e.g., City Center, University Area"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
                placeholder="Full street address"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Upload up to 10 images of the dormitory (at least 1 required)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={10}
              maxSize={10}
              useUploadApi={true}
            />
          </CardContent>
        </Card>

        {/* Room Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Room Types & Pricing</CardTitle>
            <CardDescription>
              Define different room types available in this dormitory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.roomVariants.map((variant, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Room Type {index + 1}</h4>
                  {formData.roomVariants.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRoomVariant(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Room Type</Label>
                    <Select
                      value={variant.type}
                      onValueChange={(value) => updateRoomVariant(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={variant.capacity}
                      onChange={(e) => updateRoomVariant(index, 'capacity', parseInt(e.target.value) || 1)}
                      min={1}
                      max={6}
                    />
                  </div>

                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateRoomVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label>Price Frequency</Label>
                    <Select
                      value={variant.priceFrequency}
                      onValueChange={(value) => updateRoomVariant(index, 'priceFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="semester">Per Semester</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`available-${index}`}
                      checked={variant.available}
                      onCheckedChange={(checked) => updateRoomVariant(index, 'available', !!checked)}
                    />
                    <Label htmlFor={`available-${index}`}>Available for booking</Label>
                  </div>

                  <div>
                    <Label>Description (optional)</Label>
                    <Input
                      value={variant.description}
                      onChange={(e) => updateRoomVariant(index, 'description', e.target.value)}
                      placeholder="Additional details about this room type"
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addRoomVariant}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room Type
            </Button>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How students can get in touch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                  placeholder="+90 548 123 45 67"
                  required
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.contact.whatsapp}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, whatsapp: e.target.value }
                  }))}
                  placeholder="+90 548 123 45 67"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  placeholder="contact@dormitory.com"
                />
              </div>
              <div>
                <Label htmlFor="preferredMethod">Preferred Contact Method</Label>
                <Select
                  value={formData.contact.preferredMethod}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, preferredMethod: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Facilities & Amenities</CardTitle>
            <CardDescription>
              Select available facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COMMON_FACILITIES.map((facility) => (
                <div key={facility} className="flex items-center space-x-2">
                  <Checkbox
                    id={facility}
                    checked={formData.facilities.includes(facility)}
                    onCheckedChange={() => toggleFacility(facility)}
                  />
                  <Label htmlFor={facility}>{facility}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Dormitory Rules</CardTitle>
            <CardDescription>
              Add any rules or guidelines for residents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  placeholder={`Rule ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeRule(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addRule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/dormitories')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Dormitory
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}