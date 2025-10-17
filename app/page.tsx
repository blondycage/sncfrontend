import HeroSection from "@/components/hero-section"
import SearchSection from "@/components/search-section"
import NewCategoriesSection from "@/components/new-categories-section"
import LocationsSection from "@/components/locations-section"
import NotificationSection from "@/components/notification-section"
import HomeSponsoredSection from "@/components/home-sponsored-section"
import { KeyIcon, CarIcon, MoneyIcon, HomeIcon, BriefcaseIcon, GraduationCapIcon, SparklesIcon } from "@/components/decorative-svgs"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-soft overflow-hidden">
        <div className="absolute top-4 right-4 text-purple-400 animate-pulse">
          <SparklesIcon className="w-16 h-16" />
        </div>
        <div className="absolute bottom-8 left-4 text-blue-400">
          <HomeIcon className="w-24 h-24" />
        </div>
        <HeroSection />
      </section>

      {/* Search Section */}
      <section className="relative bg-gradient-blue py-8 overflow-hidden">
        <div className="absolute top-4 left-4 text-blue-600 rotate-12">
          <BriefcaseIcon className="w-20 h-20" />
        </div>
        <div className="absolute bottom-4 right-4 text-blue-500 -rotate-12">
          <CarIcon className="w-24 h-24" />
        </div>
        <SearchSection />
      </section>

      {/* Categories Section */}
      <section className="relative bg-gradient-purple py-16 overflow-hidden">
        <div className="absolute top-8 right-8 text-purple-600">
          <KeyIcon className="w-20 h-20 rotate-45" />
        </div>
        <div className="absolute bottom-12 left-8 text-purple-500">
          <MoneyIcon className="w-24 h-24" />
        </div>
        <div className="absolute top-1/2 right-4 text-purple-400 animate-pulse">
          <SparklesIcon className="w-12 h-12" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <NewCategoriesSection />
        </div>
      </section>

      {/* Locations Section */}
      <section className="relative bg-gradient-teal py-16 overflow-hidden">
        <div className="absolute top-4 left-6 text-teal-600 rotate-12">
          <HomeIcon className="w-28 h-28" />
        </div>
        <div className="absolute bottom-8 right-8 text-teal-500 -rotate-12">
          <KeyIcon className="w-24 h-24" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LocationsSection />
        </div>
      </section>

      {/* Sponsored Section */}
      <section className="relative bg-gradient-soft py-16 overflow-hidden">
        <div className="absolute top-6 right-6 text-blue-500">
          <MoneyIcon className="w-28 h-28 rotate-12" />
        </div>
        <div className="absolute bottom-10 left-6 text-purple-500">
          <CarIcon className="w-32 h-32 -rotate-6" />
        </div>
        <div className="absolute top-1/3 left-8 text-purple-400 animate-pulse">
          <SparklesIcon className="w-14 h-14" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <HomeSponsoredSection />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative bg-gradient-blue py-12 border-t border-blue-200/30 overflow-hidden">
        <div className="absolute top-4 left-4 text-blue-600">
          <GraduationCapIcon className="w-24 h-24 rotate-6" />
        </div>
        <div className="absolute bottom-4 right-4 text-blue-500 -rotate-12">
          <BriefcaseIcon className="w-20 h-20" />
        </div>
        <NotificationSection />
      </section>
    </div>
  )
}
