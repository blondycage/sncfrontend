'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, CheckCircle, Clock, AlertCircle, Copy, ExternalLink,
  Wallet, CreditCard, FileImage, Upload, DollarSign, QrCode, Loader2
} from "lucide-react"
import { useToast } from '@/components/ui/toast'
import { uploadApi } from '@/lib/api'
import QRCode from 'qrcode'

interface Payment {
  _id: string
  paymentId: string
  user: { firstName: string; lastName: string; email: string }
  itemType: 'promotion' | 'listing' | 'property' | 'education_application' | 'featured_listing'
  paymentType: 'promotion_fee' | 'listing_fee' | 'featured_listing' | 'application_fee' | 'premium_placement' | 'service_payment'
  status: 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected' | 'refunded'
  pricing: {
    amount: number
    currency: string
    chain: string
    description: string
  }
  payment: {
    walletAddress: string
    txHash?: string
    screenshotUrl?: string
    verifiedAt?: string
    reviewer?: { firstName: string; lastName: string }
  }
  metadata: {
    duration?: number
    placement?: string
    features?: string[]
    serviceDetails?: {
      listingTitle?: string
      listingCategory?: string
      ownerName?: string
      ownerContact?: string
      customAmount?: number
      agreedTerms?: string
    }
  }
  itemReference?: any
  timeline: Array<{
    status: string
    date: string
    notes?: string
    updatedBy?: { firstName: string; lastName: string }
  }>
  createdAt: string
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitDialog, setSubmitDialog] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [proofData, setProofData] = useState({
    txHash: '',
    screenshotUrl: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchPayment()
    }
  }, [params.id])

  useEffect(() => {
    if (payment?.payment?.walletAddress) {
      generateQRCode(payment.payment.walletAddress)
    }
  }, [payment?.payment?.walletAddress])

  const generateQRCode = async (address: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file',
        variant: 'error'
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'error'
      })
      return
    }

    setUploadingImage(true)
    try {
      const result = await uploadApi.uploadImage(file)
      setProofData(prev => ({ ...prev, screenshotUrl: result.data.url }))
      toast({
        title: 'Success',
        description: 'Payment proof image uploaded successfully'
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload payment proof image',
        variant: 'error'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const fetchPayment = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPayment(data.data)
      } else {
        toast({
          title: 'Error',
          description: 'Payment not found',
          variant: 'error'
        })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payment details',
        variant: 'error'
      })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProof = async () => {
    if (!payment || !proofData.txHash.trim()) {
      toast({
        title: 'Invalid Data',
        description: 'Transaction hash is required',
        variant: 'error'
      })
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${payment._id}/submit-proof`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proofData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment proof submitted successfully'
        })
        setSubmitDialog(false)
        setProofData({ txHash: '', screenshotUrl: '' })
        fetchPayment() // Refresh payment data
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to submit proof',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Error submitting proof:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit payment proof',
        variant: 'error'
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard'
    })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-gray-500', label: 'Pending Payment', icon: Clock },
      submitted: { color: 'bg-blue-500', label: 'Under Review', icon: FileImage },
      under_review: { color: 'bg-yellow-500', label: 'Under Review', icon: AlertCircle },
      verified: { color: 'bg-green-500', label: 'Payment Verified', icon: CheckCircle },
      rejected: { color: 'bg-red-500', label: 'Payment Rejected', icon: AlertCircle },
      refunded: { color: 'bg-purple-500', label: 'Refunded', icon: CreditCard }
    }
    
    const statusConfig = config[status as keyof typeof config] || { color: 'bg-gray-500', label: status, icon: Clock }
    const IconComponent = statusConfig.icon
    
    return (
      <Badge className={`${statusConfig.color} text-white flex items-center gap-1 text-sm px-3 py-1`}>
        <IconComponent className="h-4 w-4" />
        {statusConfig.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The payment you're looking for could not be found.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-soft py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Payment #{payment.paymentId}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Created {formatDate(payment.createdAt)}
            </p>
          </div>
        </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">Payment Status</h3>
              {getStatusBadge(payment.status)}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(payment.pricing.amount, payment.pricing.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                {payment.pricing.chain.toUpperCase()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      {payment.paymentType === 'service_payment' && payment.metadata?.serviceDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Service/Listing</Label>
                <p className="text-sm">{payment.metadata.serviceDetails.listingTitle}</p>
              </div>
              <div>
                <Label className="font-medium">Category</Label>
                <p className="text-sm">{payment.metadata.serviceDetails.listingCategory}</p>
              </div>
              <div>
                <Label className="font-medium">Service Provider</Label>
                <p className="text-sm">{payment.metadata.serviceDetails.ownerName}</p>
              </div>
              <div>
                <Label className="font-medium">Provider Contact</Label>
                <p className="text-sm">{payment.metadata.serviceDetails.ownerContact}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment Instructions
            </CardTitle>
            <CardDescription>
              Send the exact amount to the wallet address below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Section */}
            {qrCodeUrl && (
              <div className="text-center">
                <Label className="font-medium text-base mb-3 block">Scan QR Code</Label>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                  <img 
                    src={qrCodeUrl} 
                    alt="Wallet Address QR Code" 
                    className="w-48 h-48 sm:w-56 sm:h-56"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Scan with your wallet app to get the address
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="font-medium text-base">Wallet Address</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input 
                    value={payment.payment.walletAddress} 
                    readOnly 
                    className="font-mono text-xs sm:text-sm flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(payment.payment.walletAddress)}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-medium text-base">Amount to Send</Label>
                <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(payment.pricing.amount)} ({payment.pricing.chain.toUpperCase()})
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Send exactly the amount shown above to the wallet address. 
                  After sending, submit your transaction hash as proof of payment.
                </p>
              </div>
            </div>

            {payment.status === 'pending' && (
              <Dialog open={submitDialog} onOpenChange={setSubmitDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Payment Proof
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Payment Proof</DialogTitle>
                    <DialogDescription>
                      Provide your transaction hash and optional screenshot as proof of payment
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="txHash">Transaction Hash *</Label>
                      <Input
                        id="txHash"
                        placeholder="Enter your transaction hash"
                        value={proofData.txHash}
                        onChange={(e) => setProofData(prev => ({ ...prev, txHash: e.target.value }))}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Payment Proof Screenshot (Optional)</Label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex-1"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Screenshot
                              </>
                            )}
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        
                        {proofData.screenshotUrl && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-800">Screenshot uploaded successfully</span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(proofData.screenshotUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Upload a screenshot of your transaction as additional proof (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSubmitDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitProof}>
                      Submit Proof
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payment.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{event.status.replace('_', ' ')}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>
                    )}
                    {event.updatedBy && (
                      <p className="text-xs text-muted-foreground">
                        By {event.updatedBy.firstName} {event.updatedBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details */}
      {payment.payment.txHash && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium">Transaction Hash</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={payment.payment.txHash} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(payment.payment.txHash!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {payment.payment.screenshotUrl && (
              <div>
                <Label className="font-medium">Payment Screenshot</Label>
                <div className="mt-1">
                  <Button
                    variant="outline"
                    onClick={() => window.open(payment.payment.screenshotUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Screenshot
                  </Button>
                </div>
              </div>
            )}

            {payment.payment.verifiedAt && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Payment verified on {formatDate(payment.payment.verifiedAt)}
                  {payment.payment.reviewer && (
                    <span> by {payment.payment.reviewer.firstName} {payment.payment.reviewer.lastName}</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}