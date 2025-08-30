"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build search parameters
    const params = new URLSearchParams()
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    }
    
    if (category && category !== 'all') {
      params.set('category', category)
    }
    
    if (location && location !== 'all') {
      params.set('location', location)
    }

    // Navigate to search results page
    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
    console.log('🔍 Navigating to search:', searchUrl)
    router.push(searchUrl)
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <form onSubmit={handleSearch}>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center bg-white rounded-full shadow-xl border border-gray-200 p-2 sm:p-3">
            {/* What are you searching for */}
            <div className="flex-1 w-full sm:w-auto px-4 sm:px-6 py-3 sm:border-r border-gray-200 cursor-pointer hover:bg-gray-50 rounded-l-full">
              <label className="block text-xs font-bold text-gray-900 mb-1">What are you searching for?</label>
              <Input 
                placeholder="Jobs, properties, services, education..."
                className="border-0 p-0 text-sm placeholder:text-gray-500 focus:ring-0 shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category */}
            <div className="flex-1 w-full sm:w-auto px-4 sm:px-6 py-3 sm:border-r border-gray-200 cursor-pointer hover:bg-gray-50">
              <label className="block text-xs font-bold text-gray-900 mb-1">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-0 p-0 h-auto text-sm shadow-none focus:ring-0">
                  <SelectValue placeholder="All categories" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="properties">Properties</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Location */}
            <div className="flex-1 w-full sm:w-auto px-4 sm:px-6 py-3 cursor-pointer hover:bg-gray-50">
              <label className="block text-xs font-bold text-gray-900 mb-1">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="border-0 p-0 h-auto text-sm shadow-none focus:ring-0">
                  <SelectValue placeholder="All locations" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="kyrenia">Kyrenia</SelectItem>
                  <SelectItem value="famagusta">Famagusta</SelectItem>
                  <SelectItem value="nicosia">Nicosia</SelectItem>
                  <SelectItem value="karpaz">Karpaz Peninsula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Button */}
            <div className="ml-0 sm:ml-2 mt-3 sm:mt-0">
              <Button 
                type="submit"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 p-0"
              >
                <Search className="h-4 w-4 text-white" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
