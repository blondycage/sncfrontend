"use client";

import { useEffect, useState } from "react";
import { promotionsApi } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface PromoCard {
  promotionId: string;
  id: string;
  title: string;
  description?: string;
  category: 'rental' | 'sale' | 'service';
  price?: number;
  pricing_frequency?: string;
  currency?: string;
  primaryImage?: string | null;
}

function formatPrice(price?: number, frequency?: string, currency: string = 'USD') {
  if (typeof price !== 'number') return ''
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(price)
  if (!frequency || frequency === 'fixed') return formatted
  return `${formatted}/${frequency}`
}

export default function HomeSponsoredSection() {
  const [promos, setPromos] = useState<PromoCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const cats: Array<'rental'|'sale'|'service'> = ['rental','sale','service'];
        const results = await Promise.all(cats.map((c) => promotionsApi.getActiveTopForCategory(c)));
        const collected: PromoCard[] = [];
        results.forEach((res, idx) => {
          if (res?.success && Array.isArray(res.data)) {
            res.data.forEach((p: any) => {
              const listing = p.listing || {};
              collected.push({
                promotionId: p._id,
                id: listing._id,
                title: listing.title,
                description: listing.description,
                category: listing.category,
                price: listing.price,
                pricing_frequency: listing.pricing_frequency,
                primaryImage: listing.image_urls?.[0] || null,
              });
            });
          }
        });
        if (mounted) setPromos(collected);
      } catch {
        if (mounted) setPromos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  if (loading) return null;
  if (!promos.length) return null;

  return (
    <section className="container px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sponsored listings</h2>
        <span className="text-xs text-gray-500">Promoted</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((item) => (
          <Link key={`${item.promotionId}-${item.id}`} href={`/listings/${item.id}`} onClick={async (e) => {
            try { await promotionsApi.trackClick(item.promotionId) } catch {}
          }}>
            <div className="group cursor-pointer rounded-lg border border-blue-200/40 overflow-hidden bg-white/95 backdrop-blur-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
              <div className="relative h-44 bg-gray-100">
                {item.primaryImage ? (
                  <Image src={item.primaryImage} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge className="bg-secondary text-white">Sponsored</Badge>
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">{item.category}</Badge>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">{formatPrice(item.price, item.pricing_frequency, item.currency)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
