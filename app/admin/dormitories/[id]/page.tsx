"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Edit,
  Trash2,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
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
  views: number;
  inquiries: number;
  createdAt: string;
  status: string;
  moderationStatus: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  genderRestriction: 'male' | 'female' | 'mixed';
  facilities?: string[];
  rules?: string[];
  nearbyPlaces?: string[];
  isReported?: boolean;
}

export default function AdminDormitoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [dormitory, setDormitory] = useState<Dormitory | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
      setDormitory(data.data);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dormitory? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories/${dormitoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete dormitory');
      }

      toast({
        title: "Success",
        description: "Dormitory deleted successfully",
      });

      router.push('/admin/dormitories');
    } catch (error) {
      console.error('Error deleting dormitory:', error);
      toast({
        title: "Error",
        description: "Failed to delete dormitory",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleModerate = async (action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dormitories/${dormitoryId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} dormitory`);
      }

      toast({
        title: "Success",
        description: `Dormitory ${action}d successfully`,
      });

      fetchDormitory(); // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing dormitory:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} dormitory`,
        variant: "destructive",
      });
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-green-200 text-green-700">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="border-gray-400 text-gray-700">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getModerationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="border-green-200 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-400 text-yellow-700"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-200 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dormitory) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dormitory Not Found</h1>
          <p className="text-gray-600 mb-6">The dormitory you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/dormitories')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dormitories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/admin/dormitories')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{dormitory.title}</h1>
            <p className="text-gray-600">Dormitory Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/dormitories/${dormitoryId}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{dormitory.views}</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{dormitory.inquiries}</div>
                  <div className="text-sm text-gray-600">Inquiries</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{dormitory.roomVariants.length}</div>
                  <div className="text-sm text-gray-600">Room Types</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Images */}
          {dormitory.image_urls && dormitory.image_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dormitory.image_urls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`${dormitory.title} - Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{dormitory.description}</p>
            </CardContent>
          </Card>

          {/* Room Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Room Types & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dormitory.roomVariants.map((room, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{room.type}</h4>
                        <p className="text-sm text-gray-600">Capacity: {room.capacity} person(s)</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${room.price}/{room.priceFrequency}</div>
                        <Badge variant={room.available ? "outline" : "secondary"}>
                          {room.available ? "Available" : "Not Available"}
                        </Badge>
                      </div>
                    </div>
                    {room.description && (
                      <p className="text-sm text-gray-600 mt-2">{room.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Moderation */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(dormitory.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Moderation:</span>
                {getModerationBadge(dormitory.moderationStatus)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Availability:</span>
                {getAvailabilityBadge(dormitory.availability)}
              </div>

              {dormitory.moderationStatus === 'pending' && (
                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => handleModerate('approve')}
                    className="w-full"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleModerate('reject')}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & University */}
          <Card>
            <CardHeader>
              <CardTitle>Location & University</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <GraduationCap className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">{dormitory.university.name}</div>
                  <div className="text-xs text-gray-500">
                    {dormitory.university.isFromDropdown ? 'Predefined' : 'Custom'}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">{dormitory.location.city}</div>
                  <div className="text-sm text-gray-600">{dormitory.location.address}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-sm">{dormitory.contact.phone}</span>
              </div>
              {dormitory.contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">{dormitory.contact.email}</span>
                </div>
              )}
              {dormitory.contact.whatsapp && (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">{dormitory.contact.whatsapp}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Name: </span>
                {dormitory.owner.firstName} {dormitory.owner.lastName}
              </div>
              <div className="text-sm">
                <span className="font-medium">Email: </span>
                {dormitory.owner.email}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Gender Restriction: </span>
                <Badge variant="outline" className="ml-1">
                  {dormitory.genderRestriction.charAt(0).toUpperCase() + dormitory.genderRestriction.slice(1)}
                </Badge>
              </div>
              <div className="text-sm">
                <span className="font-medium">Created: </span>
                {new Date(dormitory.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}