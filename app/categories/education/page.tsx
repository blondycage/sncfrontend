'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, DollarSign, GraduationCap, BookOpen, Users, ChevronLeft, ChevronRight, Search, Filter, Star, Clock, Building, Globe } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

// TypeScript interfaces
interface EducationalProgram {
  _id: string
  title: string
  institution: {
    name: string
    website?: string
    accreditation?: string[]
  }
  description: string
  level: 'undergraduate' | 'undergraduate_transfer' | 'postgraduate_masters' | 'postgraduate_phd' | 'certificate' | 'diploma' | 'language_course'
  field?: string
  duration: {
    value: number
    unit: 'months' | 'years' | 'semesters'
  }
  tuition: {
    amount: number
    currency: string
    period: string
    scholarshipAvailable?: boolean
    scholarshipDetails?: string
  }
  location: {
    city: string
    campus?: string
    address?: string
  }
  images: string[]
  featured: boolean
  tags: string[]
  viewCount: number
  applicationCount: number
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

interface Filters {
  search: string
  level: string
  field: string
  city: string
  minTuition: string
  maxTuition: string
  tags: string
  sortBy: string
}

// Hero slideshow data
const heroSlides = [
  {
    id: 1,
    title: "Study in Northern Cyprus",
    subtitle: "World-class education in the heart of the Mediterranean",
    description: "Discover quality education with affordable tuition fees in beautiful Northern Cyprus",
    image: "/images/education-1.jpg",
    cta: "Explore Programs"
  },
  {
    id: 2,
    title: "Cyprus International University",
    subtitle: "Leading institution in Nicosia",
    description: "Modern facilities and international programs await you",
    image: "/images/education-2.jpg",
    cta: "View Programs"
  },
  {
    id: 3,
    title: "Eastern Mediterranean University",
    subtitle: "Excellence in Famagusta",
    description: "Join thousands of international students in a diverse academic environment",
    image: "/images/education-3.jpg",
    cta: "Apply Now"
  }
]

// Constants
const PROGRAM_LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate', icon: GraduationCap },
  { value: 'undergraduate_transfer', label: 'Transfer', icon: BookOpen },
  { value: 'postgraduate_masters', label: 'Masters', icon: Users },
  { value: 'postgraduate_phd', label: 'PhD', icon: Star },
  { value: 'certificate', label: 'Certificate', icon: Building },
  { value: 'diploma', label: 'Diploma', icon: Globe },
  { value: 'language_course', label: 'Language', icon: BookOpen }
]

const FIELDS_OF_STUDY = [
  'computer_science', 'engineering', 'business_administration', 'medicine', 'dentistry',
  'pharmacy', 'nursing', 'law', 'international_relations', 'economics', 'psychology',
  'education', 'english_literature', 'history', 'sociology', 'political_science',
  'mathematics', 'physics', 'chemistry', 'biology', 'architecture', 'fine_arts',
  'music', 'communication', 'tourism_management'
]

const NORTHERN_CYPRUS_CITIES = [
  'Nicosia', 'Famagusta', 'Kyrenia', 'Morphou', 'Iskele'
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'tuition_low', label: 'Tuition: Low to High' },
  { value: 'tuition_high', label: 'Tuition: High to Low' },
  { value: 'applications', label: 'Most Popular' }
]

