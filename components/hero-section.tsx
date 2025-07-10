"use client"

import { useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Attempt to play the video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error)
      })
    }
  }, [])

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
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 w-24 overflow-hidden rounded-md">
                  <img src="/images/kyrenia-thumbnail.jpg" alt="Kyrenia" className="h-full w-full object-cover" />
                </div>
                <div className="h-24 w-24 overflow-hidden rounded-md">
                  <img src="/images/famagusta-thumbnail.jpg" alt="Famagusta" className="h-full w-full object-cover" />
                </div>
                <div className="h-24 w-24 overflow-hidden rounded-md">
                  <img src="/images/nicosia-location.jpg" alt="Nicosia" className="h-full w-full object-cover" />
                </div>
                <div className="h-24 w-24 overflow-hidden rounded-md">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop"
                    alt="Karpaz"
                    className="h-full w-full object-cover"
                  />
                </div>
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
