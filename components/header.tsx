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
  ChevronDown
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import Image from "next/image"

// Major cities in Northern Cyprus
const MAJOR_CITIES = [
  { value: 'famagusta', label: 'Famagusta', slug: 'famagusta', description: 'Historic port city' },
  { value: 'nicosia', label: 'Nicosia', slug: 'nicosia', description: 'Capital city' },
  { value: 'kyrenia', label: 'Girne', slug: 'kyrenia', description: 'Coastal resort town' },
  { value: 'karpaz', label: 'Karpaz', slug: 'karpaz', description: 'Peninsula region' },
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
    <header className="border-b bg-white shadow-sm">
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/listings" 
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Browse Listings</span>
          </Link>

          <Link 
            href="/blog" 
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <span>Blog</span>
          </Link>

         

          {/* Cities Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors h-auto p-0"
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
                    <span className="text-xs text-gray-500">{city.description}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link 
            href="/jobs" 
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Building className="h-4 w-4" />
            <span>Jobs</span>
          </Link>
          
          {user && (
            <Link 
              href="/create-listing" 
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Listing</span>
            </Link>
          )}
          
          {user && (
            <Link 
              href="/jobs/create" 
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Job</span>
            </Link>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoUrl} alt={getDisplayName()} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
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
              <Button className="bg-[#0088cc] hover:bg-[#0077b5] text-white">
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

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container px-4 py-4 space-y-4">
            <Link 
              href="/listings" 
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              <span>Browse Listings</span>
            </Link>

            <Link 
              href="/blog" 
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Blog</span>
            </Link>

            <Link 
              href="/promotions" 
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
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
                    className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
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
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building className="h-4 w-4" />
              <span>Jobs</span>
            </Link>
            
            {user && (
              <Link 
                href="/create-listing" 
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Listing</span>
              </Link>
            )}
            
            {user && (
              <Link 
                href="/jobs/create" 
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
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
                    <AvatarFallback className="bg-blue-100 text-blue-600">
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
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    href="/dashboard/profile" 
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    href="/dashboard/settings" 
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white">
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
