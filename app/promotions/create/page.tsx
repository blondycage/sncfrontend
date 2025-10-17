'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Star,
  Globe,
  TrendingUp,
  Calendar,
  DollarSign,
  CreditCard,
  Upload,
  Check,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { promotionsApi, listingsApi } from '@/lib/api';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    frequency?: string;
  };
  category: string;
  location: {
    city: string;
    area: string;
  };
  images: string[];
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface PromotionConfig {
  prices: {
    homepage: Array<{ days: number; amount: number; currency: string }>;
    category_top: Array<{ days: number; amount: number; currency: string }>;
  };
  chains: Array<{
    name: string;
    displayName: string;
    enabled: boolean;
    walletAddress: string;
    symbol: string;
  }>;
}

interface PromotionData {
  listingId: string;
  placement: 'homepage' | 'category_top';
  durationDays: number;
  chain: string;
}

export default function CreatePromotionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [config, setConfig] = useState<PromotionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [step, setStep] = useState(1); // 1: Setup, 2: Payment, 3: Proof
  const [promotionId, setPromotionId] = useState<string | null>(null);

  const [formData, setFormData] = useState<PromotionData>({
    listingId: searchParams.get('listing') || '',
    placement: 'category_top',
    durationDays: 7,
    chain: ''
  });

  const [paymentData, setPaymentData] = useState({
    txHash: '',
    screenshotUrl: ''
  });

  const [selectedPrice, setSelectedPrice] = useState<{amount: number; currency: string} | null>(null);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (config && formData.placement && formData.durationDays) {
      updatePricing();
    }
  }, [config, formData.placement, formData.durationDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [configResponse, listingResponse] = await Promise.all([
        promotionsApi.getPublicConfig(),
        formData.listingId ? listingsApi.getListingById(formData.listingId) : Promise.resolve({ success: false })
      ]);

      if (configResponse.success) {
        setConfig(configResponse.data);
        // Set default chain
        const enabledChain = configResponse.data.chains.find((c: any) => c.enabled);
        if (enabledChain) {
          setFormData(prev => ({ ...prev, chain: enabledChain.name }));
        }
      }

      if (listingResponse.success) {
        setListing(listingResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promotion data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = () => {
    if (!config) return;

    const prices = config.prices[formData.placement];
    const priceOption = prices.find(p => p.days === formData.durationDays) || prices[0];
    setSelectedPrice(priceOption);

    // Update wallet address
    const selectedChain = config.chains.find(c => c.name === formData.chain);
    if (selectedChain) {
      setWalletAddress(selectedChain.walletAddress);
    }
  };

  const handleCreatePromotion = async () => {
    if (!listing || !selectedPrice) return;

    try {
      setCreating(true);
      const response = await promotionsApi.createPromotion(formData);
      
      if (response.success) {
        setPromotionId(response.data._id);
        setStep(2);
        toast({
          title: 'Success',
          description: 'Promotion created! Please proceed with payment.'
        });
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to create promotion',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitPaymentProof = async () => {
    if (!promotionId || !paymentData.txHash) {
      toast({
        title: 'Validation Error',
        description: 'Transaction hash is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmittingPayment(true);
      const response = await promotionsApi.submitPaymentProof(
        promotionId, 
        paymentData.txHash, 
        paymentData.screenshotUrl
      );
      
      if (response.success) {
        setStep(3);
        toast({
          title: 'Success',
          description: 'Payment proof submitted for review'
        });
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit payment proof',
        variant: 'destructive'
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard'
    });
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing && formData.listingId) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
            <p className="text-gray-600 mb-6">The listing you're trying to promote doesn't exist or you don't have access to it.</p>
            <Link href="/promotions">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Promotions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/promotions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Promotion</h1>
              <p className="text-gray-600 mt-1">Boost your listing's visibility</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Setup', icon: Star },
              { step: 2, title: 'Payment', icon: CreditCard },
              { step: 3, title: 'Complete', icon: Check }
            ].map(({ step: stepNum, title, icon: Icon }) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 ${step >= stepNum ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {title}
                </span>
                {stepNum < 3 && (
                  <div className={`ml-8 w-16 h-0.5 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Setup */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Listing Preview */}
            {listing && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={listing.images[0] || '/placeholder.jpg'}
                        alt={listing.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{listing.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{listing.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary">{listing.category}</Badge>
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(listing.price.amount, listing.price.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Promotion Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Placement Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Choose Placement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.placement === 'homepage' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, placement: 'homepage' }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold">Homepage Hero</span>
                      </div>
                      {formData.placement === 'homepage' && <Check className="h-5 w-5 text-yellow-600" />}
                    </div>
                    <p className="text-sm text-gray-600">Premium placement on homepage</p>
                  </div>

                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.placement === 'category_top' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, placement: 'category_top' }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Category Top</span>
                      </div>
                      {formData.placement === 'category_top' && <Check className="h-5 w-5 text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-600">Top of category listings</p>
                  </div>
                </CardContent>
              </Card>

              {/* Duration & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Duration & Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Duration</Label>
                    <Select 
                      value={formData.durationDays.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, durationDays: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config?.prices[formData.placement]?.map((price) => (
                          <SelectItem key={price.days} value={price.days.toString()}>
                            {price.days} days - {formatPrice(price.amount, price.currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPrice && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-green-800">Total Cost</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(selectedPrice.amount, selectedPrice.currency)}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        For {formData.durationDays} days of promotion
                      </p>
                    </div>
                  )}

                  <div>
                    <Label>Payment Method</Label>
                    <Select 
                      value={formData.chain} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, chain: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config?.chains?.filter(c => c.enabled).map((chain) => (
                          <SelectItem key={chain.name} value={chain.name}>
                            {chain.displayName} ({chain.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleCreatePromotion}
                disabled={creating || !selectedPrice || !listing}
                size="lg"
              >
                {creating ? 'Creating...' : 'Proceed to Payment'}
                <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Payment Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Placement:</span>
                      <span className="font-medium">
                        {formData.placement === 'homepage' ? 'Homepage Hero' : 'Category Top'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{formData.durationDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span className="font-medium">
                        {config?.chains.find(c => c.name === formData.chain)?.displayName}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                      <span>Total:</span>
                      <span>{selectedPrice && formatPrice(selectedPrice.amount, selectedPrice.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <Label>Send Payment To:</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input value={walletAddress} readOnly className="font-mono text-sm" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(walletAddress)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Send the exact amount to this address using the selected blockchain network
                  </p>
                </div>

                {/* Payment Proof Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="txHash">Transaction Hash *</Label>
                    <Input
                      id="txHash"
                      value={paymentData.txHash}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, txHash: e.target.value }))}
                      placeholder="Enter transaction hash from your payment"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                    <Input
                      id="screenshot"
                      type="url"
                      value={paymentData.screenshotUrl}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, screenshotUrl: e.target.value }))}
                      placeholder="https://example.com/screenshot.jpg"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Upload your payment screenshot to a hosting service and paste the URL here
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmitPaymentProof}
                    disabled={submittingPayment || !paymentData.txHash}
                  >
                    {submittingPayment ? 'Submitting...' : 'Submit Payment Proof'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your payment proof has been submitted for review. We'll notify you once your promotion is approved and goes live.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">What's Next?</p>
                  <ul className="space-y-1 text-left">
                    <li>• Our team will verify your payment</li>
                    <li>• You'll receive an email notification</li>
                    <li>• Your promotion will go live within 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/promotions/history">
                <Button variant="outline">
                  View Promotion History
                </Button>
              </Link>
              <Link href="/promotions">
                <Button>
                  Create Another Promotion
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
