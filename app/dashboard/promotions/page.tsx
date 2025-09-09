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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">My Promotions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your listing promotions and their performance
                </p>
              </div>
              <Link href="/promotions/my-payments">
                <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto">
                  Manage Payments
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading promotions...</span>
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No promotions yet.</div>
                <p className="text-sm text-gray-400 mb-4">Start promoting your listings to increase visibility</p>
                <Link href="/promotions">
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Create Promotion
                  </button>
                </Link>
              </div>
            )}
            <div className="space-y-3 sm:space-y-4">
              {items.map((p) => (
                <div key={p._id} className="bg-white border rounded p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">{p.listing?.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">{p.placement}</span>
                        <span>{p.pricing?.durationDays} days</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{p.pricing?.amount} {p.pricing?.currency}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs ${
                          p.status === 'active' ? 'bg-green-100 text-green-800' :
                          p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          p.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {p.status}
                        </span>
                        <span className="flex items-center">
                          👁️ {p.metrics?.clicks || 0} clicks
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/listings/${p.listing?._id}`} className="text-blue-600 text-xs sm:text-sm underline hover:text-blue-800">
                        View listing
                      </Link>
                      {p.status === 'active' && (
                        <span className="text-xs text-green-600 font-medium">
                          Active
                        </span>
                      )}
                    </div>
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
