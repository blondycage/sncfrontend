"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Upload, 
  Bell, 
  Globe, 
  Clock,
  Save,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { userApi } from '@/lib/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  location?: {
    coordinates?: any;
    address?: string;
    city?: string;
    country?: string;
  };
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  phone?: string;
  bio?: string;
  preferences: {
    notifications: {
      email: boolean;
      telegram: boolean;
    };
    language: string;
    timezone: string;
  };
  subscription: {
    type: string;
  };
  uploadQuota: {
    freeUploadsUsed: number;
    freeUploadsLimit: number;
    paidUploadsRemaining: number;
    canUpload: boolean;
    lastQuotaReset: string;
  };
  lastLogin: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await userApi.getUserProfile(token);
      setUser(response.data || response.user);
      setFormData(response.data || response.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof UserProfile],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Profile Update: Starting save process', {
        formData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          preferences: formData.preferences
        }
      });

      // Call the new updateDetails endpoint to allow username/email changes too
      const response = await userApi.updateDetails(token, {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location as any,
        preferences: formData.preferences as any,
      });
      
      console.log('✅ Profile Update: API response received', response);
      
      setUser(response.data || response.user);
      setIsEditing(false);
      
      console.log('🎉 Profile Update: Success - showing toast');
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('❌ Profile Update Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setIsEditing(false);
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
                className="whitespace-nowrap"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Header */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                    <AvatarImage src={user.avatar || ''} />
                    <AvatarFallback className="text-lg sm:text-xl bg-blue-100 text-blue-600">
                      {getInitials(user.firstName, user.lastName, user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 truncate">@{user.username}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={user.isVerified ? "default" : "secondary"} className="text-xs">
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.subscription.type} Plan
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={saving}
                        className="w-full sm:w-auto"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                      />
                      {user.emailVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    {!user.emailVerified && (
                      <p className="text-xs text-yellow-600">Email not verified</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                      {user.phoneVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    {!user.phoneVerified && (
                      <p className="text-xs text-yellow-600">Phone not verified</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                  <CardDescription>
                    Update your location information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.location?.address || ''}
                      onChange={(e) => handleNestedChange('location', 'address', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.location?.city || ''}
                        onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.location?.country || ''}
                        onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Verified</span>
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Phone Verified</span>
                    <Badge variant={user.phoneVerified ? "default" : "secondary"}>
                      {user.phoneVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Status</span>
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Quota */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Quota
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Free Uploads Used</span>
                      <span className="font-medium">{user.uploadQuota.freeUploadsUsed}/{user.uploadQuota.freeUploadsLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(user.uploadQuota.freeUploadsUsed / user.uploadQuota.freeUploadsLimit) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Paid Uploads</span>
                    <span className="font-medium">{user.uploadQuota.paidUploadsRemaining}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Can Upload</span>
                    <Badge variant={user.uploadQuota.canUpload ? "default" : "destructive"}>
                      {user.uploadQuota.canUpload ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-gray-500">
                    <p>Last reset: {formatDate(user.uploadQuota.lastQuotaReset)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={formData.preferences?.language || 'en'} 
                      onValueChange={(value) => handleNestedChange('preferences', 'language', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="tr">Turkish</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={formData.preferences?.timezone || 'UTC'} 
                      onValueChange={(value) => handleNestedChange('preferences', 'timezone', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Europe/Istanbul">Europe/Istanbul</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Notifications</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Notifications</span>
                        <Switch
                          checked={formData.preferences?.notifications?.email || false}
                          onCheckedChange={(checked) => handleNestedChange('preferences', 'notifications', {
                            ...formData.preferences?.notifications,
                            email: checked
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Telegram Notifications</span>
                        <Switch
                          checked={formData.preferences?.notifications?.telegram || false}
                          onCheckedChange={(checked) => handleNestedChange('preferences', 'notifications', {
                            ...formData.preferences?.notifications,
                            telegram: checked
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member Since</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Login</span>
                    <span>{formatDate(user.lastLogin)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subscription</span>
                    <Badge variant="outline">{user.subscription.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}