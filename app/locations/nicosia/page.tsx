import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, BedDouble, Briefcase, GraduationCap, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function NicosiaPage() {
  return (
    <div>
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src="/images/nicosia.png" alt="Nicosia" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold text-white">Nicosia</h1>
          <p className="text-xl text-white/90">The capital city of North Cyprus</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <p className="text-lg">
            Nicosia is the capital and largest city of North Cyprus, known for its historic walled city, vibrant
            shopping districts, and rich cultural heritage. It's the commercial and political center of the region.
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
                    src="/images/property2.png"
                    alt="Modern Apartment"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">$180,000</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Modern Apartment in City Center</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Nicosia
                  </div>
                  <CardDescription>Newly renovated 2-bedroom apartment in the heart of the city</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/property1.png" alt="Penthouse" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">$380,000</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Penthouse with Roof Terrace</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Nicosia
                  </div>
                  <CardDescription>
                    Luxurious 3-bedroom penthouse with private roof terrace and city views
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/properties" className="flex items-center justify-center">
                <Button variant="outline">View All Properties in Nicosia</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/job2.png" alt="Software Developer" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Full-time</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Software Developer</CardTitle>
                  <div className="text-sm font-medium">Tech Solutions Ltd</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Nicosia
                  </div>
                  <CardDescription>
                    Looking for a skilled software developer with React and Node.js experience
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/jobs" className="flex items-center justify-center">
                <Button variant="outline">View All Jobs in Nicosia</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/education-1.jpg" alt="MBA Program" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Master's Degree</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>MBA Program</CardTitle>
                  <div className="text-sm font-medium">Near East University</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Nicosia
                  </div>
                  <CardDescription>
                    Master of Business Administration with specializations in various fields
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Learn More</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/education" className="flex items-center justify-center">
                <Button variant="outline">View All Education in Nicosia</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/service-2.jpg" alt="Home Cleaning" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Cleaning</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Home Cleaning Services</CardTitle>
                  <div className="text-sm font-medium">CleanHome Cyprus</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Nicosia
                  </div>
                  <CardDescription>Professional home and office cleaning services with trained staff</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Contact</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/services" className="flex items-center justify-center">
                <Button variant="outline">View All Services in Nicosia</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
