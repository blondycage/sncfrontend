"use client";

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Search,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Building,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Hotel
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import Image from "next/image"
import GTranslateWidget from "@/components/google-translate"

// Major cities in Northern Cyprus
const MAJOR_CITIES = [
  { value: 'famagusta', label: 'Famagusta', slug: 'famagusta', description: 'Historic port city' },
  { value: 'nicosia', label: 'Nicosia', slug: 'nicosia', description: 'Capital city' },
  { value: 'kyrenia', label: 'Girne', slug: 'kyrenia', description: 'Coastal resort town' },
  { value: 'iskele', label: 'Iskele', slug: 'iskele', description: 'Peninsula region' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  return (
    <header className="border-b bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/placeholder-logo.png" 
            alt="SNC Logo" 
            width={120} 
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation - Center Aligned */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-6">
          {/* Browse Listings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors h-auto p-0"
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

          <Link 
            href="/blog" 
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M4 4h16v16H4z"/>
              <path d="M8 9h8"/>
              <path d="M8 13h8"/>
              <path d="M8 17h5"/>
            </svg>
            <span>News</span>
          </Link>

         

          {/* Cities Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors h-auto p-0"
              >
                <MapPin className="h-4 w-4" />
                <span>Cities</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Major Cities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MAJOR_CITIES.map((city) => (
                <DropdownMenuItem key={city.value} asChild>
                  <Link 
                    href={`/locations/${city.slug}`}
                    className="flex items-center justify-between cursor-pointer w-full"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{city.label}</span>
                    </div>
                  
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link
            href="/jobs"
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            <Building className="h-4 w-4" />
            <span>Jobs</span>
          </Link>

          <Link
            href="/dormitories"
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            <Hotel className="h-4 w-4" />
            <span>Dormitories</span>
          </Link>
          
          {user && (
            <Link 
              href="/create-listing" 
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Listing</span>
            </Link>
          )}
          
          {user && (
            <Link 
              href="/jobs/create" 
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Job</span>
            </Link>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Google Translate Widget */}
          <GTranslateWidget id="desktop" />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoUrl} alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.firstName, user.lastName, user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.username && `@${user.username}`}
                      {user.email && !user.username && user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <Building className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
               
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                Login 
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Translation and Menu */}
        <div className="md:hidden flex items-center space-x-2">
          <GTranslateWidget id="mobile" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="container px-4 py-4 space-y-4">
            {/* Browse Listings Section in Mobile */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <Search className="h-4 w-4" />
                <span>Search North Cyprus</span>
              </div>
              <div className="pl-6 space-y-2">
                <Link
                  href="/search"
                  className="block text-sm text-gray-600 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Search All
                </Link>
                <Link
                  href="/categories/vehicles"
                  className="block text-sm text-gray-600 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DriveYourType
                </Link>
                <Link
                  href="/categories/properties"
                  className="block text-sm text-gray-600 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Real Estate
                </Link>
                <Link
                  href="/categories/services"
                  className="block text-sm text-gray-600 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/categories/education"
                  className="block text-sm text-gray-600 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SNCStudy
                </Link>
              </div>
            </div>

            <Link 
              href="/blog" 
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M4 4h16v16H4z"/>
                <path d="M8 9h8"/>
                <path d="M8 13h8"/>
                <path d="M8 17h5"/>
              </svg>
              <span>News</span>
            </Link>

            <Link 
              href="/promotions" 
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Promote</span>
            </Link>

            {/* Cities Section in Mobile */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>Cities</span>
              </div>
              <div className="pl-6 space-y-2">
                {MAJOR_CITIES.map((city) => (
                  <Link 
                    key={city.value}
                    href={`/locations/${city.slug}`}
                    className="block text-sm text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{city.label}</span>
                      <span className="text-xs text-gray-400">{city.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <Link
              href="/jobs"
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building className="h-4 w-4" />
              <span>Jobs</span>
            </Link>

            <Link
              href="/dormitories"
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Hotel className="h-4 w-4" />
              <span>Dormitories</span>
            </Link>
            
            {user && (
              <Link 
                href="/create-listing" 
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Listing</span>
              </Link>
            )}
            
            {user && (
              <Link 
                href="/jobs/create" 
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post Job</span>
              </Link>
            )}

            {user ? (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoUrl} alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.firstName, user.lastName, user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.username && `@${user.username}`}
                      {user.email && !user.username && user.email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
                      className="mr-2"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
          Login 
                  </Button>
        </Link>
      </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
