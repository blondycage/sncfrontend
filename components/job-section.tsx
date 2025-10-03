"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobCard, JobCardSkeleton } from "@/components/job-card"

interface Job {
  id: string
  title: string
  role: string
  company: {
    name: string
    logo?: string
  }
  salary: {
    min: number
    max: number
    currency: string
    frequency: string
  }
  location: {
    city: string
    region?: string
  }
  jobType: string
  workLocation: string
  applicationDeadline: string
  views?: number
  applicationCount?: number
}

interface JobSectionProps {
  title: string
  jobs: Job[]
  loading?: boolean
  onSeeMore: () => void
  maxItems?: number
  showScrollButtons?: boolean
}

export function JobSection({
  title,
  jobs,
  loading = false,
  onSeeMore,
  maxItems = 5,
  showScrollButtons = true
}: JobSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0)

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('job-scroll-container')
    if (container) {
      const scrollAmount = 360 // Width of one card (336px) plus gap (24px)
      const newPosition = direction === 'left'
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount

      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  // Limit the number of jobs displayed
  const displayJobs = jobs.slice(0, maxItems)
  const skeletonCount = Math.max(0, maxItems - displayJobs.length)

  return (
    <div className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 text-center sm:text-left">{title}</h2>

        <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
          {showScrollButtons && (
            <div className="flex space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('left')}
                disabled={scrollPosition <= 0}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('right')}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={onSeeMore}
            className="flex items-center space-x-1 text-sm sm:text-base"
          >
            <span>See more</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          id="job-scroll-container"
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Actual Jobs */}
          {displayJobs.map((job) => (
            <div key={job.id} className="flex-shrink-0 w-[336px]">
              <JobCard job={job} />
            </div>
          ))}

          {/* Skeleton Loaders */}
          {(loading || skeletonCount > 0) && Array.from({ length: loading ? maxItems : skeletonCount }).map((_, index) => (
            <div key={`skeleton-${index}`} className="flex-shrink-0 w-[336px]">
              <JobCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
