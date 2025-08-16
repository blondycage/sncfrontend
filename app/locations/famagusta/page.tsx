"use client"

import { useEffect, useState } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, BedDouble, Briefcase, GraduationCap, ShoppingBag, DollarSign } from "lucide-react"
import Link from "next/link"

type Listing = {
  id: string
  title: string
  price: number
  pricing_frequency: string
  image_urls?: string[]
  primaryImage?: string | null
  location?: { city?: string; region?: string }
  category: string
}

type Job = {
  id: string
  title: string
  role: string
  salary: { min: number; max: number; currency: string; frequency: string }
  jobType: string
  workLocation: string
  location: { city: string; region: string }
  company: { name: string; logo?: string }
  applicationDeadline: string
  createdAt: string
  views: number
  applicationCount: number
}

type Program = {
  _id: string
  title: string
  institution: { name: string }
  location: { city?: string }
  tuition?: { amount?: number; currency?: string; period?: string }
}

export default function FamagustaPage() {
  const [properties, setProperties] = useState<Listing[]>([])
  const [services, setServices] = useState<Listing[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [programs, setPrograms] = useState<Program[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        const [propsRes, servicesRes, jobsRes, eduRes] = await Promise.all([
          fetch(`${api}/listings?listingType=real_estate&city=famagusta&limit=6`, { cache: 'no-store' }),
          fetch(`${api}/listings?category=service&city=famagusta&limit=6`, { cache: 'no-store' }),
          fetch(`${api}/jobs?city=Famagusta&limit=6`, { cache: 'no-store' }),
          fetch(`${api}/education/programs?city=Famagusta&limit=6`, { cache: 'no-store' }),
        ])

        const propsJson = propsRes.ok ? await propsRes.json() : { data: [] }
        const servicesJson = servicesRes.ok ? await servicesRes.json() : { data: [] }
        const jobsJson = jobsRes.ok ? await jobsRes.json() : { data: [] }
        const eduJson = eduRes.ok ? await eduRes.json() : { data: [] }

        setProperties(propsJson.data || [])
        setServices(servicesJson.data || [])
        setJobs(jobsJson.data || [])
        setPrograms(eduJson.data || [])
      } catch (e) {}
    }
    load()
  }, [])

  const formatPrice = (listing: Listing) => {
    if (listing.pricing_frequency && listing.pricing_frequency !== 'fixed') {
      return `$${Number(listing.price || 0).toLocaleString()}/${listing.pricing_frequency}`
    }
    return `$${Number(listing.price || 0).toLocaleString()}`
  }

  const formatJobSalary = (job: Job) => {
    const { min, max, currency, frequency } = job.salary || ({} as any)
    if (min == null && max == null) return ''
    if (min != null && max != null) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}/${frequency}`
    }
    const value = (min != null ? min : max) as number
    return `${currency} ${value.toLocaleString()}/${frequency}`
  }

  return (
    <div>
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src="/magusa.jpeg" alt="Famagusta" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold text-white">Famagusta</h1>
          <p className="text-xl text-white/90">Historic city with vibrant nightlife</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <p className="text-lg">
            Famagusta is a city on the east coast of North Cyprus, known for its historic walled city, beautiful
            beaches, and vibrant university life. It's a perfect blend of history and modernity.
          </p>
        </div>

        <Tabs defaultValue="properties">
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="properties">
              <BedDouble className="mr-2 h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="mr-2 h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="mr-2 h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="services">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((listing) => {
                const img = listing.primaryImage || listing.image_urls?.[0] || "/placeholder.svg"
                return (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="relative">
                      <img src={img} alt={listing.title} className="aspect-video w-full object-cover" />
                      <div className="absolute right-2 top-2">
                        <Badge className="bg-primary">{formatPrice(listing)}</Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{listing.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {listing.location?.city || 'Famagusta'}
                      </div>
                      <CardDescription className="line-clamp-2">{listing.category}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/listings/${listing.id}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}

              <Link href="/listings?listingType=real_estate&city=famagusta" className="flex items-center justify-center">
                <Button variant="outline">View All Properties in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                    <div className="text-sm font-medium">{job.company?.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-4 w-4" />
                      {job.location?.city || 'Famagusta'}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between">
                    <Badge variant="secondary">{job.jobType?.replace('-', ' ')}</Badge>
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatJobSalary(job)}
                    </div>
                    <Link href={`/jobs/${job.id}`}>
                      <Button size="sm">Apply Now</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              <Link href="/jobs?city=Famagusta" className="flex items-center justify-center">
                <Button variant="outline">View All Jobs in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((p) => (
                <Card key={p._id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{p.title}</CardTitle>
                    <div className="text-sm font-medium">{p.institution?.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-4 w-4" />
                      {p.location?.city || 'Famagusta'}
                    </div>
                    {p.tuition?.amount && (
                      <CardDescription>
                        Tuition: {p.tuition.currency || 'USD'} {Number(p.tuition.amount).toLocaleString()} {p.tuition.period ? `(${p.tuition.period.replace('_',' ')})` : ''}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Link href={`/categories/education`} className="w-full">
                      <Button className="w-full">Learn More</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              <Link href="/education?city=Famagusta" className="flex items-center justify-center">
                <Button variant="outline">View All Education in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((listing) => {
                const img = listing.primaryImage || listing.image_urls?.[0] || "/placeholder.svg"
                return (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="relative">
                      <img src={img} alt={listing.title} className="aspect-video w-full object-cover" />
                      <div className="absolute right-2 top-2">
                        <Badge className="bg-primary">{formatPrice(listing)}</Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{listing.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {listing.location?.city || 'Famagusta'}
                      </div>
                      <CardDescription className="line-clamp-2">{listing.category}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/listings/${listing.id}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}

              <Link href="/listings?category=service&city=famagusta" className="flex items-center justify-center">
                <Button variant="outline">View All Services in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
