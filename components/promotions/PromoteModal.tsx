"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { promotionsApi, uploadApi } from "@/lib/api";
import Image from "next/image";

interface PromoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingCategory: 'rental' | 'sale' | 'service';
}

export default function PromoteModal({ open, onOpenChange, listingId, listingCategory }: PromoteModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [prices, setPrices] = useState<any>({ homepage: [], category_top: [] });
  const [chains, setChains] = useState<string[]>([]);
  const [placement, setPlacement] = useState<'homepage' | 'category_top' | ''>('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [chain, setChain] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [promotion, setPromotion] = useState<any>(null);
  const [txHash, setTxHash] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await promotionsApi.getPublicConfig();
        if (res.success) {
          setPrices(res.data.prices || { homepage: [], category_top: [] });
          setChains(res.data.chainsAvailable || []);
        }
      } catch {}
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPlacement('');
    setDurationDays(7);
    setChain('');
    setPromotion(null);
    setTxHash('');
    setScreenshotUrl('');
    setError('');
  }, [open]);

  const durationOptions = useMemo(() => {
    return placement ? (prices[placement] || []) : [];
  }, [placement, prices]);

  const selectedPrice = useMemo(() => {
    const found = durationOptions.find((p: any) => p.days === durationDays);
    return found ? `${found.amount} ${found.currency}` : '';
  }, [durationOptions, durationDays]);

  const handleCreate = async () => {
    if (!placement || !durationDays || !chain) {
      setError('Please select placement, duration and chain');
      return;
    }
    try {
      setCreating(true);
      const res = await promotionsApi.createPromotion({ listingId, placement, durationDays, chain });
      if (!res.success) throw new Error(res.message || 'Failed to create promotion');
      setPromotion(res.data.promotion);
      // capture QR code for the selected chain's wallet
      if (res.data.payment?.qrDataUrl) {
        setQrDataUrl(res.data.payment.qrDataUrl);
      } else {
        setQrDataUrl('');
      }
      setStep(2);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create promotion');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!promotion) return;
    if (!txHash || !screenshotUrl) {
      setError('Please provide transaction hash and upload a screenshot');
      return;
    }
    try {
      setCreating(true);
      const res = await promotionsApi.submitPaymentProof(promotion._id, txHash, screenshotUrl);
      if (!res.success) throw new Error(res.message || 'Failed to submit proof');
      setStep(3);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Failed to submit proof');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Promote Listing</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Placement</Label>
              <Select value={placement} onValueChange={(v: any) => setPlacement(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage">Homepage Hero</SelectItem>
                  <SelectItem value="category_top">Top of Category ({listingCategory})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Select value={String(durationDays)} onValueChange={(v) => setDurationDays(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((opt: any) => (
                    <SelectItem key={opt.days} value={String(opt.days)}>
                      {opt.days} days — {opt.amount} {opt.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Chain</Label>
              <Select value={chain} onValueChange={(v) => setChain(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && promotion && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Pay the amount below and provide the payment details.</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">Placement:</span> {promotion.pricing.placement}</div>
              <div><span className="font-medium">Duration:</span> {promotion.pricing.durationDays} days</div>
              <div><span className="font-medium">Amount:</span> {promotion.pricing.amount} {promotion.pricing.currency}</div>
              <div><span className="font-medium">Chain:</span> {promotion.pricing.chain}</div>
              <div className="col-span-2"><span className="font-medium">Wallet:</span> {promotion.payment.walletAddress || '—'}</div>
            </div>
            {qrDataUrl && (
              <div className="flex justify-center">
                <Image src={qrDataUrl} alt="Wallet QR" width={160} height={160} />
              </div>
            )}
            <div>
              <Label>Transaction Hash</Label>
              <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Paste your tx hash" />
            </div>
            <div className="space-y-2">
              <Label>Payment Screenshot</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selectedFile || uploading}
                  onClick={async () => {
                    if (!selectedFile) return;
                    try {
                      setUploading(true);
                      const res = await uploadApi.uploadImage(selectedFile);
                      if (res.success) {
                        setScreenshotUrl(res.data.url);
                        setError('');
                      } else {
                        setError(res.message || 'Upload failed');
                      }
                    } catch (e: any) {
                      setError(e?.message || 'Upload failed');
                    } finally {
                      setUploading(false);
                    }
                  }}
                >
                  {uploading ? 'Uploading…' : 'Upload to Cloudinary'}
                </Button>
                {screenshotUrl && (
                  <span className="text-xs text-green-700">Uploaded</span>
                )}
              </div>
              {screenshotUrl && (
                <div className="mt-2">
                  <Image src={screenshotUrl} alt="Screenshot preview" width={200} height={120} className="rounded border" />
                </div>
              )}
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleSubmitProof} disabled={creating || uploading || !screenshotUrl || !txHash}>Submit Proof</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-green-700">Payment proof submitted. Your promotion is pending review.</div>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
