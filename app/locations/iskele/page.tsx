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

export default function KarpazPage() {
  const [properties, setProperties] = useState<Listing[]>([])
  const [services, setServices] = useState<Listing[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [programs, setPrograms] = useState<Program[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        // Note: listings 'city' accepts 'dipkarpaz' or 'karpas'. Using 'dipkarpaz' here.
        const [propsRes, servicesRes, jobsRes, eduRes] = await Promise.all([
          fetch(`${api}/listings?listingType=real_estate&city=iskele&limit=6`, { cache: 'no-store' }),
          fetch(`${api}/listings?category=service&city=iskele&limit=6`, { cache: 'no-store' }),
          fetch(`${api}/jobs?city=Iskele&limit=6`, { cache: 'no-store' }),
          // Education programs in Karpaz region
          fetch(`${api}/education/programs?city=${encodeURIComponent('Iskele')}&limit=6`, { cache: 'no-store' }),
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
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      TRY: '₺'
    };
    const symbol = currencySymbols[listing.currency || 'USD'] || '$';
    const formattedPrice = Number(listing.price || 0).toLocaleString();

    if (listing.pricing_frequency && listing.pricing_frequency !== 'fixed') {
      return `${symbol}${formattedPrice}/${listing.pricing_frequency}`;
    }
    return `${symbol}${formattedPrice}`;
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
        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/477274246.jpg?k=0cc76ec030b913b8e81644134841dfe976a39584b5f049cbe046e61dcebbfe79&o=" alt="Karpaz Peninsula" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold text-white">Iskele</h1>
          <p className="text-xl text-white/90">Untouched natural beauty</p>
        </div>
      </div>

      <div className="container px-6 py-12 mx-auto max-w-7xl">
        <div className="mb-12 px-4">
          <p className="text-lg leading-relaxed">
            ISKELE is the most unspoiled part of North Cyprus, known for its pristine beaches, wild
            donkeys, and natural beauty. It's perfect for those seeking tranquility and connection with nature.
          </p>
        </div>

        <div className="px-4">
          <Tabs defaultValue="properties">
            <TabsList className="mb-8 grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="properties" className="flex-col gap-1 py-2 px-2 sm:flex-row sm:gap-2 sm:py-3 sm:px-4">
              <BedDouble className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex-col gap-1 py-2 px-2 sm:flex-row sm:gap-2 sm:py-3 sm:px-4">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex-col gap-1 py-2 px-2 sm:flex-row sm:gap-2 sm:py-3 sm:px-4">
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Education</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-col gap-1 py-2 px-2 sm:flex-row sm:gap-2 sm:py-3 sm:px-4">
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Services</span>
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
                        {listing.location?.city || 'Karpaz'}
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

              <Link href="/listings?listingType=real_estate&city=iskele" className="flex items-center justify-center">
                <Button variant="outline">View All Properties in Iskele</Button>
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
                      {job.location?.city || 'Karpaz'}
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

              <Link href="/jobs?city=Iskele" className="flex items-center justify-center">
                <Button variant="outline">View All Jobs in Iskele</Button>
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
                      {p.location?.city || 'İskele'}
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

              <Link href={`/education?city=${encodeURIComponent('Iskele')}`} className="flex items-center justify-center">
                <Button variant="outline">View All Education in Iskele</Button>
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
                        {listing.location?.city || 'Karpaz'}
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

              <Link href="/listings?category=service&city=iskele" className="flex items-center justify-center">
                <Button variant="outline">View All Services in Iskele</Button>
              </Link>
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
