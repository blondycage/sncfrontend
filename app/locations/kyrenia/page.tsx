import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, BedDouble, Briefcase, GraduationCap, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function KyreniaPage() {
  return (
    <div>
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src="/images/kyrenia-header.jpg" alt="Kyrenia" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold text-white">Kyrenia</h1>
          <p className="text-xl text-white/90">The jewel of North Cyprus</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <p className="text-lg">
            Kyrenia is a beautiful coastal city in North Cyprus, known for its historic harbor, castle, and stunning
            mountain backdrop. It's a popular destination for tourists and expats alike.
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
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/property-1.jpg" alt="Luxury Villa" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">$450,000</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Luxury Villa with Sea View</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Kyrenia
                  </div>
                  <CardDescription>
                    Beautiful 4-bedroom villa with panoramic sea views, private pool, and garden
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/property-4.jpg" alt="Apartment" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">$1,200/month</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Modern Apartment for Rent</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Kyrenia
                  </div>
                  <CardDescription>Fully furnished 2-bedroom apartment near the harbor</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/properties" className="flex items-center justify-center">
                <Button variant="outline">View All Properties in Kyrenia</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/job-1.jpg" alt="Hotel Manager" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Full-time</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Hotel Manager</CardTitle>
                  <div className="text-sm font-medium">Luxury Resort & Spa</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Kyrenia
                  </div>
                  <CardDescription>Experienced hotel manager needed for a 5-star resort in Kyrenia</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/job-4.jpg" alt="Chef" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Full-time</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Head Chef</CardTitle>
                  <div className="text-sm font-medium">Harbor Restaurant</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Kyrenia
                  </div>
                  <CardDescription>Experienced chef needed for a popular restaurant in Kyrenia harbor</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/jobs" className="flex items-center justify-center">
                <Button variant="outline">View All Jobs in Kyrenia</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img
                    src="/images/education-3.jpg"
                    alt="Language Course"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Language Course</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>English Language Course</CardTitle>
                  <div className="text-sm font-medium">Cyprus Language Academy</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Kyrenia
                  </div>
                  <CardDescription>
                    Intensive English language course for all levels with native speakers
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Learn More</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/education" className="flex items-center justify-center">
                <Button variant="outline">View All Education in Kyrenia</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/service-1.jpg" alt="Car Rental" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Transportation</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Premium Car Rental</CardTitle>
                  <div className="text-sm font-medium">Cyprus Luxury Cars</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Kyrenia
                  </div>
                  <CardDescription>Luxury and economy car rental services for tourists and locals</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Contact</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/services" className="flex items-center justify-center">
                <Button variant="outline">View All Services in Kyrenia</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
