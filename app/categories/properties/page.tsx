import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, BedDouble, Bath, Maximize2 } from "lucide-react"

// Mock property listings
const properties = [
  {
    id: "prop1",
    title: "Luxury Villa with Sea View",
    description: "Beautiful 4-bedroom villa with panoramic sea views, private pool, and garden",
    price: "$450,000",
    location: "Kyrenia",
    image: "/images/property-1.jpg",
    bedrooms: 4,
    bathrooms: 3,
    area: "320 m²",
    featured: true,
  },
  {
    id: "prop2",
    title: "Modern Apartment in City Center",
    description: "Newly renovated 2-bedroom apartment in the heart of the city",
    price: "$180,000",
    location: "Nicosia",
    image: "/images/property-2.jpg",
    bedrooms: 2,
    bathrooms: 1,
    area: "95 m²",
    featured: false,
  },
  {
    id: "prop3",
    title: "Beachfront Studio Apartment",
    description: "Cozy studio apartment with direct beach access and stunning views",
    price: "$120,000",
    location: "Famagusta",
    image: "/images/property-3.jpg",
    bedrooms: 1,
    bathrooms: 1,
    area: "55 m²",
    featured: false,
  },
  {
    id: "prop4",
    title: "Family Home with Garden",
    description: "Spacious 3-bedroom house with large garden and outdoor kitchen",
    price: "$320,000",
    location: "Kyrenia",
    image: "/images/property-4.jpg",
    bedrooms: 3,
    bathrooms: 2,
    area: "210 m²",
    featured: false,
  },
  {
    id: "prop5",
    title: "Penthouse with Roof Terrace",
    description: "Luxurious 3-bedroom penthouse with private roof terrace and city views",
    price: "$380,000",
    location: "Nicosia",
    image: "/images/property-5.jpg",
    bedrooms: 3,
    bathrooms: 2,
    area: "180 m²",
    featured: true,
  },
  {
    id: "prop6",
    title: "Seaside Bungalow",
    description: "Charming 2-bedroom bungalow just steps from the beach",
    price: "$220,000",
    location: "Karpaz",
    image: "/images/property-6.jpg",
    bedrooms: 2,
    bathrooms: 1,
    area: "110 m²",
    featured: false,
  },
]

export default function PropertiesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Properties & Rentals</h1>
        <p className="mt-2 text-muted-foreground">Find your dream home in North Cyprus</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          All Properties
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          For Sale
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          For Rent
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Kyrenia
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Famagusta
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Nicosia
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={property.image || "/placeholder.svg"}
                alt={property.title}
                className="aspect-video w-full object-cover"
              />
              {property.featured && (
                <div className="absolute left-2 top-2">
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">Featured</Badge>
                </div>
              )}
              <div className="absolute right-2 top-2">
                <Badge className="bg-primary">{property.price}</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle>{property.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {property.location}
              </div>
              <CardDescription>{property.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <BedDouble className="mr-1 h-4 w-4" />
                  <span className="text-sm">{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="mr-1 h-4 w-4" />
                  <span className="text-sm">{property.bathrooms} Baths</span>
                </div>
                <div className="flex items-center">
                  <Maximize2 className="mr-1 h-4 w-4" />
                  <span className="text-sm">{property.area}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
