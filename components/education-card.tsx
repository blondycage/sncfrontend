"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { GraduationCap, MapPin, Clock, DollarSign, Star, BookOpen, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface EducationProgram {
  _id?: string
  id?: string
  title: string
  institution: {
    name: string
    logo?: string
  }
  level: string
  fieldOfStudy?: string
  duration: {
    value: number
    unit: string
  }
  tuition: {
    amount: number
    currency: string
    period: string
  }
  location: {
    city: string
    campus?: string
  }
  images?: Array<{
    url: string
    caption?: string
    isPrimary?: boolean
  }>
  primaryImage?: string
  rating?: number
  applicationCount?: number
}

interface EducationCardProps {
  program: EducationProgram
  className?: string
}

export function EducationCard({ program, className = "" }: EducationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatTuition = () => {
    const currency = program.tuition.currency === 'USD' ? '$' :
                     program.tuition.currency === 'EUR' ? '€' :
                     program.tuition.currency === 'GBP' ? '£' :
                     program.tuition.currency === 'TRY' ? '₺' : program.tuition.currency

    return `${currency}${program.tuition.amount.toLocaleString()}`
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bachelor':
      case "bachelor's":
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'master':
      case "master's":
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'phd':
      case 'doctorate':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'diploma':
      case 'certificate':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bachelor':
      case "bachelor's":
        return '🎓'
      case 'master':
      case "master's":
        return '📚'
      case 'phd':
      case 'doctorate':
        return '🔬'
      case 'diploma':
      case 'certificate':
        return '📜'
      default:
        return '🎓'
    }
  }

  const programImage = program.primaryImage || program.images?.find(img => img.isPrimary)?.url || program.images?.[0]?.url

  return (
    <Link href={`/categories/education/${program._id || program.id}`}>
      <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 ${className}`}>
        {/* Header Image with Overlay */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
          {programImage ? (
            <>
              <Image
                src={programImage}
                alt={program.title}
                fill
                className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                  imageLoaded ? "opacity-70" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 animate-pulse" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="w-20 h-20 text-white/30" />
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Level Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 font-semibold text-sm px-3 py-1 shadow-lg">
              {getLevelIcon(program.level)} {program.level}
            </Badge>
          </div>

          {/* Rating Badge */}
          {program.rating && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-amber-500/90 backdrop-blur-sm text-white border-0 font-semibold text-sm px-3 py-1 shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-white" />
                {program.rating.toFixed(1)}
              </Badge>
            </div>
          )}

          {/* Institution Logo */}
          <div className="absolute bottom-4 left-4">
            <div className="w-16 h-16 rounded-xl bg-white shadow-xl flex items-center justify-center p-2 border-2 border-white/50">
              {program.institution.logo ? (
                <Image
                  src={program.institution.logo}
                  alt={program.institution.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <BookOpen className="w-8 h-8 text-blue-600" />
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Title & Institution */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-tight">
              {program.title}
            </h3>
            <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Award className="w-4 h-4 text-blue-600" />
              {program.institution.name}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 mb-4">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{program.location.city}</p>
                {program.location.campus && (
                  <p className="text-xs text-gray-500">{program.location.campus}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {program.duration.value} {program.duration.unit}{program.duration.value > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500">Program Duration</p>
              </div>
            </div>

            {/* Tuition */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-700 text-lg">
                  {formatTuition()}
                </p>
                <p className="text-xs text-gray-500">{program.tuition.period}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {program.applicationCount !== undefined && (
                <span>{program.applicationCount} applicants</span>
              )}
            </div>
            <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
              <span>Learn More</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </CardContent>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
      </Card>
    </Link>
  )
}

export function EducationCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />

        <CardContent className="p-6">
          {/* Title skeleton */}
          <div className="space-y-3 mb-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>

          {/* Details skeleton */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="pt-4 border-t border-gray-200 flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
