"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Eye, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Mail,
  Phone,
  User,
  Calendar,
  Tag,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  pricing_frequency: string;
  image_urls: string[];
  status: string;
  moderationStatus: string;
  moderationNotes?: string;
  owner: {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
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
  createdAt: string;
  updatedAt: string;
  moderatedAt?: string;
  moderatedBy?: {
    _id: string;
    username: string;
  };
}

export default function AdminListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    pricing_frequency: '',
    moderationStatus: '',
    moderationNotes: ''
  });

  const listingId = params.id as string;

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }

      const data = await response.json();
      const listingData = data.data.listing;
      setListing(listingData);
      setEditForm({
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        price: listingData.price,
        pricing_frequency: listingData.pricing_frequency,
        moderationStatus: listingData.moderationStatus || 'pending',
        moderationNotes: listingData.moderationNotes || ''
      });
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to fetch listing details.",
        variant: "destructive",
      });
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!listing) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          price: editForm.price,
          pricing_frequency: editForm.pricing_frequency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update listing');
      }

      await fetchListing(); // Refresh data
      setEditing(false);
      toast({
        title: "Success",
        description: "Listing updated successfully.",
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleModerate = async (status: 'approved' | 'rejected') => {
    if (!listing) return;
    
    setModerating(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes: editForm.moderationNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update moderation status');
      }

      await fetchListing(); // Refresh data
      toast({
        title: "Success",
        description: `Listing ${status} successfully.`,
      });
    } catch (error) {
      console.error('Error moderating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update moderation status.",
        variant: "destructive",
      });
    } finally {
      setModerating(false);
    }
  };

  const handleDelete = async () => {
    if (!listing || !confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}`, {
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
        description: "Listing deleted successfully.",
      });
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getModerationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Listing not found</p>
          <Button onClick={() => router.push('/admin')} className="mt-4">
            Back to Admin Panel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-blue p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold">Listing Details</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setEditForm({
                    title: listing.title,
                    description: listing.description,
                    category: listing.category,
                    price: listing.price,
                    pricing_frequency: listing.pricing_frequency,
                    moderationStatus: listing.moderationStatus || 'pending',
                    moderationNotes: listing.moderationNotes || ''
                  });
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Listing title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Listing description"
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rental">Rental</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <Input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                        placeholder="Price"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pricing Frequency</label>
                    <Select value={editForm.pricing_frequency} onValueChange={(value) => setEditForm({ ...editForm, pricing_frequency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold">{listing.title}</h3>
                    <p className="text-gray-600 mt-2">{listing.description}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Category:</span>
                      <Badge variant="secondary">{listing.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Price:</span>
                      <span className="font-medium">
                        {(() => {
                          const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', TRY: '₺' };
                          const symbol = currencySymbols[listing.currency || 'USD'] || '$';
                          return `${symbol}${listing.price} / ${listing.pricing_frequency}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {listing.image_urls && listing.image_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {listing.image_urls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Listing image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {listing.contact.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {listing.contact.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    Preferred: {listing.contact.preferredMethod}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Location</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <div>{listing.location.address}</div>
                      <div>{listing.location.city}, {listing.location.region}</div>
                    </div>
                  </div>
                </div>
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
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">
                  {getStatusBadge(listing.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Moderation Status</label>
                <div className="mt-1">
                  {getModerationBadge(listing.moderationStatus)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Moderation Notes</label>
                <Textarea
                  value={editForm.moderationNotes}
                  onChange={(e) => setEditForm({ ...editForm, moderationNotes: e.target.value })}
                  placeholder="Add moderation notes..."
                  rows={3}
                />
              </div>

              {listing.moderationStatus === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleModerate('approved')}
                    disabled={moderating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleModerate('rejected')}
                    disabled={moderating}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">Name:</span>
                <div>{listing.owner.firstName} {listing.owner.lastName}</div>
              </div>
              <div>
                <span className="text-sm font-medium">Username:</span>
                <div>{listing.owner.username}</div>
              </div>
              <div>
                <span className="text-sm font-medium">Email:</span>
                <div>{listing.owner.email}</div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Created:</span>
                <div>{new Date(listing.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium">Updated:</span>
                <div>{new Date(listing.updatedAt).toLocaleString()}</div>
              </div>
              {listing.moderatedAt && (
                <div>
                  <span className="font-medium">Moderated:</span>
                  <div>{new Date(listing.moderatedAt).toLocaleString()}</div>
                  {listing.moderatedBy && (
                    <div className="text-gray-500">by {listing.moderatedBy.username}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
