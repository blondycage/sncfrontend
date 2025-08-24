"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Flag, 
  User, 
  Calendar, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';


interface ReportedUser {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Report {
  reportedBy: ReportedUser;
  reason: string;
  description?: string;
  createdAt: string;
}

interface ReportedListing {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  moderationStatus: string;
  owner: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  reports: Report[];
  createdAt: string;
  images?: string[];
}

interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
}

export default function ReportedContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<ReportedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pages: 1
  });
  const [selectedListing, setSelectedListing] = useState<ReportedListing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchReportedListings = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/listings/reported?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reported listings');
      }

      const data = await response.json();
      setListings(data.data.listings || []);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching reported listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reported content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReportedListings();
    }
  }, [user]);

  const handleModerationAction = async (listingId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/listings/${listingId}/moderation`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: action === 'approve' ? 'approved' : 'rejected',
            notes: `${action === 'approve' ? 'Approved' : 'Rejected'} after report review`
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} listing`);
      }

      toast({
        title: "Success",
        description: `Listing ${action}d successfully.`,
      });

      // Refresh the list
      fetchReportedListings(pagination.page);
      setDialogOpen(false);
    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} listing.`,
        variant: "destructive",
      });
    }
  };

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case 'inappropriate': return 'bg-red-100 text-red-800';
      case 'spam': return 'bg-orange-100 text-orange-800';
      case 'scam': return 'bg-red-100 text-red-800';
      case 'duplicate': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserDisplayName = (user: ReportedUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email;
  };

  const getUserInitials = (user: ReportedUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reported content...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Flag className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Reported Content</h1>
        </div>
        <p className="text-gray-600">
          Review and manage reported listings. Total reports: {pagination.total}
        </p>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reported Content</h3>
            <p className="text-gray-600">Great! There are no reported listings at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold">{pagination.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold">
                      {listings.filter(l => l.moderationStatus === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Reports/Item</p>
                    <p className="text-2xl font-bold">
                      {listings.length > 0 
                        ? Math.round(listings.reduce((acc, l) => acc + l.reports.length, 0) / listings.length * 10) / 10
                        : 0
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Reporters</p>
                    <p className="text-2xl font-bold">
                      {new Set(listings.flatMap(l => l.reports.map(r => r.reportedBy._id))).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reported Listings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reported Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{listing.title}</p>
                          <p className="text-sm text-gray-500 truncate">{listing.description}</p>
                          <Badge variant="outline" className="mt-1">
                            {listing.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getUserInitials(listing.owner as ReportedUser)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{getUserDisplayName(listing.owner as ReportedUser)}</p>
                            <p className="text-xs text-gray-500">{listing.owner.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Flag className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{listing.reports.length} reports</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(listing.reports.map(r => r.reason))).map(reason => (
                              <Badge 
                                key={reason} 
                                variant="outline" 
                                className={`text-xs ${getReasonBadgeColor(reason)}`}
                              >
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(listing.status)}>
                          {listing.status}
                        </Badge>
                        <br />
                        <Badge variant="outline" className="mt-1">
                          {listing.moderationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedListing(listing);
                            setDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total items)
                  </p>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchReportedListings(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchReportedListings(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Report Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Flag className="h-5 w-5 text-red-500" />
                  <span>Report Details: {selectedListing.title}</span>
                </DialogTitle>
                <DialogDescription>
                  Review the reports and take appropriate action for this listing.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Listing Details */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Listing Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Title:</strong> {selectedListing.title}</p>
                      <p><strong>Category:</strong> {selectedListing.category}</p>
                      <p><strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusBadgeColor(selectedListing.status)}`}>
                          {selectedListing.status}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p><strong>Owner:</strong> {getUserDisplayName(selectedListing.owner as ReportedUser)}</p>
                      <p><strong>Email:</strong> {selectedListing.owner.email}</p>
                      <p><strong>Created:</strong> {new Date(selectedListing.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p><strong>Description:</strong></p>
                    <p className="text-gray-600 mt-1">{selectedListing.description}</p>
                  </div>
                </div>

                {/* Reports */}
                <div>
                  <h4 className="font-semibold mb-3">Reports ({selectedListing.reports.length})</h4>
                  <div className="space-y-3">
                    {selectedListing.reports.map((report, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getUserInitials(report.reportedBy)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{getUserDisplayName(report.reportedBy)}</p>
                              <p className="text-xs text-gray-500">{report.reportedBy.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getReasonBadgeColor(report.reason)}>
                              {report.reason}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {report.description && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Description:</strong> {report.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleModerationAction(selectedListing._id, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Listing
                </Button>
                <Button
                  onClick={() => handleModerationAction(selectedListing._id, 'approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Listing
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
