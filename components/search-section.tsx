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
    <div className="container px-4 py-8">
      <form onSubmit={handleSearch}>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 rounded-lg border bg-white p-6 shadow-sm md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">WHAT ARE YOU LOOKING FOR?</label>
            <Input 
              placeholder="Services, rentals, jobs..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Search anything you need</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CATEGORY</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="properties">Properties</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Select a specific category</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">LOCATION</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="kyrenia">Kyrenia</SelectItem>
                <SelectItem value="famagusta">Famagusta</SelectItem>
                <SelectItem value="nicosia">Nicosia</SelectItem>
                <SelectItem value="karpaz">Karpaz Peninsula</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Select a specific region</p>
          </div>
        </div>
        
        <div className="mx-auto mt-4 flex max-w-5xl justify-between items-end">
          <Button 
            type="submit"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Now
          </Button>
          
        </div>
      </form>
    </div>
  )
}
