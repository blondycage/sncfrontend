import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function LocationsSection() {
  const locations = [
    {
      name: "Kyrenia",
      image: "/girne.jpeg",
      href: "/locations/kyrenia",
    },
    {
      name: "Famagusta",
      image: "/magusa.jpeg",
      href: "/locations/famagusta",
    },
    {
      name: "Nicosia",
      image: "/nicosia.jpg",
      href: "/locations/nicosia",
    },
    {
      name: "Iskele",
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/477274246.jpg?k=0cc76ec030b913b8e81644134841dfe976a39584b5f049cbe046e61dcebbfe79&o=",
      href: "/locations/iskele",
    },
  ]

  return (
    <div className="py-8 sm:py-12">
      <div className="container px-4">
        <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl lg:text-3xl font-bold text-center sm:text-left">Popular Locations in North Cyprus</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
