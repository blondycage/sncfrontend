"use client";

import { useEffect, useState } from "react";
import { adminPromotionsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPromotionSettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminPromotionsApi.getConfig();
      if (res.success) setConfig(res.data);
      else setError(res.message || 'Failed to load config');
    } catch (e: any) {
      setError(e?.message || 'Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateField = (path: string[], value: any) => {
    setConfig((prev: any) => {
      const next = { ...prev };
      let cur = next as any;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        cur[key] = { ...(cur[key] || {}) };
        cur = cur[key];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await adminPromotionsApi.updateConfig({
        prices: config.prices,
        wallets: config.wallets,
        limits: config.limits,
        settings: config.settings
      });
      if (!res.success) throw new Error(res.message || 'Failed to save');
      setSuccess('Saved');
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!config) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-gradient-blue p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Promotion Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-700 text-sm">{success}</div>}

            <section>
              <h3 className="font-semibold mb-2">Wallet Addresses</h3>
              {['btc','eth','usdt_erc20','usdt_trc20'].map((key) => (
                <div key={key} className="flex items-center gap-3 mb-2">
                  <label className="w-32 text-sm text-gray-600 uppercase">{key}</label>
                  <Input value={config.wallets?.[key] || ''} onChange={(e) => updateField(['wallets', key], e.target.value)} />
                </div>
              ))}
            </section>

            <section>
              <h3 className="font-semibold mb-2">Prices</h3>
              {(['homepage','category_top'] as const).map((pl) => (
                <div key={pl} className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">{pl}</div>
                  {(config.prices?.[pl] || []).map((opt: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">Days</span>
                      <Input type="number" value={opt.days} onChange={(e) => {
                        const v = parseInt(e.target.value || '0');
                        const next = [...config.prices[pl]]; next[idx] = { ...opt, days: v }; setConfig({ ...config, prices: { ...config.prices, [pl]: next } });
                      }} className="w-24" />
                      <span className="text-xs text-gray-500">Amount</span>
                      <Input type="number" value={opt.amount} onChange={(e) => {
                        const v = parseFloat(e.target.value || '0');
                        const next = [...config.prices[pl]]; next[idx] = { ...opt, amount: v }; setConfig({ ...config, prices: { ...config.prices, [pl]: next } });
                      }} className="w-32" />
                      <span className="text-xs text-gray-500">Currency</span>
                      <Input value={opt.currency} onChange={(e) => {
                        const v = e.target.value;
                        const next = [...config.prices[pl]]; next[idx] = { ...opt, currency: v }; setConfig({ ...config, prices: { ...config.prices, [pl]: next } });
                      }} className="w-24" />
                    </div>
                  ))}
                </div>
              ))}
            </section>

            <section>
              <h3 className="font-semibold mb-2">Limits</h3>
              <div className="flex items-center gap-3">
                <label className="w-48 text-sm text-gray-600">Homepage Max Slots</label>
                <Input type="number" value={config.limits?.homepageMaxSlots || 0} onChange={(e) => updateField(['limits','homepageMaxSlots'], parseInt(e.target.value || '0'))} className="w-32" />
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Rotation</h3>
              <div className="flex items-center gap-3">
                <label className="w-48 text-sm text-gray-600">Order</label>
                <Input value={config.settings?.rotation || ''} onChange={(e) => updateField(['settings','rotation'], e.target.value)} className="w-48" />
              </div>
            </section>

            <div className="flex justify-end">
              <Button onClick={save} disabled={loading}>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
