"use client";

import Link from "next/link"
import { Facebook, Instagram, Send, Search, Building, PlusCircle, MapPin, Hotel, ChevronDown, Settings } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

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
    <footer className="border-t bg-gradient-to-b from-gray-900 to-black pt-12 pb-6">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.jpeg"
                alt="SNC Logo"
                width={120}
                height={60}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your ultimate search platform for everything in North Cyprus. Find properties, jobs, services, and educational programs.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="https://www.instagram.com/searchnorthcyprus?igsh=NXlkeXAwZDN4anF4"
                aria-label="Instagram"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://t.me/searchnorthcyprus"
                aria-label="Telegram"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Send className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.facebook.com/share/1a4bjuJ6iR/?mibextid=wwXIfr"
                aria-label="Facebook"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-sm text-gray-300 hover:text-primary transition-colors h-auto p-0 justify-start"
                    >
                      <Search className="h-4 w-4" />
                      <span>Search North Cyprus</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Browse by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/search"
                        className="flex items-center space-x-2 cursor-pointer w-full"
                      >
                        <Search className="h-4 w-4" />
                        <span>Search All</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/categories/vehicles"
                        className="flex items-center space-x-2 cursor-pointer w-full"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                        </svg>
                        <span>DriveYourType</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/categories/properties"
                        className="flex items-center space-x-2 cursor-pointer w-full"
                      >
                        <Building className="h-4 w-4" />
                        <span>Real Estate</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/categories/services"
                        className="flex items-center space-x-2 cursor-pointer w-full"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Services</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/categories/education"
                        className="flex items-center space-x-2 cursor-pointer w-full"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <span>SNCStudy</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  <Building className="h-4 w-4" />
                  <span>Jobs</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dormitories"
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  <Hotel className="h-4 w-4" />
                  <span>Dormitories</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-primary transition-colors"
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
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Listing</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/jobs/create" 
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Post Job</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Cities</span>
            </h3>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={city.value}>
                  <Link 
                    href={`/locations/${city.slug}`}
                    className="text-sm text-gray-300 hover:text-primary transition-colors"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/categories/properties"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/jobs"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  Job Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/education"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  Education
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/services"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex items-center justify-center text-sm text-gray-400">
            <span>© {currentYear} Search North Cyprus. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
