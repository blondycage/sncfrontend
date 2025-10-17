"use client";

import { useEffect, useState } from "react";
import { adminPromotionsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from "lucide-react";
import Image from "next/image";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("submitted");
  const [placement, setPlacement] = useState<string>("all");
  const [durationDays, setDurationDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadPromotions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminPromotionsApi.list({ status, placement: placement === 'all' ? undefined : placement });
      if (res.success) setPromotions(res.data || []);
      else setError(res.message || "Failed to load promotions");
    } catch (e: any) {
      setError(e?.message || "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPromotions(); }, [status, placement]);

  const handleAction = async (id: string, action: 'approve'|'reject'|'expire') => {
    try {
      setLoading(true);
      setError("");
      const res = await adminPromotionsApi.updateStatus(id, action, action === 'approve' ? durationDays : undefined);
      if (!res.success) throw new Error(res.message || 'Action failed');
      await loadPromotions();
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-500 text-white">Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500 text-white">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Promotions Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Review and manage promotional listings</p>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Placement</label>
                <Select value={placement} onValueChange={setPlacement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All placements</SelectItem>
                    <SelectItem value="homepage">Homepage</SelectItem>
                    <SelectItem value="category_top">Category Top</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Approve Duration</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value || '7'))}
                    className="w-20"
                    placeholder="Days"
                  />
                  <span className="text-sm text-gray-600">days</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={loadPromotions}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promotions List */}
        <Card>
          <CardHeader>
            <CardTitle>Promotions ({promotions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading promotions...</span>
              </div>
            ) : promotions.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No promotions found</h3>
                <p className="text-gray-600">No promotions match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {promotions.map((p) => (
                  <div key={p._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Image */}
                      <div className="w-full lg:w-32 h-24 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.listing?.image_urls?.[0] ? (
                          <Image
                            src={p.listing.image_urls[0]}
                            alt={p.listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Megaphone className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {p.listing?.title || 'No title'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {getStatusBadge(p.status)}
                              <Badge variant="outline" className="text-xs">
                                {p.placement}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-gray-600">
                              <span className="font-medium">Duration:</span> {p.pricing?.durationDays || 0} days
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Price:</span> {p.pricing?.amount || 0} {p.pricing?.currency || 'USD'}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Clicks:</span> {p.metrics?.clicks || 0}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-600">
                              <span className="font-medium">Owner:</span> {p.owner?.email || p.owner?.username || 'Unknown'}
                            </p>
                            {p.payment?.txHash && (
                              <p className="text-gray-600">
                                <span className="font-medium">Tx:</span>
                                <span className="font-mono text-xs ml-1">{p.payment.txHash.slice(0, 20)}...</span>
                              </p>
                            )}
                            {p.payment?.screenshotUrl && (
                              <a
                                href={p.payment.screenshotUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Screenshot
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(p._id, 'approve')}
                          disabled={loading}
                          className="flex-1 lg:flex-none bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(p._id, 'reject')}
                          disabled={loading}
                          className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(p._id, 'expire')}
                          disabled={loading}
                          className="flex-1 lg:flex-none bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Expire
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
