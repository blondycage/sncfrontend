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
      // Map frontend location values to backend city parameters
      const cityMapping: { [key: string]: string } = {
        'nicosia': 'nicosia',
        'kyrenia': 'kyrenia',
        'famagusta': 'famagusta', 
        'morphou': 'morphou',
        'iskele': 'iskele',
        'lefke': 'lefke',
        'karpaz': 'karpaz',
        'dipkarpaz': 'dipkarpaz',
        'alsancak': 'alsancak',
        'lapta': 'lapta',
        'catalkoy': 'catalkoy',
        'esentepe': 'esentepe',
        'bogaz': 'bogaz',
        'bellapais': 'bellapais',
        'karaoglanoglu': 'karaoglanoglu',
        'ozankoy': 'ozankoy',
        'tatlisu': 'tatlisu',
        'yenibogazici': 'yenibogazici',
        'zeytinlik': 'zeytinlik'
      }
      
      const cityValue = cityMapping[location] || location
      params.set('city', cityValue)  // Use 'city' parameter instead of 'location'
    }

    // Navigate to search results page
    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
    console.log('🔍 Navigating to search:', searchUrl)
    router.push(searchUrl)
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <form onSubmit={handleSearch}>
        <div className="mx-auto max-w-5xl">
          {/* Mobile/Tablet Layout (stacked) */}
          <div className="md:hidden">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-4 space-y-4">
              {/* What are you searching for - Mobile */}
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-900 mb-2">What are you searching for?</label>
                <Input 
                  placeholder="Jobs, properties, services, education..."
                  className="w-full text-sm placeholder:text-gray-500 border-gray-300 focus:border-primary focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Category and Location - Mobile (side by side) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-900 mb-2">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full text-sm border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="listings">Listings</SelectItem>
                      <SelectItem value="jobs">Jobs</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-900 mb-2">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full text-sm border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="nicosia">Nicosia (Lefkoşa)</SelectItem>
                      <SelectItem value="kyrenia">Kyrenia (Girne)</SelectItem>
                      <SelectItem value="famagusta">Famagusta (Gazimağusa)</SelectItem>
                      <SelectItem value="morphou">Morphou (Güzelyurt)</SelectItem>
                      <SelectItem value="iskele">İskele</SelectItem>
                      <SelectItem value="lefke">Lefke</SelectItem>
                      <SelectItem value="karpaz">Karpaz Peninsula</SelectItem>
                      <SelectItem value="dipkarpaz">Dipkarpaz</SelectItem>
                      <SelectItem value="alsancak">Alsancak</SelectItem>
                      <SelectItem value="lapta">Lapta</SelectItem>
                      <SelectItem value="catalkoy">Çatalköy</SelectItem>
                      <SelectItem value="esentepe">Esentepe</SelectItem>
                      <SelectItem value="bogaz">Boğaz</SelectItem>
                      <SelectItem value="bellapais">Bellapais</SelectItem>
                      <SelectItem value="karaoglanoglu">Karaoğlanoğlu</SelectItem>
                      <SelectItem value="ozankoy">Özanköy</SelectItem>
                      <SelectItem value="tatlisu">Tatlısu</SelectItem>
                      <SelectItem value="yenibogazici">Yeniboğaziçi</SelectItem>
                      <SelectItem value="zeytinlik">Zeytinlik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Search Button - Mobile */}
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 py-3 text-sm font-medium"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Now
              </Button>
            </div>
          </div>

          {/* Desktop Layout (horizontal) */}
          <div className="hidden md:block">
            <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-blue-200/50 p-2 lg:p-3">
              {/* What are you searching for - Desktop */}
              <div className="flex-1 px-4 lg:px-6 py-3 border-r border-blue-200/70 cursor-pointer hover:bg-gray-50 rounded-l-full">
                <label className="block text-xs font-bold text-gray-900 mb-1">What are you searching for?</label>
                <Input 
                  placeholder="Jobs, properties, services, education..."
                  className="border-0 p-0 text-sm placeholder:text-gray-500 focus:ring-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Category - Desktop */}
              <div className="flex-1 px-4 lg:px-6 py-3 border-r border-blue-200/70 cursor-pointer hover:bg-gray-50">
                <label className="block text-xs font-bold text-gray-900 mb-1">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-0 p-0 h-auto text-sm shadow-none focus:ring-0">
                    <SelectValue placeholder="All categories" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="listings">Listings</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location - Desktop */}
              <div className="flex-1 px-4 lg:px-6 py-3 cursor-pointer hover:bg-gray-50">
                <label className="block text-xs font-bold text-gray-900 mb-1">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="border-0 p-0 h-auto text-sm shadow-none focus:ring-0">
                    <SelectValue placeholder="All locations" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="nicosia">Nicosia (Lefkoşa)</SelectItem>
                    <SelectItem value="kyrenia">Kyrenia (Girne)</SelectItem>
                    <SelectItem value="famagusta">Famagusta (Gazimağusa)</SelectItem>
                    <SelectItem value="morphou">Morphou (Güzelyurt)</SelectItem>
                    <SelectItem value="iskele">İskele</SelectItem>
                    <SelectItem value="lefke">Lefke</SelectItem>
                    <SelectItem value="karpaz">Karpaz Peninsula</SelectItem>
                    <SelectItem value="dipkarpaz">Dipkarpaz</SelectItem>
                    <SelectItem value="alsancak">Alsancak</SelectItem>
                    <SelectItem value="lapta">Lapta</SelectItem>
                    <SelectItem value="catalkoy">Çatalköy</SelectItem>
                    <SelectItem value="esentepe">Esentepe</SelectItem>
                    <SelectItem value="bogaz">Boğaz</SelectItem>
                    <SelectItem value="bellapais">Bellapais</SelectItem>
                    <SelectItem value="karaoglanoglu">Karaoğlanoğlu</SelectItem>
                    <SelectItem value="ozankoy">Özanköy</SelectItem>
                    <SelectItem value="tatlisu">Tatlısu</SelectItem>
                    <SelectItem value="yenibogazici">Yeniboğaziçi</SelectItem>
                    <SelectItem value="zeytinlik">Zeytinlik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search Button - Desktop */}
              <div className="ml-2 lg:ml-3">
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12 p-0"
                >
                  <Search className="h-4 w-4 text-white" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
