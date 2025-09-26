import HeroSection from "@/components/hero-section"
import SearchSection from "@/components/search-section"
import NewCategoriesSection from "@/components/new-categories-section"
import LocationsSection from "@/components/locations-section"
import NotificationSection from "@/components/notification-section"
import HomeSponsoredSection from "@/components/home-sponsored-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <HeroSection />
      </section>

      {/* Search Section */}
      <section className="relative bg-gradient-to-b from-blue-50/50 to-white py-8">
        <SearchSection />
      </section>

      {/* Categories Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <NewCategoriesSection />
        </div>
      </section>

      {/* Locations Section */}
      <section className="relative bg-gradient-to-b from-gray-50/30 to-blue-50/20 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LocationsSection />
        </div>
      </section>

      {/* Sponsored Section */}
      <section className="relative bg-gradient-to-b from-blue-50/20 to-purple-50/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <HomeSponsoredSection />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative bg-gradient-to-b from-purple-50/10 to-gray-100/50 py-12 border-t border-gray-200/50">
        <NotificationSection />
      </section>
    </div>
  )
}
