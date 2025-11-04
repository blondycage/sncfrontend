import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function CategoriesSection() {
  const categories = [
    {
      title: "Properties & Rentals",
      image: "/images/property-category.jpg",
      href: "/categories/properties",
    },
    {
      title: "Home Appliances",
      image: "/images/home-appliances-category.jpg",
      href: "/categories/home-appliances",
    },
    {
      title: "Education & Scholarships",
      image: "/images/education-category.jpg",
      href: "/categories/education",
    },
    {
      title: "Jobs & Opportunities",
      image: "/images/jobs-category.jpg",
      href: "/categories/jobs",
    },
    {
      title: "Services & Businesses",
      image: "/images/services-category.jpg",
      href: "/categories/services",
    },
  ]

  return (
    <div className="bg-gray-50 py-12">
      <div className="container px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Search Categories</h2>
         
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link key={index} href={category.href}>
              <Card className="overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{category.title}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
