'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Target,
  Users,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
  Megaphone,
  Star,
  BarChart,
  Zap
} from 'lucide-react';

export default function AdvertisePage() {
  const benefits = [
    {
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      title: 'Increased Visibility',
      description: 'Get your listings seen by thousands of potential customers across North Cyprus'
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: 'Targeted Exposure',
      description: 'Reach the right audience looking specifically for what you offer'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: 'Boost Engagement',
      description: 'Featured listings receive up to 10x more clicks and inquiries'
    },
    {
      icon: <BarChart className="h-8 w-8 text-red-600" />,
      title: 'Track Performance',
      description: 'Monitor your promotion performance with detailed analytics'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Create Your Listing',
      description: 'Post your property, job, vehicle, or service listing on our platform',
      icon: <Megaphone className="h-6 w-6" />
    },
    {
      step: 2,
      title: 'Go to Dashboard',
      description: 'Access your dashboard to view all your active listings',
      icon: <BarChart className="h-6 w-6" />
    },
    {
      step: 3,
      title: 'Select Promotion',
      description: 'Choose the listing you want to promote and click "Promote"',
      icon: <Star className="h-6 w-6" />
    },
    {
      step: 4,
      title: 'Choose Duration',
      description: 'Select your preferred promotion duration (7, 14, or 30 days)',
      icon: <Clock className="h-6 w-6" />
    },
    {
      step: 5,
      title: 'Complete Payment',
      description: 'Pay securely using your preferred payment method',
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      step: 6,
      title: 'Go Live',
      description: 'Your listing will be featured prominently across the platform',
      icon: <Zap className="h-6 w-6" />
    }
  ];

  const features = [
    'Priority placement in search results',
    'Featured badge on your listing',
    'Homepage visibility',
    'Category page top placement',
    'Enhanced listing appearance',
    'Email notifications to subscribers',
    'Social media sharing boost',
    'Analytics dashboard access'
  ];

  return (
    <div className="min-h-screen bg-gradient-purple">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Star className="h-3 w-3 mr-1" />
              Advertising Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Promote Your Listings
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Reach thousands of potential customers across North Cyprus. Feature your listings and get noticed.
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Promote on Search North Cyprus?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stand out from the competition and connect with your target audience effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{benefit.icon}</div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Promote Your Listing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to boost your listing visibility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step) => (
              <Card key={step.step} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600" />
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl">
                      {step.step}
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {step.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You Get With Promotion
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Premium features to maximize your listing's reach and impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-800 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Boost Your Visibility?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of successful advertisers on Search North Cyprus and grow your business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 w-full sm:w-auto">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/create-listing">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white/20">
                Create New Listing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How long does a promotion last?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can choose from 7, 14, or 30-day promotion periods. Your listing will be featured prominently throughout the selected duration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I promote multiple listings?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can promote as many listings as you want. Each promotion is managed separately in your dashboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How do I track my promotion performance?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access your dashboard to view detailed analytics including views, clicks, and engagement metrics for all your promoted listings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept various payment methods including credit/debit cards and other secure online payment options through our payment gateway.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
