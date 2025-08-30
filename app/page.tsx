import HeroSection from "@/components/hero-section"
import SearchSection from "@/components/search-section"
import NewCategoriesSection from "@/components/new-categories-section"
import LocationsSection from "@/components/locations-section"
import NotificationSection from "@/components/notification-section"
import HomeSponsoredSection from "@/components/home-sponsored-section"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <SearchSection />
      <div className="px-4 sm:px-6 lg:px-8">
        <NewCategoriesSection />
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <LocationsSection />
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <HomeSponsoredSection />
      </div>
      <NotificationSection />
    </div>
  )
}
