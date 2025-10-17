"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  GraduationCap,
  Users,
  Hotel,
  Calendar,
  Eye,
  Share2,
  Heart,
  ArrowLeft,
  CheckCircle,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  Dumbbell,
  Shield,
  Clock,
  DollarSign
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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
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
  rules?: string[];
  academicInfo?: {
    availableFrom?: string;
    availableTo?: string;
    acceptingSemester?: string[];
  };
  owner: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

const facilityIcons: { [key: string]: any } = {
  'wifi': Wifi,
  'parking': Car,
  'kitchen': Utensils,
  'tv': Tv,
  'ac': Wind,
  'gym': Dumbbell,
  'security': Shield,
  'laundry': Clock,
};

export default function DormitoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [dormitory, setDormitory] = useState<Dormitory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [inquiring, setInquiring] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDormitory(params.id as string);
    }
  }, [params.id]);

  const fetchDormitory = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dormitories/${id}`, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Dormitory not found');
        }
        throw new Error('Failed to fetch dormitory details');
      }

      const data = await response.json();
      setDormitory(data.data);
    } catch (error) {
      console.error('Error fetching dormitory:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dormitory details');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppInquiry = async () => {
    if (!dormitory) return;

    try {
      setInquiring(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dormitories/${dormitory._id}/inquire`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate WhatsApp link');
      }

      const data = await response.json();
      window.open(data.data.whatsappUrl, '_blank');

      toast({
        title: "Success",
        description: "WhatsApp chat opened successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp chat",
        variant: "destructive",
      });
    } finally {
      setInquiring(false);
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'running_out':
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Running Out</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const getGenderBadge = (gender: string) => {
    const colors = {
      male: 'bg-blue-100 text-blue-800 border-blue-200',
      female: 'bg-pink-100 text-pink-800 border-pink-200',
      mixed: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <Badge variant="outline" className={colors[gender as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {gender.charAt(0).toUpperCase() + gender.slice(1)}
      </Badge>
    );
  };

  const getRoomTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      single: 'Single Room (1 person)',
      double: 'Double Room (2 people)',
      triple: 'Triple Room (3 people)',
      quad: 'Quad Room (4 people)',
      five_person: 'Five Person Room',
      six_person: 'Six Person Room'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-blue flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dormitory) {
    return (
      <div className="min-h-screen bg-gradient-blue flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Dormitory not found'}
          </h1>
          <p className="text-gray-600 mb-4">
            The dormitory you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/dormitories')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dormitories
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-blue">
      <div className="container px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dormitories')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dormitories
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] relative">
                <Image
                  src={dormitory.image_urls[selectedImageIndex] || '/placeholder-dormitory.jpg'}
                  alt={dormitory.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {getAvailabilityBadge(dormitory.availability)}
                  {getGenderBadge(dormitory.genderRestriction)}
                </div>
              </div>
              {dormitory.image_urls.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {dormitory.image_urls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`${dormitory.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {dormitory.title}
                    </h1>
                    <div className="flex items-center text-lg text-gray-600">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      <span>{dormitory.university.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{dormitory.location.address}, {dormitory.location.city}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{dormitory.views} views</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span>{dormitory.inquiries} inquiries</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Listed {new Date(dormitory.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {dormitory.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Variants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Available Room Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dormitory.roomVariants.map((variant, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        variant.available
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gradient-blue'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{getRoomTypeLabel(variant.type)}</h4>
                          {variant.available ? (
                            <Badge className="bg-green-100 text-green-800">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            ${variant.price}
                          </div>
                          <div className="text-sm text-gray-500">
                            per {variant.priceFrequency}
                          </div>
                        </div>
                      </div>
                      {variant.description && (
                        <p className="text-sm text-gray-600">{variant.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            {dormitory.facilities && dormitory.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Facilities & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {dormitory.facilities.map((facility, index) => {
                      const IconComponent = facilityIcons[facility.toLowerCase()] || CheckCircle;
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-green-600" />
                          <span className="text-sm capitalize">{facility}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rules */}
            {dormitory.rules && dormitory.rules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dormitory Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {dormitory.rules.map((rule, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Owner Info */}
                <div>
                  <h4 className="font-semibold mb-2">Listed by</h4>
                  <p className="text-gray-700">
                    {dormitory.owner.firstName} {dormitory.owner.lastName}
                  </p>
                </div>

                <Separator />

                {/* Contact Methods */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{dormitory.contact.phone}</span>
                  </div>
                  {dormitory.contact.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{dormitory.contact.email}</span>
                    </div>
                  )}
                  {dormitory.contact.whatsapp && (
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{dormitory.contact.whatsapp}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleWhatsAppInquiry}
                    disabled={inquiring || dormitory.availability === 'unavailable'}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {inquiring ? 'Opening WhatsApp...' : 'Book Now via WhatsApp'}
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call {dormitory.contact.phone}
                  </Button>

                  {dormitory.contact.email && (
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  )}
                </div>

                {dormitory.availability === 'unavailable' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      This dormitory is currently unavailable for booking.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dormitory.roomVariants
                    .filter(v => v.available)
                    .map((variant, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{getRoomTypeLabel(variant.type)}</span>
                        <span className="font-semibold">
                          ${variant.price}/{variant.priceFrequency}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share this dormitory
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}