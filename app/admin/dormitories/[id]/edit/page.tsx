"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

interface RoomVariant {
  type: string;
  capacity: number;
  price: number;
  priceFrequency: string;
  available: boolean;
  description?: string;
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
    address: string;
  };
  availability: 'available' | 'running_out' | 'unavailable';
  image_urls: string[];
  roomVariants: RoomVariant[];
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  genderRestriction: 'male' | 'female' | 'mixed';
  facilities?: string[];
  rules?: string[];
  nearbyPlaces?: string[];
  status: string;
}

const UNIVERSITIES = [
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

const CITIES = [
  'Nicosia', 'Kyrenia', 'Famagusta', 'Morphou', 'Lefke', 'İskele',
  'Alsancak', 'Lapta', 'Çatalköy', 'Esentepe', 'Boğaz', 'Dipkarpaz',
  'Lapithos', 'Bellapais', 'Kayalar', 'Özanköy', 'Tatlısu', 'Zeytinlik'
];

export default function AdminDormitoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    university: { name: '', isFromDropdown: true },
    location: { city: '', address: '' },
    availability: 'available',
    image_urls: [],
    roomVariants: [{
      type: '',
      capacity: 1,
      price: 0,
      priceFrequency: 'monthly',
      available: true,
      description: ''
    }],
    contact: { phone: '', email: '', whatsapp: '' },
    genderRestriction: 'mixed',
    facilities: [],
    rules: [],
    nearbyPlaces: [],
    status: 'active'
  });

  const dormitoryId = params.id as string;

  useEffect(() => {
    fetchDormitory();
  }, [dormitoryId]);

  const fetchDormitory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories/${dormitoryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dormitory');
      }

      const data = await response.json();
      const dormitory = data.data;

      setFormData({
        title: dormitory.title || '',
        description: dormitory.description || '',
        university: dormitory.university || { name: '', isFromDropdown: true },
        location: dormitory.location || { city: '', address: '' },
        availability: dormitory.availability || 'available',
        image_urls: dormitory.image_urls || [],
        roomVariants: dormitory.roomVariants?.length > 0 ? dormitory.roomVariants : [{
          type: '',
          capacity: 1,
          price: 0,
          priceFrequency: 'monthly',
          available: true,
          description: ''
        }],
        contact: dormitory.contact || { phone: '', email: '', whatsapp: '' },
        genderRestriction: dormitory.genderRestriction || 'mixed',
        facilities: dormitory.facilities || [],
        rules: dormitory.rules || [],
        nearbyPlaces: dormitory.nearbyPlaces || [],
        status: dormitory.status || 'active'
      });
    } catch (error) {
      console.error('Error fetching dormitory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dormitory details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Clean up data
      const cleanedData = {
        ...formData,
        image_urls: formData.image_urls,
        roomVariants: formData.roomVariants.filter(room => room.type.trim() !== ''),
        facilities: formData.facilities?.filter(f => f.trim() !== '') || [],
        rules: formData.rules?.filter(r => r.trim() !== '') || [],
        nearbyPlaces: formData.nearbyPlaces?.filter(p => p.trim() !== '') || []
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories/${dormitoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update dormitory');
      }

      toast({
        title: "Success",
        description: "Dormitory updated successfully",
      });

      router.push(`/admin/dormitories/${dormitoryId}`);
    } catch (error) {
      console.error('Error updating dormitory:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update dormitory",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
        type: '',
        capacity: 1,
        price: 0,
        priceFrequency: 'monthly',
        available: true,
        description: ''
      }]
    }));
  };

  const removeRoomVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomVariants: prev.roomVariants.filter((_, i) => i !== index)
    }));
  };

  const updateRoomVariant = (index: number, field: keyof RoomVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      roomVariants: prev.roomVariants.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      )
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push(`/admin/dormitories/${dormitoryId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Dormitory</h1>
            <p className="text-gray-600">Update dormitory information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter dormitory title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the dormitory, facilities, and features"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    availability: value as 'available' | 'running_out' | 'unavailable'
                  }))}
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

              <div>
                <Label htmlFor="genderRestriction">Gender Restriction</Label>
                <Select
                  value={formData.genderRestriction}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    genderRestriction: value as 'male' | 'female' | 'mixed'
                  }))}
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

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & University */}
        <Card>
          <CardHeader>
            <CardTitle>Location & University</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="university">University *</Label>
              <Select
                value={formData.university.name}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  university: { name: value, isFromDropdown: UNIVERSITIES.includes(value) }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map((uni) => (
                    <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="Full address"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                  placeholder="+90 548 123 4567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  placeholder="contact@dormitory.com"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.contact.whatsapp || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, whatsapp: e.target.value }
                  }))}
                  placeholder="+90 548 123 4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={10}
              maxSize={10}
              useUploadApi={true}
              initialImages={formData.image_urls}
            />
          </CardContent>
        </Card>

        {/* Room Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Room Types & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.roomVariants.map((room, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Room Type {index + 1}</h4>
                  {formData.roomVariants.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRoomVariant(index)}
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Room Type</Label>
                    <Input
                      value={room.type}
                      onChange={(e) => updateRoomVariant(index, 'type', e.target.value)}
                      placeholder="Single Room"
                    />
                  </div>

                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={room.capacity}
                      onChange={(e) => updateRoomVariant(index, 'capacity', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div>
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={room.price}
                      onChange={(e) => updateRoomVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={room.priceFrequency}
                      onValueChange={(value) => updateRoomVariant(index, 'priceFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="semester">Semester</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Room Description</Label>
                  <Textarea
                    value={room.description || ''}
                    onChange={(e) => updateRoomVariant(index, 'description', e.target.value)}
                    placeholder="Optional room description"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`available-${index}`}
                    checked={room.available}
                    onCheckedChange={(checked) => updateRoomVariant(index, 'available', checked)}
                  />
                  <Label htmlFor={`available-${index}`}>Room Available</Label>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addRoomVariant}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room Type
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}