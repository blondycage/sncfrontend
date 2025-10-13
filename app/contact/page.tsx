'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, HelpCircle, AlertCircle } from "lucide-react"
import { useToast } from '@/components/ui/toast'
import Link from "next/link"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'error'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Message Sent!',
          description: 'Thank you for contacting us. We\'ll respond within 24-48 hours.',
          variant: 'success'
        })

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          category: 'general',
          message: ''
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again or email us directly.',
        variant: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <MessageCircle className="h-16 w-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            Have questions or need assistance? We're here to help you succeed on SearchNorthCyprus
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Send className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Send Us a Message</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone Number (Optional)
                        </label>
                        <Input
                          type="tel"
                          placeholder="+90 533 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing & Payments</SelectItem>
                            <SelectItem value="listing">Listing Issues</SelectItem>
                            <SelectItem value="account">Account Help</SelectItem>
                            <SelectItem value="report">Report a Problem</SelectItem>
                            <SelectItem value="business">Business Partnership</SelectItem>
                            <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        type="text"
                        placeholder="Brief description of your inquiry"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Tell us how we can help you..."
                        rows={8}
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        required
                        className="resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Please provide as much detail as possible to help us assist you better.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-600 text-center">
                      By submitting this form, you agree to our{' '}
                      <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information Sidebar */}
            <div className="space-y-6">
              {/* Contact Info Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Email</p>
                        <a href="mailto:support@searchnorthcyprus.org" className="text-blue-600 hover:underline text-sm">
                          support@searchnorthcyprus.org
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          General inquiries & support
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Business Email</p>
                        <a href="mailto:business@searchnorthcyprus.org" className="text-blue-600 hover:underline text-sm">
                          business@searchnorthcyprus.org
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Partnerships & advertising
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Admin Email</p>
                        <a href="mailto:admin@searchnorthcyprus.org" className="text-blue-600 hover:underline text-sm">
                          admin@searchnorthcyprus.org
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Platform administration
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Location</p>
                        <p className="text-sm text-gray-600">
                          North Cyprus
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Serving all regions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Response Time</p>
                        <p className="text-sm text-gray-600">
                          Within 24-48 hours
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Monday - Sunday
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-bold">Quick Help</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm mb-1">How do I create a listing?</p>
                      <p className="text-xs text-gray-600">
                        Register an account, go to your dashboard, and click "Create Listing". Fill in the details and submit for review.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">How long does approval take?</p>
                      <p className="text-xs text-gray-600">
                        Most listings are reviewed within 24-48 hours. You'll receive an email notification once approved or rejected.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">How do promotions work?</p>
                      <p className="text-xs text-gray-600">
                        Promoted listings get featured placement on the homepage or category pages. Pay with cryptocurrency and submit your transaction hash.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Upload quota information</p>
                      <p className="text-xs text-gray-600">
                        Free users get 3 listings per month. Advertisers can purchase additional uploads. Quotas reset monthly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Issues Card */}
              <Card className="border-2 border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h3 className="text-xl font-bold text-red-900">Report Issues</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Found suspicious content, scams, or inappropriate listings?
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      <strong>Report Email:</strong>{' '}
                      <a href="mailto:report@searchnorthcyprus.org" className="text-red-600 hover:underline">
                        report@searchnorthcyprus.org
                      </a>
                    </p>
                    <p className="text-xs text-gray-600">
                      Include: Listing URL, description of issue, and any relevant screenshots.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Social & Resources */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Resources</h3>
                  <div className="space-y-2">
                    <Link href="/privacy-policy" className="block text-blue-600 hover:underline text-sm">
                      Privacy Policy
                    </Link>
                    <Link href="/terms-of-service" className="block text-blue-600 hover:underline text-sm">
                      Terms of Service
                    </Link>
                    <Link href="/search" className="block text-blue-600 hover:underline text-sm">
                      Browse Listings
                    </Link>
                    <Link href="/dashboard" className="block text-blue-600 hover:underline text-sm">
                      User Dashboard
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Email Support</h3>
                <p className="text-sm text-gray-600">
                  Get detailed responses via email. We respond to all inquiries within 24-48 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Community Help</h3>
                <p className="text-sm text-gray-600">
                  Connect with other users and share experiences. Join our growing community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <HelpCircle className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Documentation</h3>
                <p className="text-sm text-gray-600">
                  Browse our guides and documentation for self-service support and tutorials.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Hours Notice */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Our Commitment to You</h3>
                  <p className="text-gray-700 mb-2">
                    At SearchNorthCyprus, we're committed to providing excellent customer service. While we operate 24/7 online, our support team typically responds within 24-48 hours during business days.
                  </p>
                  <p className="text-gray-700">
                    For urgent security issues or platform emergencies, please mark your message as "URGENT" in the subject line and we'll prioritize your request.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
