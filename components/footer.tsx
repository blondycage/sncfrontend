import Link from "next/link"
import { Facebook, Instagram, Send, Search, Building, PlusCircle, MapPin, Hotel } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  // Major cities in Northern Cyprus (from header)
  const cities = [
    { value: 'famagusta', label: 'Famagusta', slug: 'famagusta' },
    { value: 'nicosia', label: 'Nicosia', slug: 'nicosia' },
    { value: 'kyrenia', label: 'Girne', slug: 'kyrenia' },
    { value: 'iskele', label: 'Iskele', slug: 'iskele' },
  ]

  return (
    <footer className="border-t bg-gray-50 pt-12 pb-6">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/placeholder-logo.png" 
                alt="SNC Logo" 
                width={120} 
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your ultimate search platform for everything in North Cyprus. Find properties, jobs, services, and educational programs.
            </p>
            <div className="flex items-center space-x-4">
              <Link 
                href="https://www.instagram.com/searchnorthcyprus?igsh=NXlkeXAwZDN4anF4" 
                aria-label="Instagram"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="https://t.me/searchnorthcyprus" 
                aria-label="Telegram"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Send className="h-5 w-5" />
              </Link>
              <Link 
                href="https://www.facebook.com/share/1a4bjuJ6iR/?mibextid=wwXIfr" 
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/listings" 
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse Listings</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Building className="h-4 w-4" />
                  <span>Jobs</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dormitories"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Hotel className="h-4 w-4" />
                  <span>Dormitories</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M4 4h16v16H4z"/>
                    <path d="M8 9h8"/>
                    <path d="M8 13h8"/>
                    <path d="M8 17h5"/>
                  </svg>
                  <span>News</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/create-listing" 
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Listing</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/jobs/create" 
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Post Job</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Cities</span>
            </h3>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={city.value}>
                  <Link 
                    href={`/locations/${city.slug}`}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/categories/properties" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories/jobs" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Job Opportunities
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories/education" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Education
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories/services" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Services
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>© {currentYear} Search North Cyprus. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
