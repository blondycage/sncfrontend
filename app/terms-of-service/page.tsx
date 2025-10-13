'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Scale, FileText, AlertTriangle, CheckCircle, XCircle, DollarSign, Shield } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Scale className="h-16 w-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            Please read these terms carefully before using SearchNorthCyprus
          </p>
          <p className="text-center text-blue-200 mt-4">
            Last Updated: January 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Agreement to Terms */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Agreement to Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Welcome to SearchNorthCyprus! These Terms of Service ("Terms") govern your access to and use of the SearchNorthCyprus website and platform (collectively, the "Service") operated by SearchNorthCyprus ("we," "us," or "our").
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
                </p>
                <p className="font-semibold text-gray-900">
                  You must be at least 16 years old to use this Service. By using the Service, you represent and warrant that you are at least 16 years of age.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Service Description</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  SearchNorthCyprus is North Cyprus's premier online marketplace that provides:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Property Listings:</strong> Rental and sale listings for residential and commercial real estate</li>
                  <li><strong>Vehicle Listings:</strong> Cars, motorcycles, and other vehicles for sale or rent</li>
                  <li><strong>Service Marketplace:</strong> Local services including home improvement, professional services, and more</li>
                  <li><strong>Job Board:</strong> Employment opportunities across various industries in North Cyprus</li>
                  <li><strong>Educational Programs:</strong> Information about universities, courses, and educational opportunities</li>
                  <li><strong>User Profiles:</strong> Personal and business profiles for networking and credibility</li>
                  <li><strong>Search and Discovery:</strong> Advanced search tools to find what you need</li>
                  <li><strong>Communication Tools:</strong> Messaging and contact features to connect buyers and sellers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">User Accounts</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-900">Account Registration</h3>
                <p>
                  To use certain features of the Service, you must register for an account. When creating an account, you must:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Choose a strong password and keep it confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized account access</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Account Types</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Regular Users:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>3 free listing uploads per month</li>
                      <li>Browse and search all content</li>
                      <li>Apply for jobs and inquire about services</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Advertisers (Business Owners, Agents, Property Owners):</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Same features as regular users</li>
                      <li>Can purchase additional listing uploads</li>
                      <li>Access to promotion features</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Administrators:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Content moderation privileges</li>
                      <li>User management capabilities</li>
                      <li>Platform analytics access</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Authentication Methods</h3>
                <p>You may register and login using:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email and password</li>
                  <li>Telegram account integration</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Listing Rules */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Listing Rules and Content Policy</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-900">Permitted Content</h3>
                <p>You may create listings for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Real estate properties for rent or sale (residential, commercial, land)</li>
                  <li>Vehicles for sale or rent</li>
                  <li>Legal services and professional offerings</li>
                  <li>Job opportunities with legitimate businesses</li>
                  <li>Educational programs and courses</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Prohibited Content</h3>
                <p>You may NOT post listings that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contain false, misleading, or fraudulent information</li>
                  <li>Violate any local, national, or international law</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Contain explicit, offensive, or inappropriate content</li>
                  <li>Promote illegal goods, services, or activities</li>
                  <li>Include malware, viruses, or malicious code</li>
                  <li>Constitute spam or unsolicited advertising</li>
                  <li>Discriminate based on race, religion, gender, or other protected characteristics</li>
                  <li>Involve pyramid schemes, multi-level marketing (without disclosure), or scams</li>
                  <li>Promote weapons, drugs, or other controlled substances</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Listing Requirements</h3>
                <p>All listings must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Have a clear, descriptive title (5-100 characters)</li>
                  <li>Include a detailed description (10-2000 characters)</li>
                  <li>Specify accurate pricing and currency</li>
                  <li>Include at least one image (for property and vehicle listings)</li>
                  <li>Provide valid contact information</li>
                  <li>Be categorized correctly (rental, sale, or service)</li>
                  <li>Include accurate location information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Moderation</h3>
                <p>
                  All listings are subject to moderation and approval before becoming publicly visible. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Review, approve, or reject any listing</li>
                  <li>Remove listings that violate these Terms</li>
                  <li>Suspend or terminate accounts for repeated violations</li>
                  <li>Edit listings for formatting or clarity (with notice)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Listing Expiration</h3>
                <p>
                  Listings automatically expire after 30 days. You may renew or relist expired content at any time, subject to your upload quota.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment and Promotions */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Payments and Promotions</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-900">Free Services</h3>
                <p>
                  SearchNorthCyprus offers free basic services including browsing, searching, and 3 free listing uploads per month for registered users.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Paid Services</h3>
                <p>We offer the following paid services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Additional Uploads:</strong> Purchase more listing uploads beyond your free quota</li>
                  <li><strong>Listing Promotions:</strong> Featured placement on homepage or category pages</li>
                  <li><strong>Premium Listings:</strong> Enhanced visibility in search results</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Payment Methods</h3>
                <p>
                  We currently accept cryptocurrency payments (USDT, Bitcoin, Ethereum) for promoted listings and premium features. Payment must be verified through transaction hash submission.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Refund Policy</h3>
                <p>
                  Payments for promotions are generally non-refundable. However, we may issue refunds in the following cases:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Technical issues preventing service delivery</li>
                  <li>Duplicate payments</li>
                  <li>Services not delivered as described</li>
                </ul>
                <p>
                  Refund requests must be submitted within 7 days of purchase to <a href="mailto:billing@searchnorthcyprus.org" className="text-blue-600 hover:underline">billing@searchnorthcyprus.org</a>.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Promotion Duration</h3>
                <p>
                  Promoted listings are active for the purchased duration (e.g., 7 days, 14 days, 30 days). Promotions cannot be paused or transferred to other listings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">User Conduct and Prohibited Activities</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service for any illegal purpose or in violation of any laws</li>
                  <li>Impersonate any person or entity</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Collect or harvest information about other users without consent</li>
                  <li>Attempt to gain unauthorized access to the Service or other accounts</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Use automated tools (bots, scrapers) without permission</li>
                  <li>Post duplicate or spam listings</li>
                  <li>Manipulate search rankings or reviews</li>
                  <li>Bypass any content moderation or security measures</li>
                  <li>Create multiple accounts to circumvent restrictions</li>
                  <li>Use the Service to distribute malware or viruses</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Intellectual Property Rights</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-900">Our Content</h3>
                <p>
                  The Service and its original content, features, and functionality are owned by SearchNorthCyprus and are protected by international copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Your Content</h3>
                <p>
                  You retain all rights to the content you post on the Service (listings, images, descriptions). By posting content, you grant us a worldwide, non-exclusive, royalty-free license to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Display your content on the Service</li>
                  <li>Store and process your content for Service operation</li>
                  <li>Use your content for marketing and promotional purposes (with attribution)</li>
                  <li>Create derivative works for optimization (e.g., image resizing)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Copyright Infringement</h3>
                <p>
                  We respect intellectual property rights. If you believe your copyrighted work has been copied in a way that constitutes infringement, please contact us at <a href="mailto:copyright@searchnorthcyprus.org" className="text-blue-600 hover:underline">copyright@searchnorthcyprus.org</a> with:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Description of the copyrighted work</li>
                  <li>URL of the infringing content</li>
                  <li>Your contact information</li>
                  <li>Statement of good faith belief</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Disclaimers and Limitations</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-900">"As Is" Service</h3>
                <p>
                  The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Accuracy, reliability, or availability of the Service</li>
                  <li>Freedom from errors or interruptions</li>
                  <li>Security of data transmission</li>
                  <li>Accuracy of listings or user-provided information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Third-Party Content</h3>
                <p>
                  We are a marketplace connecting users. We do not:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Verify the accuracy of listings</li>
                  <li>Guarantee the quality of properties, services, or jobs</li>
                  <li>Endorse any user or listing</li>
                  <li>Act as an agent, broker, or intermediary</li>
                  <li>Assume liability for transactions between users</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">User Responsibility</h3>
                <p>
                  You are solely responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Verifying the accuracy of listings</li>
                  <li>Conducting due diligence before transactions</li>
                  <li>Complying with applicable laws and regulations</li>
                  <li>Your interactions with other users</li>
                  <li>The content you post</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law, SearchNorthCyprus shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Loss of profits, revenue, or data</li>
                  <li>Business interruption</li>
                  <li>Fraudulent transactions</li>
                  <li>Property damage</li>
                  <li>Personal injury</li>
                </ul>
                <p className="font-semibold text-gray-900 mt-4">
                  Our total liability shall not exceed the amount you paid us in the past 12 months, or $100, whichever is greater.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Indemnification</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  You agree to indemnify, defend, and hold harmless SearchNorthCyprus, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, costs, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Content you post on the Service</li>
                  <li>Transactions with other users</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Termination</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Abusive behavior toward other users or staff</li>
                  <li>Extended inactivity</li>
                  <li>At our sole discretion for any other reason</li>
                </ul>
                <p>
                  Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
                </p>
                <p>
                  You may terminate your account at any time by contacting us at <a href="mailto:support@searchnorthcyprus.org" className="text-blue-600 hover:underline">support@searchnorthcyprus.org</a>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Dispute Resolution</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-900">Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of North Cyprus, without regard to its conflict of law provisions.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Dispute Resolution Process</h3>
                <p>
                  In the event of any dispute, claim, or controversy:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li><strong>Informal Resolution:</strong> First, contact us at <a href="mailto:legal@searchnorthcyprus.org" className="text-blue-600 hover:underline">legal@searchnorthcyprus.org</a> to attempt informal resolution</li>
                  <li><strong>Mediation:</strong> If informal resolution fails, parties agree to attempt mediation</li>
                  <li><strong>Arbitration:</strong> If mediation fails, disputes shall be resolved through binding arbitration in North Cyprus</li>
                </ol>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Class Action Waiver</h3>
                <p>
                  You agree to resolve disputes with us on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Changes to Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Posting the updated Terms on this page</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending an email notification (for significant changes)</li>
                </ul>
                <p>
                  Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Miscellaneous */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Miscellaneous</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-900">Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and SearchNorthCyprus regarding the Service.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Severability</h3>
                <p>
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Waiver</h3>
                <p>
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Assignment</h3>
                <p>
                  You may not assign or transfer these Terms without our written consent. We may assign these Terms without restriction.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">Contact Information</h3>
                <p>
                  Questions about these Terms should be sent to <a href="mailto:legal@searchnorthcyprus.org" className="text-blue-600 hover:underline">legal@searchnorthcyprus.org</a>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptance */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-gray-900 text-lg">
                  By using SearchNorthCyprus, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <p>
                  If you have any questions about these Terms, please contact us before using the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex justify-center space-x-4 pt-8">
            <Link href="/privacy-policy" className="text-blue-600 hover:underline font-semibold">
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/contact" className="text-blue-600 hover:underline font-semibold">
              Contact Us
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/" className="text-blue-600 hover:underline font-semibold">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
