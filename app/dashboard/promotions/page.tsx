"use client";

import { useEffect, useState } from "react";
import { promotionsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function UserPromotionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promotions/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setItems(data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>My Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div>Loading…</div>}
            {!loading && items.length === 0 && (
              <div className="text-gray-500">No promotions yet.</div>
            )}
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p._id} className="bg-white border rounded p-4">
                  <div className="font-semibold">{p.listing?.title}</div>
                  <div className="text-sm text-gray-600">{p.placement} • {p.pricing?.durationDays} days • {p.pricing?.amount} {p.pricing?.currency}</div>
                  <div className="text-xs text-gray-500">Status: {p.status} • Clicks: {p.metrics?.clicks || 0}</div>
                  <Link href={`/listings/${p.listing?._id}`} className="text-blue-600 text-xs underline">View listing</Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