export default function EducationPage() {
  // State management
  const [programs, setPrograms] = useState<EducationalProgram[]>([])
  const [featuredPrograms, setFeaturedPrograms] = useState<EducationalProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    level: '',
    field: '',
    city: '',
    minTuition: '',
    maxTuition: '',
    tags: '',
    sortBy: 'newest'
  })

  // Hero slideshow auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Fetch featured programs
  useEffect(() => {
    const fetchFeaturedPrograms = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/featured`)
        if (response.ok) {
          const data = await response.json()
          setFeaturedPrograms(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching featured programs:', error)
      }
    }
    fetchFeaturedPrograms()
  }, [])

  // Fetch programs with filters
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          )
        })
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/programs?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch programs')
        }

        const data = await response.json()
        setPrograms(data.data || [])
        setTotalPages(data.pages || 1)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load programs')
        setPrograms([])
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [filters, page])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      level: '',
      field: '',
      city: '',
      minTuition: '',
      maxTuition: '',
      tags: '',
      sortBy: 'newest'
    })
    setPage(1)
  }

  const formatTuition = (tuition: EducationalProgram['tuition']) => {
    return `${tuition.currency === 'USD' ? '$' : tuition.currency}${tuition.amount.toLocaleString()}/${tuition.period}`
  }

  const formatDuration = (duration: EducationalProgram['duration']) => {
    return `${duration.value} ${duration.unit}`
  }

  const formatFieldOfStudy = (field?: string) => {
    if (!field) return 'N/A'
    return field.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getLevelIcon = (level: string) => {
    const levelData = PROGRAM_LEVELS.find(l => l.value === level)
    return levelData?.icon || GraduationCap
  }

  const getLevelLabel = (level: string) => {
    const levelData = PROGRAM_LEVELS.find(l => l.value === level)
    return levelData?.label || level
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Slideshow */}
      <section className="relative h-[70vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-6">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">{slide.title}</h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">{slide.subtitle}</h2>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">{slide.description}</p>
                <Button size="lg" className="text-lg px-8 py-3">
                  {slide.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slideshow Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        {/* Featured Programs Section */}
        {featuredPrograms.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center mb-10">
              <Star className="h-6 w-6 text-amber-500 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold">Featured Programs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
              {featuredPrograms.slice(0, 3).map((program) => (
                <Card key={program._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full min-h-[420px]">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-amber-500 text-white px-3 py-1">
                        Featured
                      </Badge>
                      <Badge className="bg-primary px-3 py-1">
                        {getLevelLabel(program.level)}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-xl leading-tight">{program.title}</CardTitle>
                    <div className="text-sm font-medium text-primary mt-2">{program.institution.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="mr-2 h-4 w-4" />
                      {program.location.city}
                    </div>
                    <CardDescription className="line-clamp-3 mt-3 leading-relaxed">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 flex-1">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{formatTuition(program.tuition)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-blue-600" />
                          <span className="text-sm">{formatDuration(program.duration)}</span>
                        </div>
                      </div>
                      {program.tuition.scholarshipAvailable && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Scholarship Available
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-2 mt-auto">
                    <Link href={`/categories/education/${program._id}`} className="w-full">
                      <Button className="w-full h-11">Learn More & Apply</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-12">
          {/* Filters Sidebar */}
          <div className="xl:w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <Filter className="h-5 w-5 mr-3" />
                  Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="px-3">
                  Clear All
                </Button>
              </div>

              <div className="space-y-8">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Search Programs</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, institution, or description..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Program Level</label>
                  <Select value={filters.level || "all"} onValueChange={(value) => handleFilterChange('level', value === "all" ? "" : value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {PROGRAM_LEVELS.map((level) => {
                        const IconComponent = level.icon
                        return (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center">
                              <IconComponent className="h-4 w-4 mr-2" />
                              {level.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field of Study */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Field of Study</label>
                  <Select value={filters.field || "all"} onValueChange={(value) => handleFilterChange('field', value === "all" ? "" : value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      {FIELDS_OF_STUDY.map((field) => (
                        <SelectItem key={field} value={field}>
                          {formatFieldOfStudy(field)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-medium mb-3 block">City</label>
                  <Select value={filters.city || "all"} onValueChange={(value) => handleFilterChange('city', value === "all" ? "" : value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {NORTHERN_CYPRUS_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuition Range */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Tuition Range (USD)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.minTuition}
                      onChange={(e) => handleFilterChange('minTuition', e.target.value)}
                      className="h-11"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.maxTuition}
                      onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Programs Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold">All Programs</h2>
              <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                {loading ? 'Loading...' : `${programs.length} programs found`}
              </div>
            </div>

            {error && (
              <div className="text-center py-16">
                <div className="text-red-500 mb-4 text-lg">Error: {error}</div>
                <Button onClick={() => window.location.reload()} size="lg">Try Again</Button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden flex flex-col h-full min-h-[420px]">
                    <div className="aspect-video w-full bg-muted animate-pulse" />
                    <CardHeader className="p-6">
                      <div className="h-6 bg-muted rounded animate-pulse mb-3" />
                      <div className="h-4 bg-muted rounded animate-pulse mb-2 w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">No Programs Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Try adjusting your filters to find more programs that match your criteria.
                </p>
                <Button onClick={clearFilters} size="lg">Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12 items-stretch">
                  {programs.map((program) => {
                    const IconComponent = getLevelIcon(program.level)
                    return (
                      <Card key={program._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full min-h-[420px]">
                        <CardHeader className="p-6 pb-4">
                          <div className="flex justify-between items-start mb-4">
                            {program.featured && (
                              <Badge className="bg-amber-500 text-white px-3 py-1">
                                Featured
                              </Badge>
                            )}
                            <Badge className="bg-primary px-3 py-1 ml-auto">
                              {getLevelLabel(program.level)}
                            </Badge>
                          </div>
                          <CardTitle className="line-clamp-2 flex items-start text-xl leading-tight">
                            <IconComponent className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                            {program.title}
                          </CardTitle>
                          <div className="text-sm font-medium text-primary mt-2">{program.institution.name}</div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="mr-2 h-4 w-4" />
                            {program.location.city}
                          </div>
                          <CardDescription className="line-clamp-3 mt-3 leading-relaxed">{program.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-2 flex-1">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">{formatTuition(program.tuition)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                                <span className="text-sm">{formatDuration(program.duration)}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {program.tuition.scholarshipAvailable && (
                                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                  Scholarship
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {formatFieldOfStudy(program.field)}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-2 mt-auto">
                          <Link href={`/categories/education/${program._id}`} className="w-full">
                            <Button className="w-full h-11">Learn More & Apply</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-6"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-6"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <section className="mt-24 text-center bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Educational Journey?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of international students who have chosen Northern Cyprus for their education. 
            Quality education, affordable tuition, and a vibrant student life await you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
           
            <Button size="lg" variant="outline" className="px-3 sm:px-6 md:px-8 h-auto min-h-[3rem] py-3 text-xs sm:text-sm md:text-base flex-wrap justify-center">
              <span className="text-center leading-tight">
                <span className="block sm:inline">Contact Admissions at</span>
                <span className="block sm:inline sm:ml-1">
                  <a href="mailto:admissions@searchnorthcyprus.org" className="break-all text-primary hover:underline font-medium">
                    admissions@searchnorthcyprus.org
                  </a>
                </span>
              </span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
