"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PropertySection } from "@/components/property-section"
import { VehicleSection } from "@/components/vehicle-section"
import { EducationSection } from "@/components/education-section"
import { HomeAppliancesSection } from "@/components/home-appliances-section"
import { categoriesApi, listingsApi } from "@/lib/api"

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

interface Vehicle {
  _id?: string
  id?: string
  title: string
  description: string
  price: number
  pricing_frequency: string
  currency?: string
  image_urls: string[]
  primaryImage?: string
  location?: {
    city: string
    region?: string
  }
  category: string
  listingType?: string
  views?: number
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

interface HomeAppliance {
  _id: string
  title: string
  description: string
  price: number
  currency: string
  pricing_frequency: string
  image_urls: string[]
  primaryImage?: string
  location?: {
    city: string
    region?: string
  }
  category: string
  listingType: string
  views?: number
  tags?: string[]
  createdAt: string
}

export default function NewCategoriesSection() {
  const router = useRouter()
  
  // State for different categories
  const [properties, setProperties] = useState<Property[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [educationPrograms, setEducationPrograms] = useState<EducationProgram[]>([])
  const [services, setServices] = useState<Property[]>([])
  const [homeAppliances, setHomeAppliances] = useState<HomeAppliance[]>([])

  // Loading states
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [educationLoading, setEducationLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)
  const [homeAppliancesLoading, setHomeAppliancesLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
    fetchVehicles()
    fetchEducationPrograms()
    fetchServices()
    fetchHomeAppliances()
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

  const fetchVehicles = async () => {
    try {
      const response = await listingsApi.getListings({
        listingType: 'vehicle',
        limit: 6,
        sortBy: 'newest'
      })
      setVehicles(response.data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setVehiclesLoading(false)
    }
  }

  const fetchEducationPrograms = async () => {
    try {
      const response = await categoriesApi.getEducationPrograms({
        limit: 6,
        sortBy: 'newest'
      })
      setEducationPrograms(response.data || [])
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
      console.log('Services API Response:', response)
      setServices(response.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setServicesLoading(false)
    }
  }

  const fetchHomeAppliances = async () => {
    try {
      const response = await listingsApi.getListings({
        listingType: 'home_appliances',
        limit: 6,
        sortBy: 'newest'
      })
      setHomeAppliances(response.data || [])
    } catch (error) {
      console.error('Error fetching home appliances:', error)
    } finally {
      setHomeAppliancesLoading(false)
    }
  }

  const handleSeeMore = (category: string) => {
    switch (category) {
      case 'properties':
        router.push('/categories/properties')
        break
      case 'vehicles':
        router.push('/categories/vehicles')
        break
      case 'education':
        router.push('/categories/education')
        break
      case 'services':
        router.push('/categories/services')
        break
      case 'home-appliances':
        router.push('/categories/home-appliances')
        break
      default:
        router.push('/categories')
    }
  }

  return (
    <div>
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

        {/* DriveYourType Section */}
        <VehicleSection
          title="DriveYourType - Find Your Perfect Vehicle"
          vehicles={vehicles}
          loading={vehiclesLoading}
          onSeeMore={() => handleSeeMore('vehicles')}
          maxItems={6}
        />

        {/* Education Section */}
        <EducationSection
          title="Educational programs in TRNC"
          programs={educationPrograms}
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

        {/* Home Appliances Section */}
        <HomeAppliancesSection
          title="Home Appliances"
          appliances={homeAppliances}
          loading={homeAppliancesLoading}
          onSeeMore={() => handleSeeMore('home-appliances')}
          maxItems={6}
        />
      </div>
    </div>
  )
}