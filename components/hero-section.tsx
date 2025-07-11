"use client"

import { useRef, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slideshow images data
  const slideImages = [
    {
      src: "/images/kyrenia-thumbnail.jpg",
      alt: "Kyrenia",
      title: "Beautiful Kyrenia",
      description: "Historic harbor city"
    },
    {
      src: "/images/famagusta-thumbnail.jpg", 
      alt: "Famagusta",
      title: "Ancient Famagusta",
      description: "Rich cultural heritage"
    },
    {
      src: "/images/nicosia-location.jpg",
      alt: "Nicosia", 
      title: "Capital Nicosia",
      description: "Modern city center"
    },
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop",
      alt: "Karpaz",
      title: "Pristine Karpaz",
      description: "Untouched nature"
    }
  ]

  useEffect(() => {
    // Attempt to play the video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error)
      })
    }
  }, [])

  useEffect(() => {
    // Auto-advance slideshow every 4 seconds
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length)
    }, 4000)

    return () => clearInterval(slideInterval)
  }, [slideImages.length])

  return (
    <div className="relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/kyrenia-harbor.jpg" // Fallback image if video fails to load
        >
          {/* Replace this URL with your working Cloudinary URL when available */}
          <source
            src="https://res.cloudinary.com/dmz4mdxqo/video/upload/v1741345595/13258176_4096_2160_50fps_vqjxbv.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container grid grid-cols-1 gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center space-y-6 text-white">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">Discover North Cyprus</h1>
              <p className="mt-2 text-lg text-white/80">Your ultimate search platform for everything in North Cyprus</p>
            </div>
            <div className="inline-block w-fit rounded-md bg-amber-500 px-3 py-1 text-sm font-medium text-white">
              Coming Soon
            </div>
            <p className="text-white/80">
              Search for services, schools, rentals, apartments, scholarships, job opportunities, and much more - all in
              one place.
            </p>
            <div className="relative mt-2 overflow-hidden rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/30 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-blue-600/20 blur-xl"></div>

              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-send"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">Join Our Telegram Channel</h3>
                  <p className="text-sm text-white/80">Get early access and exclusive updates</p>
                </div>
                <a
                  href="https://t.me/sncplatform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Join Now
                </a>
              </div>
            </div>
            <Tabs defaultValue="overview" className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-3 bg-white/10">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-black">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-white data-[state=active]:text-black">
                  Features
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-black">
                  Categories
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-2 text-sm text-white/80">
                A comprehensive platform for finding and posting listings across multiple categories in North Cyprus.
              </TabsContent>
              <TabsContent value="features" className="mt-2 text-sm text-white/80">
                Easy search, Telegram authentication, personalized recommendations, and more.
              </TabsContent>
              <TabsContent value="categories" className="mt-2 text-sm text-white/80">
                Browse through properties, jobs, services, education, and many other categories.
              </TabsContent>
            </Tabs>
          </div>
          <div className="relative hidden overflow-hidden rounded-lg md:flex md:items-center md:justify-center">
            <div className="relative rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              {/* Slideshow Container */}
              <div className="group relative h-64 w-80 overflow-hidden rounded-lg">
                {slideImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentSlide 
                        ? 'opacity-100 transform translate-x-0' 
                        : index < currentSlide 
                        ? 'opacity-0 transform -translate-x-full' 
                        : 'opacity-0 transform translate-x-full'
                    }`}
                  >
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="h-full w-full object-cover rounded-lg"
                    />
                    {/* Image overlay with title */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5 rounded-b-lg">
                      <h4 className="text-white font-medium text-base">{image.title}</h4>
                      <p className="text-white/80 text-sm">{image.description}</p>
                    </div>
                  </div>
                ))}
                
                {/* Navigation dots */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {slideImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-white scale-110' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all duration-200 opacity-70 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slideImages.length)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all duration-200 opacity-70 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>
              
              <div className="mt-4 text-center text-white">
                <p className="font-medium">Explore Beautiful Locations</p>
                <p className="text-sm text-white/80">Find your perfect spot in North Cyprus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
