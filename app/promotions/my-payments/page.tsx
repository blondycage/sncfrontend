'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  CheckCircle, 
  X, 
  AlertTriangle,
  DollarSign, 
  Star,
  Calendar,
  Copy,
  QrCode,
  Upload,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { promotionsApi, uploadApi } from '@/lib/api';
import QRCode from 'qrcode';
import Image from 'next/image';

interface PromotionPayment {
  _id: string;
  listing: {
    _id: string;
    title: string;
    category: string;
  };
  pricing: {
    placement: 'homepage' | 'category_top';
    durationDays: number;
    amount: number;
    currency: string;
    chain: string;
  };
  payment: {
    walletAddress: string;
    screenshotUrl?: string;
    txHash?: string;
    verifiedAt?: string;
  };
  status: 'awaiting_payment' | 'submitted' | 'active' | 'rejected' | 'expired';
  createdAt: string;
}

export default function MyPromotionPaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [payments, setPayments] = useState<PromotionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PromotionPayment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [txHash, setTxHash] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await promotionsApi.getUserPromotions();
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch promotion payments',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (address: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
        duration: 3000
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "error",
        duration: 3000
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file',
          variant: 'error'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB',
          variant: 'error'
        });
        return;
      }
      setScreenshotFile(file);
    }
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null;
    
    try {
      setUploading(true);
      const response = await uploadApi.uploadImage(screenshotFile);
      if (response.success) {
        return response.data.url;
      }
      throw new Error(response.message || 'Upload failed');
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload payment screenshot',
        variant: 'error'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const submitPaymentProof = async () => {
    if (!selectedPayment || !txHash.trim()) {
      toast({
        title: 'Invalid Data',
        description: 'Transaction hash is required',
        variant: 'error'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      let screenshotUrl = '';
      if (screenshotFile) {
        const uploadedUrl = await uploadScreenshot();
        if (!uploadedUrl) return;
        screenshotUrl = uploadedUrl;
      }

      const response = await promotionsApi.submitPaymentProof(selectedPayment._id, txHash, screenshotUrl);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Payment proof submitted successfully'
        });
        setShowPaymentDialog(false);
        setTxHash('');
        setScreenshotFile(null);
        setQrDataUrl('');
        fetchPayments(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to submit proof');
      }
    } catch (error: any) {
      console.error('Error submitting proof:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to submit payment proof',
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentDialog = async (payment: PromotionPayment) => {
    setSelectedPayment(payment);
    setTxHash(payment.payment.txHash || '');
    setShowPaymentDialog(true);
    
    // Generate QR code for wallet address
    if (payment.payment.walletAddress) {
      await generateQRCode(payment.payment.walletAddress);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_payment':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Awaiting Payment
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        );
    }
  };

  const getPlacementLabel = (placement: string) => {
    return placement === 'homepage' ? 'Homepage Hero' : 'Category Top';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Promotion Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your listing promotions and payments</p>
        </div>
        <Button onClick={fetchPayments} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Promotion Payments</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any promotion payments yet. Start promoting your listings to increase visibility.
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{payment.listing.title}</h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{getPlacementLabel(payment.pricing.placement)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{payment.pricing.durationDays} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatPrice(payment.pricing.amount, payment.pricing.currency)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Network: {payment.pricing.chain.toUpperCase()}</span>
                      <span>•</span>
                      <span>Created: {formatDate(payment.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(payment.status === 'awaiting_payment' || payment.status === 'submitted') && (
                      <Button onClick={() => openPaymentDialog(payment)}>
                        {payment.status === 'awaiting_payment' ? 'Make Payment' : 'View/Update Payment'}
                      </Button>
                    )}
                    {payment.payment.txHash && (
                      <Badge variant="outline" className="text-xs">
                        TX: {payment.payment.txHash.slice(0, 6)}...{payment.payment.txHash.slice(-4)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment?.status === 'awaiting_payment' ? 'Complete Payment' : 'Payment Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Listing</Label>
                      <p className="text-sm">{selectedPayment.listing.title}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Placement</Label>
                      <p className="text-sm">{getPlacementLabel(selectedPayment.pricing.placement)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Duration</Label>
                      <p className="text-sm">{selectedPayment.pricing.durationDays} days</p>
                    </div>
                    <div>
                      <Label className="font-medium">Amount</Label>
                      <p className="text-sm font-bold text-green-600">
                        {formatPrice(selectedPayment.pricing.amount, selectedPayment.pricing.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Instructions</h3>
                  
                  {/* QR Code */}
                  {qrDataUrl && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Image 
                          src={qrDataUrl} 
                          alt="Wallet QR Code" 
                          width={200} 
                          height={200} 
                          className="mx-auto border rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground mt-3">
                          Scan with your crypto wallet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Wallet Address */}
                  <div>
                    <Label className="font-medium">Wallet Address</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input 
                        value={selectedPayment.payment.walletAddress} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedPayment.payment.walletAddress)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Payment Proof Form */}
                {selectedPayment.status === 'awaiting_payment' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Submit Payment Proof</h3>
                    
                    <div>
                      <Label htmlFor="txHash">Transaction Hash *</Label>
                      <Input
                        id="txHash"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="Enter transaction hash"
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label>Payment Screenshot (Optional)</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {screenshotFile && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {screenshotFile.name} selected
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      onClick={submitPaymentProof}
                      disabled={!txHash.trim() || submitting || uploading}
                      className="w-full"
                    >
                      {submitting ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit Payment Proof'}
                    </Button>
                  </div>
                )}
                
                {/* Payment Status */}
                {selectedPayment.status !== 'awaiting_payment' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Status</h3>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            {getStatusBadge(selectedPayment.status)}
                          </div>
                          
                          {selectedPayment.payment.txHash && (
                            <div className="flex justify-between">
                              <span>Transaction:</span>
                              <span className="font-mono text-sm">
                                {selectedPayment.payment.txHash.slice(0, 10)}...{selectedPayment.payment.txHash.slice(-6)}
                              </span>
                            </div>
                          )}
                          
                          {selectedPayment.payment.verifiedAt && (
                            <div className="flex justify-between">
                              <span>Verified:</span>
                              <span className="text-sm">{formatDate(selectedPayment.payment.verifiedAt)}</span>
                            </div>
                          )}
                          
                          {selectedPayment.payment.screenshotUrl && (
                            <div>
                              <Button
                                variant="outline"
                                onClick={() => window.open(selectedPayment.payment.screenshotUrl, '_blank')}
                                className="w-full mt-2"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Payment Screenshot
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}