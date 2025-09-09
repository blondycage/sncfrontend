"use client"

import { useRef, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { promotionsApi } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Array<{ promotionId: string; src: string; alt: string; title: string; description?: string; listingId: string; price?: number; pricing_frequency?: string; category?: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()


  // Load active homepage promotions
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await promotionsApi.getActiveForHomepage()
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data
            .filter((p: any) => p.listing && p.listing.image_urls && p.listing.image_urls.length > 0)
            .map((p: any) => ({
              promotionId: p._id,
              src: p.listing.image_urls[0],
              alt: p.listing.title,
              title: p.listing.title,
              description: p.listing.category,
              listingId: p.listing._id,
              price: p.listing.price,
              pricing_frequency: p.listing.pricing_frequency,
              category: p.listing.category,
            }))
          if (isMounted) {
            setSlides(mapped)
            setIsLoading(false)
          }
        } else {
          // No promotions found, use fallback
          if (isMounted) setIsLoading(false)
        }
      } catch (e) {
        // ignore and use fallback
        if (isMounted) setIsLoading(false)
      }
    })()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    // Attempt to play the video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error)
      })
    }
  }, [])

  useEffect(() => {
    // Auto-advance slideshow every 4 seconds, but only when not loading and has slides
    if (isLoading || slides.length <= 1) return
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(slideInterval)
  }, [slides.length, isLoading])

  const formatPrice = (price?: number, frequency?: string) => {
    if (typeof price !== 'number') return ''
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price)
    if (!frequency || frequency === 'fixed') return formatted
    return `${formatted}/${frequency}`
  }

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
        <div className="container grid grid-cols-1 gap-6 sm:gap-8 px-4 py-12 sm:py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 text-white">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center md:text-left">Search North Cyprus</h1>
              <p className="mt-2 text-base sm:text-lg text-white/80 text-center md:text-left">Your ultimate search platform for everything in North Cyprus</p>
            </div>
          
           
            <div className="relative mt-2 overflow-hidden rounded-lg border border-white/20 bg-white/10 p-3 sm:p-4 backdrop-blur-md">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/30 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-blue-600/20 blur-xl"></div>

              <div className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sm:w-6 sm:h-6"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-medium text-white">Join Our Community</h3>
                  <p className="text-xs sm:text-sm text-white/80">Get early access and exclusive updates</p>
                </div>
                <a
                  href="https://t.me/searchnorthcyprus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-blue-700 flex-shrink-0"
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
          <div className="relative overflow-hidden rounded-lg flex items-center justify-center">
            <div className="relative rounded-lg bg-white/10 p-3 md:p-4 backdrop-blur-sm w-full">
              {/* Slideshow Container (Loading spinner, promoted if available, else advertise) */}
              <div className="group relative h-72 w-full md:h-96 md:w-[36rem] lg:h-[30rem] overflow-hidden rounded-xl shadow-2xl">
                {isLoading ? (
                  /* Loading Spinner */
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
                      <p className="text-white/80 text-sm font-medium">Loading featured listings...</p>
                    </div>
                  </div>
                ) : slides.length === 0 ? (
                  /* Advertise Here Message */
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/30">
                    <div className="text-center px-6">
                      <h3 className="text-white font-black text-2xl md:text-3xl lg:text-4xl mb-2 tracking-wide">
                        ADVERTISE HERE!!!
                      </h3>
                      <p className="text-white/80 text-sm md:text-base font-medium">
                        Promote your listings and reach more customers
                      </p>
                      <button 
                        onClick={() => window.open('/dashboard', '_blank')}
                        className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg transition-colors duration-200"
                      >
                        Start Advertising
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {slides.map((image, index) => (
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
                        <button
                          onClick={async () => {
                            // Track click if promotion
                            const isPromo = (slides.length > 0)
                            if (isPromo) {
                              const promo = slides[index]
                              try { await promotionsApi.trackClick(promo.promotionId) } catch {}
                              router.push(`/listings/${promo.listingId}`)
                            }
                          }}
                          className="block text-left w-full h-full"
                        >
                          <img 
                            src={(image as any).src} 
                            alt={(image as any).alt} 
                            className="h-full w-full object-cover rounded-xl"
                          />
                        </button>
                        {/* Image overlay with title */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 md:p-6 rounded-b-xl">
                          <div className="flex items-center gap-2 mb-2">
                            {slides.length > 0 && (
                              <span className="inline-flex items-center rounded bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Sponsored</span>
                            )}
                            {(image as any).category && (
                              <span className="inline-flex items-center rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">{(image as any).category}</span>
                            )}
                          </div>
                          <h4 className="text-white font-semibold text-lg md:text-xl line-clamp-2">{(image as any).title}</h4>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-white/90 text-sm md:text-base font-medium">
                              {formatPrice((image as any).price, (image as any).pricing_frequency) || (image as any).description}
                            </p>
                            {slides.length > 0 && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  const promo = slides[index]
                                  try { await promotionsApi.trackClick(promo.promotionId) } catch {}
                                  router.push(`/listings/${promo.listingId}`)
                                }}
                                className="rounded-md bg-white/90 px-3 py-1 text-xs font-medium text-black hover:bg-white"
                              >
                                View Listing
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Navigation dots - only show when there are multiple slides */}
                    {slides.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {slides.map((_, index) => (
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
                    )}

                    {/* Navigation arrows - only show when there are multiple slides */}
                    {slides.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200 opacity-80"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15,18 9,12 15,6"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200 opacity-80"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9,18 15,12 9,6"></polyline>
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              <div className="mt-3 text-center text-white">
                <p className="font-medium">Explore featured listings</p>
                <p className="text-sm text-white/80">Discover great deals across categories</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
