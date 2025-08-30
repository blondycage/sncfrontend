"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PropertySection } from "@/components/property-section"
import { categoriesApi } from "@/lib/api"

interface Property {
  _id: string
  title: string
  description: string
  price: number
  pricing_frequency: string
  image_urls: string[]
  primaryImage?: string
  location: {
    city: string
    region?: string
  }
  category: string
  rating?: number
  reviews?: number
  views?: number
}

interface Job {
  _id?: string
  id?: string
  title: string
  role: string
  company: {
    name: string
    logo?: string
  }
  salary: {
    min: number
    max: number
    currency: string
    frequency: string
  }
  location: {
    city: string
    region?: string
  }
  jobType: string
  workLocation: string
  applicationDeadline: string
  views?: number
  applicationCount?: number
  createdAt: string
}

interface EducationProgram {
  _id?: string
  id?: string
  title: string
  institution: {
    name: string
    logo?: string
  }
  level: string
  fieldOfStudy?: string
  duration: {
    value: number
    unit: string
  }
  tuition: {
    amount: number
    currency: string
    period: string
  }
  location: {
    city: string
    campus?: string
  }
  images?: Array<{
    url: string
    caption?: string
    isPrimary?: boolean
  }>
  primaryImage?: string
  rating?: number
  applicationCount?: number
}

export default function NewCategoriesSection() {
  const router = useRouter()
  
  // State for different categories
  const [properties, setProperties] = useState<Property[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [educationPrograms, setEducationPrograms] = useState<EducationProgram[]>([])
  const [services, setServices] = useState<Property[]>([])
  
  // Loading states
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [educationLoading, setEducationLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
    fetchJobs()
    fetchEducationPrograms()
    fetchServices()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await categoriesApi.getProperties({
        category: 'rental',
        limit: 6,
        sortBy: 'newest'
      })
      setProperties(response.data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setPropertiesLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await categoriesApi.getJobs({
        limit: 6,
        sortBy: 'newest'
      })
      // Transform jobs to match Property interface
      const transformedJobs = response.data.map((job: Job) => ({
        _id: job._id || job.id,
        id: job._id || job.id,
        title: job.title,
        description: job.role,
        price: job.salary?.min || 0,
        pricing_frequency: `${job.salary?.frequency || 'monthly'} salary`,
        image_urls: [job.company?.logo || '/placeholder.svg'],
        primaryImage: job.company?.logo || '/placeholder.svg',
        location: job.location,
        category: 'jobs',
        rating: Math.random() * 0.5 + 4.5, // Random rating for display
        views: job.views
      }))
      setJobs(transformedJobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setJobsLoading(false)
    }
  }

  const fetchEducationPrograms = async () => {
    try {
      const response = await categoriesApi.getEducationPrograms({
        limit: 6,
        sortBy: 'newest'
      })
      // Transform education programs to match Property interface
      const transformedPrograms = response.data.map((program: EducationProgram) => ({
        _id: program._id || program.id,
        id: program._id || program.id,
        title: program.title,
        description: program.institution?.name || '',
        price: program.tuition?.amount || 0,
        pricing_frequency: program.tuition?.period || 'per semester',
        image_urls: program.images?.map(img => img.url) || ['/placeholder.svg'],
        primaryImage: program.primaryImage || program.images?.find(img => img.isPrimary)?.url || '/placeholder.svg',
        location: program.location,
        category: 'education',
        rating: Math.random() * 0.5 + 4.5,
        reviews: program.applicationCount
      }))
      setEducationPrograms(transformedPrograms)
    } catch (error) {
      console.error('Error fetching education programs:', error)
    } finally {
      setEducationLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await categoriesApi.getServices({
        category: 'service',
        limit: 6,
        sortBy: 'newest'
      })
      setServices(response.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setServicesLoading(false)
    }
  }

  const handleSeeMore = (category: string) => {
    switch (category) {
      case 'properties':
        router.push('/categories/properties')
        break
      case 'jobs':
        router.push('/categories/jobs')
        break
      case 'education':
        router.push('/categories/education')
        break
      case 'services':
        router.push('/categories/services')
        break
      default:
        router.push('/categories')
    }
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto py-8">
        {/* Properties Section */}
        <PropertySection
          title="Places to stay in North Cyprus"
          category="properties"
          properties={properties}
          loading={propertiesLoading}
          onSeeMore={() => handleSeeMore('properties')}
          maxItems={6}
        />

        {/* Jobs Section */}
        <PropertySection
          title="Popular job opportunities"
          category="jobs"
          properties={jobs}
          loading={jobsLoading}
          onSeeMore={() => handleSeeMore('jobs')}
          maxItems={6}
        />

        {/* Education Section */}
        <PropertySection
          title="Educational programs in TRNC"
          category="education"
          properties={educationPrograms}
          loading={educationLoading}
          onSeeMore={() => handleSeeMore('education')}
          maxItems={6}
        />

        {/* Services Section */}
        <PropertySection
          title="Services & businesses"
          category="services"
          properties={services}
          loading={servicesLoading}
          onSeeMore={() => handleSeeMore('services')}
          maxItems={6}
        />
      </div>
    </div>
  )
}