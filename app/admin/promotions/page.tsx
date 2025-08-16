"use client";

import { useEffect, useState } from "react";
import { adminPromotionsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Promotions Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={placement} onValueChange={setPlacement}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Placement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All placements</SelectItem>
                  <SelectItem value="homepage">Homepage</SelectItem>
                  <SelectItem value="category_top">Category Top</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Approve duration</span>
                <Input type="number" value={durationDays} onChange={(e) => setDurationDays(parseInt(e.target.value || '7'))} className="w-24" />
                <span className="text-sm text-gray-600">days</span>
              </div>
              <Button variant="outline" onClick={loadPromotions} disabled={loading}>Refresh</Button>
            </div>

            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

            <div className="space-y-3">
              {loading && <div>Loading…</div>}
              {!loading && promotions.length === 0 && (
                <div className="text-gray-500">No promotions found</div>
              )}
              {promotions.map((p) => (
                <div key={p._id} className="bg-white border rounded p-4 flex gap-4 items-start">
                  <div className="w-28 h-20 relative bg-gray-100 rounded overflow-hidden">
                    {p.listing?.image_urls?.[0] && (
                      <Image src={p.listing.image_urls[0]} alt={p.listing.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{p.listing?.title}</div>
                    <div className="text-sm text-gray-600">{p.placement} • {p.pricing?.durationDays} days • {p.pricing?.amount} {p.pricing?.currency}</div>
                    <div className="text-xs text-gray-500">Owner: {p.owner?.email || p.owner?.username}</div>
                    <div className="text-xs text-gray-500">Status: {p.status} • Clicks: {p.metrics?.clicks || 0}</div>
                    {p.payment?.txHash && <div className="text-xs text-gray-500">Tx: {p.payment.txHash}</div>}
                    {p.payment?.screenshotUrl && (
                      <a href={p.payment.screenshotUrl} target="_blank" className="text-xs text-blue-600 underline">View screenshot</a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleAction(p._id, 'approve')}>Approve</Button>
                    <Button variant="outline" onClick={() => handleAction(p._id, 'reject')}>Reject</Button>
                    <Button variant="outline" onClick={() => handleAction(p._id, 'expire')}>Expire</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
