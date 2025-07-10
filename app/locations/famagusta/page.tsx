import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, BedDouble, Briefcase, GraduationCap, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function FamagustaPage() {
  return (
    <div>
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src="/images/famagusta-header.jpg" alt="Famagusta" className="h-full w-full object-cover" />
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
              <Card className="overflow-hidden">
                <div className="relative">
                  <img
                    src="/images/property-3.jpg"
                    alt="Beachfront Studio"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">$120,000</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Beachfront Studio Apartment</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Famagusta
                  </div>
                  <CardDescription>Cozy studio apartment with direct beach access and stunning views</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/properties" className="flex items-center justify-center">
                <Button variant="outline">View All Properties in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/job-3.jpg" alt="Restaurant Chef" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Full-time</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Restaurant Chef</CardTitle>
                  <div className="text-sm font-medium">Mediterranean Cuisine</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Famagusta
                  </div>
                  <CardDescription>Experienced chef needed for a popular restaurant in Famagusta</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/jobs" className="flex items-center justify-center">
                <Button variant="outline">View All Jobs in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img
                    src="/images/education-2.jpg"
                    alt="Business Administration"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Bachelor's Degree</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Business Administration</CardTitle>
                  <div className="text-sm font-medium">Eastern Mediterranean University</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Famagusta
                  </div>
                  <CardDescription>
                    Comprehensive business administration program with focus on international business
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Learn More</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/education" className="flex items-center justify-center">
                <Button variant="outline">View All Education in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img
                    src="/images/service-6.jpg"
                    alt="Property Management"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Real Estate</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Property Management</CardTitle>
                  <div className="text-sm font-medium">Cyprus Property Care</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Famagusta
                  </div>
                  <CardDescription>Full property management services for homeowners and investors</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Contact</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/services" className="flex items-center justify-center">
                <Button variant="outline">View All Services in Famagusta</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
