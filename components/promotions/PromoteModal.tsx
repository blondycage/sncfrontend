"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { promotionsApi, uploadApi } from "@/lib/api";
import Image from "next/image";
import QRCode from 'qrcode';
import { Copy, CheckCircle, ExternalLink, Wallet } from "lucide-react";

interface Chain {
  name: string;
  displayName: string;
  enabled: boolean;
  walletAddress: string;
  symbol: string;
}

interface PromoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingCategory: 'rental' | 'sale' | 'service';
}

export default function PromoteModal({ open, onOpenChange, listingId, listingCategory }: PromoteModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [prices, setPrices] = useState<any>({ homepage: [], category_top: [] });
  const [chains, setChains] = useState<Chain[]>([]);
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
  const [copiedAddress, setCopiedAddress] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await promotionsApi.getPublicConfig();
        if (res.success) {
          setPrices(res.data.prices || { homepage: [], category_top: [] });
          setChains(res.data.chains || []);
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
    setQrDataUrl('');
    setCopiedAddress('');
  }, [open]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
        duration: 3000
      });
      
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "error",
        duration: 3000
      });
    }
  };

  const generateQRCode = async (address: string, amount?: string, symbol?: string) => {
    try {
      let qrData = address;
      if (amount && symbol) {
        // Create a payment URL for better UX
        if (symbol === 'BTC') {
          qrData = `bitcoin:${address}?amount=${amount}`;
        } else if (symbol === 'ETH') {
          qrData = `ethereum:${address}?value=${amount}`;
        }
      }
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const durationOptions = useMemo(() => {
    return placement ? (prices[placement] || []) : [];
  }, [placement, prices]);

  const selectedPrice = useMemo(() => {
    const found = durationOptions.find((p: any) => p.days === durationDays);
    return found ? { amount: found.amount, currency: found.currency } : null;
  }, [durationOptions, durationDays]);

  const selectedChain = useMemo(() => {
    return chains.find(c => c.name === chain);
  }, [chains, chain]);

  // Generate QR code when chain is selected or when promotion is created
  useEffect(() => {
    if (selectedChain?.walletAddress && selectedPrice) {
      generateQRCode(
        selectedChain.walletAddress,
        selectedPrice.amount?.toString(),
        selectedChain.symbol
      );
    }
  }, [selectedChain?.walletAddress, selectedPrice?.amount, selectedChain?.symbol]);

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
      
      // Handle existing promotion case
      if (res.existingPromotion) {
        toast({
          title: "Existing Promotion Found",
          description: res.message || "Continue with your existing promotion process",
          duration: 5000
        });
        
        // Show additional guidance for existing promotion
        setError('You have an existing promotion for this placement. Continue with the payment process below, or visit your payments page to manage all promotion payments.');
      }
      
      // Generate QR code from the API response (handles both new and existing promotions)
      if (res.data.payment?.qrDataUrl) {
        setQrDataUrl(res.data.payment.qrDataUrl);
      } else if (selectedChain?.walletAddress && selectedPrice) {
        await generateQRCode(
          selectedChain.walletAddress, 
          selectedPrice.amount?.toString(), 
          selectedChain.symbol
        );
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promote Listing</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Placement</Label>
                  <p className="text-sm text-muted-foreground mb-2">Choose where to promote your listing</p>
                  <Select value={placement} onValueChange={(v: any) => setPlacement(v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage" className="p-4">
                        <div>
                          <div className="font-medium">Homepage Hero</div>
                          <div className="text-sm text-muted-foreground">Prime visibility on homepage</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="category_top" className="p-4">
                        <div>
                          <div className="font-medium">Top of Category</div>
                          <div className="text-sm text-muted-foreground">Featured in {listingCategory} category</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Duration & Pricing</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select promotion duration</p>
                  <Select value={String(durationDays)} onValueChange={(v) => setDurationDays(parseInt(v))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((opt: any) => (
                        <SelectItem key={opt.days} value={String(opt.days)} className="p-4">
                          <div className="flex justify-between items-center w-full">
                            <span>{opt.days} days</span>
                            <Badge variant="outline">{opt.amount} {opt.currency}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Payment Method</Label>
                  <p className="text-sm text-muted-foreground mb-2">Choose cryptocurrency for payment</p>
                  <Select value={chain} onValueChange={setChain}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {chains.filter(c => c.enabled).map((c) => (
                        <SelectItem key={c.name} value={c.name} className="p-4">
                          <div className="flex items-center gap-3">
                            <Wallet className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{c.displayName}</div>
                              <div className="text-sm text-muted-foreground">{c.symbol}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedPrice && selectedChain && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Placement:</span>
                          <span className="capitalize">{placement?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{durationDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment:</span>
                          <span>{selectedChain.displayName} ({selectedChain.symbol})</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1 mt-2">
                          <span>Total:</span>
                          <span>{selectedPrice.amount} {selectedPrice.currency}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating || !placement || !durationDays || !chain}>
                {creating ? 'Creating...' : 'Continue to Payment'}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && promotion && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Payment Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="font-medium text-muted-foreground">Placement:</span></div>
                        <div className="capitalize">{promotion.pricing.placement.replace('_', ' ')}</div>
                        <div><span className="font-medium text-muted-foreground">Duration:</span></div>
                        <div>{promotion.pricing.durationDays} days</div>
                        <div><span className="font-medium text-muted-foreground">Amount:</span></div>
                        <div className="font-semibold">{promotion.pricing.amount} {promotion.pricing.currency}</div>
                        <div><span className="font-medium text-muted-foreground">Network:</span></div>
                        <div className="flex items-center gap-2">
                          {selectedChain?.displayName} ({selectedChain?.symbol})
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Wallet Address */}
                <div>
                  <Label className="text-base font-medium">Wallet Address</Label>
                  <p className="text-sm text-muted-foreground mb-2">Send payment to this address</p>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{selectedChain?.displayName}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="flex-1 text-sm break-all font-mono">
                          {selectedChain?.walletAddress}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedChain?.walletAddress || '')}
                          className="shrink-0"
                        >
                          {copiedAddress === selectedChain?.walletAddress ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* QR Code */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">QR Code</h3>
                  <Card>
                    <CardContent className="p-6 flex flex-col items-center">
                      {qrDataUrl ? (
                        <div className="text-center space-y-3">
                          <Image 
                            src={qrDataUrl} 
                            alt="Wallet QR Code" 
                            width={200} 
                            height={200} 
                            className="border rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground max-w-xs">
                            Scan with your crypto wallet to pay
                          </p>
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">QR Code generating...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            {/* Payment Proof Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Submit Payment Proof</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-medium">Transaction Hash</Label>
                  <p className="text-sm text-muted-foreground mb-2">Enter the transaction hash from your payment</p>
                  <Input 
                    value={txHash} 
                    onChange={(e) => setTxHash(e.target.value)} 
                    placeholder="0x..." 
                    className="h-12 font-mono"
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium">Payment Screenshot</Label>
                  <p className="text-sm text-muted-foreground mb-2">Upload a screenshot of your payment</p>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
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
                            toast({
                              title: "Success",
                              description: "Screenshot uploaded successfully",
                              duration: 3000
                            });
                          } else {
                            setError(res.message || 'Upload failed');
                          }
                        } catch (e: any) {
                          setError(e?.message || 'Upload failed');
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      {uploading ? 'Uploading...' : 'Upload Screenshot'}
                    </Button>
                    {screenshotUrl && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span>Screenshot uploaded successfully</span>
                      </div>
                    )}
                  </div>
                  {screenshotUrl && (
                    <div className="mt-4">
                      <Image 
                        src={screenshotUrl} 
                        alt="Payment screenshot" 
                        width={300} 
                        height={200} 
                        className="rounded border max-w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back to Configuration</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.open('/promotions/my-payments', '_blank');
                  }}
                >
                  Manage All Payments
                </Button>
              </div>
              <Button 
                onClick={handleSubmitProof} 
                disabled={creating || uploading || !screenshotUrl || !txHash}
                className="sm:min-w-[140px]"
              >
                {creating ? 'Submitting...' : 'Submit Payment Proof'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">Payment Submitted Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                Your payment proof has been submitted and is now pending review. You'll receive a notification once your promotion is approved.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>• Review typically takes 2-24 hours</p>
                <p>• You can check status in your dashboard</p>
                <p>• Promotion will activate once approved</p>
              </div>
            </div>
            <Button onClick={() => onOpenChange(false)} className="min-w-[120px]">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
