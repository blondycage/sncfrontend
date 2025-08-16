import HeroSection from "@/components/hero-section"
import SearchSection from "@/components/search-section"
import CategoriesSection from "@/components/categories-section"
import LocationsSection from "@/components/locations-section"
import NotificationSection from "@/components/notification-section"
import HomeSponsoredSection from "@/components/home-sponsored-section"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <SearchSection />
      <CategoriesSection />
      <LocationsSection />
      <HomeSponsoredSection />
      <NotificationSection />
    </div>
  )
}
