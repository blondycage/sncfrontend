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
      <section className="relative bg-white overflow-hidden">
        <HeroSection />
      </section>

      {/* Search Section */}
      <section className="relative bg-gray-50 py-8 overflow-hidden">
        <SearchSection />
      </section>

      {/* Categories Section */}
      <section className="relative bg-white py-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <NewCategoriesSection />
        </div>
      </section>

      {/* Locations Section */}
      <section className="relative bg-gray-50 py-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LocationsSection />
        </div>
      </section>

      {/* Sponsored Section */}
      <section className="relative bg-white py-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <HomeSponsoredSection />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative bg-gray-50 py-12 border-t border-gray-200 overflow-hidden">
        <NotificationSection />
      </section>
    </div>
  )
}
