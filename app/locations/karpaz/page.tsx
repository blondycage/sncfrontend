import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, BedDouble, Briefcase, GraduationCap, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function KarpazPage() {
  return (
    <div>
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src="/images/karpaz.png" alt="Karpaz Peninsula" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold text-white">Karpaz Peninsula</h1>
          <p className="text-xl text-white/90">Untouched natural beauty</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <p className="text-lg">
            The Karpaz Peninsula is the most unspoiled part of North Cyprus, known for its pristine beaches, wild
            donkeys, and natural beauty. It's perfect for those seeking tranquility and connection with nature.
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
                    src="/images/property3.png"
                    alt="Seaside Bungalow"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">$220,000</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Seaside Bungalow</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Karpaz
                  </div>
                  <CardDescription>Charming 2-bedroom bungalow just steps from the beach</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/properties" className="flex items-center justify-center">
                <Button variant="outline">View All Properties in Karpaz</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/job3.png" alt="Tour Guide" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Seasonal</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Tour Guide</CardTitle>
                  <div className="text-sm font-medium">Cyprus Adventures</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Karpaz
                  </div>
                  <CardDescription>
                    Knowledgeable tour guide with language skills needed for tourist groups
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/jobs" className="flex items-center justify-center">
                <Button variant="outline">View All Jobs in Karpaz</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                No educational institutions currently listed in Karpaz Peninsula.
              </p>
              <Link href="/categories/education">
                <Button variant="outline">View All Education Options</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img src="/images/services.jpg" alt="Eco Tours" className="aspect-video w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary">Tourism</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Eco Tours & Safaris</CardTitle>
                  <div className="text-sm font-medium">Karpaz Explorers</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    Karpaz
                  </div>
                  <CardDescription>Guided tours of the Karpaz Peninsula's natural wonders and wildlife</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Book Now</Button>
                </CardFooter>
              </Card>

              <Link href="/categories/services" className="flex items-center justify-center">
                <Button variant="outline">View All Services in Karpaz</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
