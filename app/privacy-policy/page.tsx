'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, Users, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-purple">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-center text-blue-200 mt-4">
            Last Updated: January 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Introduction</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Welcome to SearchNorthCyprus ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at searchnorthcyprus.org.
                </p>
                <p>
                  SearchNorthCyprus is North Cyprus's premier online marketplace connecting people with property listings, job opportunities, services, and educational programs. We understand that trust is fundamental to our relationship with you.
                </p>
                <p>
                  If you have any questions or concerns about this privacy policy or our practices, please contact us using the information provided at the end of this document.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Information We Collect</h2>
              </div>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Personal Information You Provide</h3>
                  <p className="mb-2">We collect personal information that you voluntarily provide to us when you:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Register an account:</strong> Username, email address, password, first name, last name, phone number, and role (student, local resident, business owner, etc.)</li>
                    <li><strong>Create listings:</strong> Property details, images, pricing, location information, contact preferences</li>
                    <li><strong>Apply for jobs:</strong> Resume/CV, cover letter, contact information, work history</li>
                    <li><strong>Post services:</strong> Service descriptions, pricing, availability, contact details</li>
                    <li><strong>Make payments:</strong> Cryptocurrency transaction hashes for listing promotions</li>
                    <li><strong>Contact us:</strong> Name, email, phone number, and message content</li>
                    <li><strong>Update your profile:</strong> Bio, location, preferences, avatar/profile picture</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Telegram Authentication Data</h3>
                  <p className="mb-2">If you choose to authenticate using Telegram, we collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Telegram user ID</li>
                    <li>First and last name from your Telegram profile</li>
                    <li>Username (if public)</li>
                    <li>Profile photo URL (if public)</li>
                    <li>Authentication timestamp</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Automatically Collected Information</h3>
                  <p className="mb-2">When you access our platform, we automatically collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Device information:</strong> Browser type, operating system, device type</li>
                    <li><strong>Usage data:</strong> Pages viewed, time spent on pages, links clicked, search queries</li>
                    <li><strong>IP address:</strong> For security and analytics purposes</li>
                    <li><strong>Cookies and tracking technologies:</strong> To improve your experience and analyze usage patterns</li>
                    <li><strong>Location data:</strong> City and region (if you provide it)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Images and Media</h3>
                  <p>
                    When you upload images for listings, we store them securely using Cloudinary. Images are optimized and may be processed for performance. We track your upload quota (3 free uploads per month for regular users).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Management:</strong> Create and maintain your account, authenticate users, manage preferences</li>
                  <li><strong>Platform Services:</strong> Enable listing creation, job applications, service bookings, and educational program inquiries</li>
                  <li><strong>Communication:</strong> Send welcome emails, password reset links, listing approval notifications, and important platform updates</li>
                  <li><strong>Payment Processing:</strong> Verify cryptocurrency payments for listing promotions and premium features</li>
                  <li><strong>Content Moderation:</strong> Review listings and user-generated content to ensure compliance with our policies</li>
                  <li><strong>Analytics:</strong> Understand how users interact with our platform to improve services</li>
                  <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                  <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
                  <li><strong>Personalization:</strong> Provide relevant search results and recommendations based on your preferences</li>
                  <li><strong>Marketing:</strong> Send newsletters and promotional content (only if you opt in)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">How We Share Your Information</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We may share your information in the following circumstances:</p>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Public Information</h3>
                  <p>Information in your listings (properties, jobs, services) is publicly visible to all platform users, including:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Listing title, description, images, and pricing</li>
                    <li>Your name (first and last name or username, based on your profile)</li>
                    <li>Contact information you choose to include</li>
                    <li>Location information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Service Providers</h3>
                  <p>We share data with third-party service providers who help us operate our platform:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>Cloudinary:</strong> For image hosting and optimization</li>
                    <li><strong>MongoDB Atlas:</strong> For database services</li>
                    <li><strong>Email Service Providers:</strong> For transactional emails (Zoho Mail)</li>
                    <li><strong>Hosting Providers:</strong> For server infrastructure</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Legal Requirements</h3>
                  <p>We may disclose your information if required by law or in response to valid legal requests, such as:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Subpoenas or court orders</li>
                    <li>Law enforcement requests</li>
                    <li>Protection of our rights and safety</li>
                    <li>Investigation of fraud or security issues</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Business Transfers</h3>
                  <p>
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner, subject to this privacy policy.
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  We do NOT sell your personal information to third parties for marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Data Security</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Encryption:</strong> Passwords are hashed using bcrypt. Data in transit is protected using HTTPS/SSL</li>
                  <li><strong>Authentication:</strong> JWT-based authentication with secure token management</li>
                  <li><strong>Access Controls:</strong> Role-based access control (user, advertiser, admin)</li>
                  <li><strong>Secure Storage:</strong> Images stored securely on Cloudinary with access controls</li>
                  <li><strong>Regular Updates:</strong> We keep our systems and dependencies updated</li>
                  <li><strong>Monitoring:</strong> Continuous monitoring for suspicious activities</li>
                </ul>
                <p className="text-sm italic">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Your Privacy Rights</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Update or correct your personal information through your profile settings</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data (subject to legal retention requirements)</li>
                  <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time</li>
                  <li><strong>Restrict Processing:</strong> Request limitation on how we use your data</li>
                  <li><strong>Object:</strong> Object to our processing of your personal information</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at <a href="mailto:privacy@searchnorthcyprus.org" className="text-blue-600 hover:underline">privacy@searchnorthcyprus.org</a>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Cookies and Tracking</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Authentication Cookies:</strong> Keep you logged in to your account</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings (language, theme)</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                  <li><strong>Security Cookies:</strong> Protect against fraudulent activity</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Data Retention</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain security and prevent fraud</li>
                </ul>
                <p>
                  When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
                </p>
                <p>
                  Listings expire after 30 days by default and may be automatically archived or deleted.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Children's Privacy</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our platform is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">International Users</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  SearchNorthCyprus is operated from and targeted to users in North Cyprus. If you access our platform from outside North Cyprus, please be aware that your information may be transferred to, stored, and processed in North Cyprus and other countries where our service providers operate.
                </p>
                <p>
                  By using our platform, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection laws.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Changes to This Privacy Policy</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this privacy policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Posting the updated policy on this page</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending an email notification (for significant changes)</li>
                </ul>
                <p>
                  We encourage you to review this privacy policy periodically to stay informed about how we protect your information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Contact Us</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have questions, concerns, or requests regarding this privacy policy or our data practices, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span><strong>Email:</strong> <a href="mailto:privacy@searchnorthcyprus.org" className="text-blue-600 hover:underline">privacy@searchnorthcyprus.org</a></span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span><strong>General Inquiries:</strong> <a href="mailto:admin@searchnorthcyprus.org" className="text-blue-600 hover:underline">admin@searchnorthcyprus.org</a></span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span><strong>Website:</strong> <a href="https://searchnorthcyprus.org" className="text-blue-600 hover:underline">searchnorthcyprus.org</a></span>
                  </p>
                </div>
                <p className="mt-4">
                  We will respond to your inquiry within 30 days.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex justify-center space-x-4 pt-8">
            <Link href="/terms-of-service" className="text-blue-600 hover:underline font-semibold">
              Terms of Service
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
