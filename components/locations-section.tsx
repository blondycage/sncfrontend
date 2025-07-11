import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function LocationsSection() {
  const locations = [
    {
      name: "Kyrenia",
      image: "/images/kyrenia-location.jpg",
      href: "/locations/kyrenia",
    },
    {
      name: "Famagusta",
      image: "/images/famagusta-location.jpg",
      href: "/locations/famagusta",
    },
    {
      name: "Nicosia",
      image: "/images/nicosia-location.jpg",
      href: "/locations/nicosia",
    },
    {
      name: "Karpaz Peninsula",
      image: "/images/karpaz.png",
      href: "/locations/karpaz",
    },
  ]

  return (
    <div className="py-12">
      <div className="container px-4">
        <h2 className="mb-8 text-2xl font-bold">Popular Locations in North Cyprus</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((location, index) => (
            <Link key={index} href={location.href}>
              <Card className="overflow-hidden transition-all hover:shadow-md">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img
                    src={location.image || "/placeholder.svg"}
                    alt={location.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{location.name}</h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
