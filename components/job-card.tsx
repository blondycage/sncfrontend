"use client"

import Link from "next/link"
import { Briefcase, MapPin, Clock, DollarSign, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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

interface JobCardProps {
  job: Job
  className?: string
}

export function JobCard({ job, className = "" }: JobCardProps) {
  const formatSalary = () => {
    const currency = job.salary.currency === 'USD' ? '$' :
                     job.salary.currency === 'EUR' ? '€' :
                     job.salary.currency === 'GBP' ? '£' :
                     job.salary.currency === 'TRY' ? '₺' : job.salary.currency

    if (job.salary.min === job.salary.max) {
      return `${currency}${job.salary.min.toLocaleString()}`
    }
    return `${currency}${job.salary.min.toLocaleString()} - ${currency}${job.salary.max.toLocaleString()}`
  }

  const getJobTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'part-time':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contract':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'freelance':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'internship':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getWorkLocationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'remote':
        return '🏠'
      case 'on-site':
        return '🏢'
      case 'hybrid':
        return '🔀'
      default:
        return '📍'
    }
  }

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className={`group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-primary/30 bg-white ${className}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getJobTypeBadgeColor(job.jobType)} text-xs font-medium border`}>
                  {job.jobType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getWorkLocationIcon(job.workLocation)} {job.workLocation}
                </Badge>
              </div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {job.company.name}
              </p>
            </div>
            {job.company.logo && (
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center ml-4 flex-shrink-0">
                <span className="text-2xl">💼</span>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{job.location.city}{job.location.region ? `, ${job.location.region}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>{formatSalary()} / {job.salary.frequency}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {job.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{job.views} views</span>
                </div>
              )}
              {job.applicationCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{job.applicationCount} applicants</span>
                </div>
              )}
            </div>
            <div className="text-xs text-primary font-medium group-hover:underline">
              View Details →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function JobCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="w-14 h-14 bg-gray-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
