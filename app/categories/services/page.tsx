import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from "lucide-react"

// Mock service listings
const services = [
  {
    id: "serv1",
    title: "Premium Car Rental",
    company: "Cyprus Luxury Cars",
    description: "Luxury and economy car rental services for tourists and locals",
    price: "From $30/day",
    location: "Kyrenia",
    type: "Transportation",
    image: "/images/service-1.jpg",
    rating: 4.8,
    featured: true,
  },
  {
    id: "serv2",
    title: "Home Cleaning Services",
    company: "CleanHome Cyprus",
    description: "Professional home and office cleaning services with trained staff",
    price: "From $15/hour",
    location: "Nicosia",
    type: "Cleaning",
    image: "/images/service-2.jpg",
    rating: 4.5,
    featured: false,
  },
  {
    id: "serv3",
    title: "Legal Consultation",
    company: "Cyprus Legal Advisors",
    description: "Professional legal services for property purchase and business setup",
    price: "From $100/hour",
    location: "Famagusta",
    type: "Legal",
    image: "/images/service-3.jpg",
    rating: 4.9,
    featured: false,
  },
  {
    id: "serv4",
    title: "Web Design & Development",
    company: "CyprusTech Solutions",
    description: "Professional website design and development for businesses",
    price: "From $500",
    location: "Kyrenia",
    type: "IT Services",
    image: "/images/service-4.jpg",
    rating: 4.7,
    featured: false,
  },
  {
    id: "serv5",
    title: "Wedding Planning",
    company: "Cyprus Dream Weddings",
    description: "Complete wedding planning services for your perfect day in Cyprus",
    price: "Custom packages",
    location: "Kyrenia",
    type: "Events",
    image: "/images/service-5.jpg",
    rating: 5.0,
    featured: true,
  },
  {
    id: "serv6",
    title: "Property Management",
    company: "Cyprus Property Care",
    description: "Full property management services for homeowners and investors",
    price: "From $100/month",
    location: "Famagusta",
    type: "Real Estate",
    image: "/images/service-6.jpg",
    rating: 4.6,
    featured: false,
  },
]

export default function ServicesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Services & Businesses</h1>
        <p className="mt-2 text-muted-foreground">Find professional services in North Cyprus</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          All Services
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Transportation
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Legal
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Cleaning
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          IT Services
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={service.image || "/placeholder.svg"}
                alt={service.title}
                className="aspect-video w-full object-cover"
              />
              {service.featured && (
                <div className="absolute left-2 top-2">
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">Featured</Badge>
                </div>
              )}
              <div className="absolute right-2 top-2">
                <Badge className="bg-primary">{service.type}</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle>{service.title}</CardTitle>
              <div className="text-sm font-medium">{service.company}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {service.location}
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{service.rating} (32 reviews)</span>
                </div>
                <div className="flex items-center font-medium">{service.price}</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Contact</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
