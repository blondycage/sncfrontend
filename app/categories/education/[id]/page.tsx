'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, Calendar, DollarSign, GraduationCap, BookOpen, Users, Star, 
  Clock, Building, Globe, Phone, Mail, ExternalLink, CheckCircle, 
  FileText, User, School, Award, Languages, Heart, ChevronLeft,
  Eye, UserPlus
} from "lucide-react"
import Link from 'next/link'

interface EducationalProgram {
  _id: string
  title: string
  institution: {
    name: string
    website?: string
    accreditation?: string | string[]
  }
  description: string
  detailedDescription?: string
  level: 'undergraduate' | 'undergraduate_transfer' | 'postgraduate_masters' | 'postgraduate_phd' | 'certificate' | 'diploma' | 'language_course'
  field?: string
  duration: {
    value: number
    unit: 'months' | 'years' | 'semesters'
  }
  tuition: {
    amount: number
    currency: string
    period: string
    scholarshipAvailable?: boolean
    scholarshipDetails?: string
  }
  location: {
    city: string
    campus?: string
    address?: string
  }
  language?: {
    instruction?: string
  }
  admissionRequirements?: {
    academicRequirements?: string[]
    languageRequirements?: string[]
    documentsRequired?: string[]
    additionalRequirements?: string[]
  }
  requirements?: {
    academic?: {
      undergraduate?: {
        waecNeco?: boolean
        credits?: number
      }
      postgraduate?: {
        bachelorDegree?: boolean
        transcript?: boolean
        cv?: boolean
        researchProposal?: boolean
      }
    }
    documents?: {
      passportIdDatapage?: boolean
      passportPhotograph?: boolean
      fatherName?: boolean
      motherName?: boolean
      highSchoolName?: boolean
    }
    language?: {
      englishProficiency?: string
      minimumScore?: string
    }
  }
  applicationDeadlines?: {
    fall?: string
    spring?: string
    summer?: string
  }
  images: Array<{
    url: string
    description?: string
    isPrimary?: boolean
    _id: string
  }>
  featured: boolean
  tags: string[]
  viewCount?: number
  applicationCount?: number
  views?: number
  applications?: number
  features?: string[]
  curriculum?: string[]
  metadata?: {
    careerProspects?: string[]
    accreditationBodies?: string[]
    partnerUniversities?: string[]
    exchangePrograms?: string[]
  }
  facultyInfo?: string
  contactInfo?: {
    admissionsOfficer?: {
      name?: string
      email?: string
      phone?: string
    }
    email?: string
    phone?: string
  }
  admissionContact?: {
    email?: string
    phone?: string
    office?: string
  }
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

const PROGRAM_LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate', icon: GraduationCap },
  { value: 'undergraduate_transfer', label: 'Transfer', icon: BookOpen },
  { value: 'postgraduate_masters', label: 'Masters', icon: Users },
  { value: 'postgraduate_phd', label: 'PhD', icon: Star },
  { value: 'certificate', label: 'Certificate', icon: Building },
  { value: 'diploma', label: 'Diploma', icon: Globe },
  { value: 'language_course', label: 'Language', icon: BookOpen }
]

export default function ProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [program, setProgram] = useState<EducationalProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgram = async () => {
      if (!params.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/programs/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Program not found')
        }

        const data = await response.json()
        setProgram(data.data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load program')
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [params.id])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4 w-64" />
          <div className="h-64 bg-muted rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Program Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'The educational program you are looking for does not exist.'}
          </p>
          <Link href="/categories/education">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatTuition = (tuition: EducationalProgram['tuition']) => {
    return `${tuition.currency === 'USD' ? '$' : tuition.currency}${tuition.amount.toLocaleString()}/${tuition.period}`
  }

  const formatDuration = (duration: EducationalProgram['duration']) => {
    return `${duration.value} ${duration.unit}`
  }

  const formatFieldOfStudy = (field?: string) => {
    if (!field) return 'Various Fields'
    return field.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getLevelData = (level: string) => {
    return PROGRAM_LEVELS.find(l => l.value === level) || PROGRAM_LEVELS[0]
  }

  const levelData = getLevelData(program.level)
  const IconComponent = levelData.icon

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Back Navigation */}
        <div className="mb-6 sm:mb-8">
          <Link href="/categories/education">
            <Button variant="ghost" className="mb-4 sm:mb-6 px-3 sm:px-4 h-10 sm:h-11 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
              Back to Programs
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 sm:mb-12">
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] rounded-lg sm:rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-3 sm:p-6 md:p-8 lg:p-12">
              <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-0">
                  <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mr-0 sm:mr-3 mb-2 sm:mb-0" />
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium">
                    {levelData.label}
                  </Badge>
                  {program.featured && (
                    <Badge className="bg-amber-500/90 backdrop-blur-sm text-white ml-0 sm:ml-2 md:ml-3 mt-1 sm:mt-0 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium">
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight break-words hyphens-auto">
                  {program.title}
                </h1>
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-2 sm:mb-3 md:mb-4 font-medium opacity-90 break-words">
                  {program.institution.name}
                </h2>
                <div className="flex items-center justify-center text-xs sm:text-sm md:text-base lg:text-lg opacity-90">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
                  <span className="text-center break-words">{program.location.city}, Northern Cyprus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-10 sm:h-12 mb-6 sm:mb-8 bg-muted/50">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
                <TabsTrigger value="requirements" className="text-xs sm:text-sm px-2 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Requirements</TabsTrigger>
                <TabsTrigger value="curriculum" className="text-xs sm:text-sm px-2 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Curriculum</TabsTrigger>
                <TabsTrigger value="career" className="text-xs sm:text-sm px-2 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Career</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 sm:space-y-8">
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Program Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 sm:px-6">
                    <p className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 text-muted-foreground">{program.description}</p>
                    {program.detailedDescription && (
                      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">{program.detailedDescription}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Building className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Institution Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 sm:px-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <strong className="text-sm sm:text-base">Institution:</strong> 
                        <span className="ml-2 text-sm sm:text-base">{program.institution.name}</span>
                      </div>
                      {program.institution.website && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <strong className="mr-0 sm:mr-3 text-sm sm:text-base mb-1 sm:mb-0">Website:</strong>
                          <a
                            href={program.institution.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center text-sm sm:text-base break-all"
                          >
                            <span className="truncate">{program.institution.website}</span>
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                      {program.institution?.accreditation && (
                        <div>
                          <strong className="text-sm sm:text-base block mb-2 sm:mb-3">Accreditation:</strong>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {typeof program.institution.accreditation === 'string'
                              ? program.institution.accreditation.split(',').map((acc: string, index: number) => (
                                  <Badge key={index} variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">{acc.trim()}</Badge>
                                ))
                              : Array.isArray(program.institution.accreditation)
                              ? program.institution.accreditation.map((acc: string, index: number) => (
                                  <Badge key={index} variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">{acc}</Badge>
                                ))
                              : null
                            }
                          </div>
                        </div>
                      )}
                      {program.location.campus && (
                        <div>
                          <strong className="text-base">Campus:</strong> 
                          <span className="ml-2 text-base">{program.location.campus}</span>
                        </div>
                      )}
                      {program.location.address && (
                        <div>
                          <strong className="text-base">Address:</strong> 
                          <span className="ml-2 text-base">{program.location.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {program.facultyInfo && (
                  <Card className="shadow-sm border-0 sm:border">
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                        Faculty Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 sm:px-6">
                      <p className="text-sm sm:text-base leading-relaxed">{program.facultyInfo}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6 sm:space-y-8">
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Admission Requirements
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm sm:text-base">
                      Requirements for {levelData.label} level programs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 sm:px-6">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Academic Requirements - New Format */}
                      {program.admissionRequirements?.academicRequirements && program.admissionRequirements.academicRequirements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Academic Requirements</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {program.admissionRequirements.academicRequirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm sm:text-base">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Academic Requirements - Old Format */}
                      {!program.admissionRequirements && program.requirements?.academic && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Academic Requirements</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {program.level.includes('undergraduate') && program.requirements?.academic?.undergraduate && (
                              <>
                                {program.requirements.academic.undergraduate?.waecNeco && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">WAEC/NECO certificate required</span>
                                  </li>
                                )}
                                {program.requirements.academic.undergraduate?.credits && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Minimum {program.requirements.academic.undergraduate.credits} credits required</span>
                                  </li>
                                )}
                              </>
                            )}
                            {program.level.includes('postgraduate') && program.requirements?.academic?.postgraduate && (
                              <>
                                {program.requirements.academic.postgraduate?.bachelorDegree && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Bachelor's degree required</span>
                                  </li>
                                )}
                                {program.requirements.academic.postgraduate?.transcript && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Official transcript required</span>
                                  </li>
                                )}
                                {program.requirements.academic.postgraduate?.cv && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">CV/Resume required</span>
                                  </li>
                                )}
                                {program.requirements.academic.postgraduate?.researchProposal && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Research proposal required</span>
                                  </li>
                                )}
                              </>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Document Requirements - New Format */}
                      {program.admissionRequirements?.documentsRequired && program.admissionRequirements.documentsRequired.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Document Requirements</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {program.admissionRequirements.documentsRequired.map((doc, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm sm:text-base">{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Document Requirements - Old Format */}
                      {!program.admissionRequirements && program.requirements?.documents && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Document Requirements</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {program.requirements.documents?.passportIdDatapage && (
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm sm:text-base">Passport/ID data page</span>
                              </li>
                            )}
                            {program.requirements.documents?.passportPhotograph && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Passport photograph</span>
                              </li>
                            )}
                            {program.requirements.documents?.fatherName && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Father's name documentation</span>
                              </li>
                            )}
                            {program.requirements.documents?.motherName && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Mother's name documentation</span>
                              </li>
                            )}
                            {program.requirements.documents?.highSchoolName && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">High school name documentation</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Language Requirements - New Format */}
                      {program.admissionRequirements?.languageRequirements && program.admissionRequirements.languageRequirements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Language Requirements</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {program.admissionRequirements.languageRequirements.map((lang, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm sm:text-base">{lang}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Language of Instruction */}
                      {program.language?.instruction && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Language of Instruction</h4>
                          <div className="flex items-start">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm sm:text-base">{program.language.instruction}</span>
                          </div>
                        </div>
                      )}

                      {/* Additional Requirements */}
                      {program.admissionRequirements?.additionalRequirements && program.admissionRequirements.additionalRequirements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Additional Requirements</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {program.admissionRequirements.additionalRequirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm sm:text-base">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Language Requirements - Old Format */}
                      {!program.admissionRequirements && program.requirements?.language && (
                        <div>
                          <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Language Requirements</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {program.requirements.language?.englishProficiency && (
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm sm:text-base">English Proficiency: {program.requirements.language.englishProficiency.toUpperCase()}</span>
                              </li>
                            )}
                            {program.requirements.language?.minimumScore && (
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 sm:mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm sm:text-base">Minimum Score: {program.requirements.language.minimumScore}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* No Requirements Message */}
                      {!program.admissionRequirements?.academicRequirements?.length &&
                       !program.admissionRequirements?.documentsRequired?.length &&
                       !program.admissionRequirements?.languageRequirements?.length &&
                       !program.admissionRequirements?.additionalRequirements?.length &&
                       !program.requirements?.academic &&
                       !program.requirements?.documents &&
                       !program.requirements?.language &&
                       !program.language?.instruction && (
                        <p className="text-muted-foreground text-sm sm:text-base">No specific requirements listed for this program. Please contact admissions for detailed requirements.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {program.applicationDeadlines && (
                  <Card className="shadow-sm border-0 sm:border">
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                        Application Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 sm:px-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {program.applicationDeadlines.fall && (
                          <div className="text-center p-4 sm:p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-primary text-sm sm:text-base lg:text-lg">Fall Semester</div>
                            <div className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">{program.applicationDeadlines.fall}</div>
                          </div>
                        )}
                        {program.applicationDeadlines.spring && (
                          <div className="text-center p-4 sm:p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-primary text-sm sm:text-base lg:text-lg">Spring Semester</div>
                            <div className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">{program.applicationDeadlines.spring}</div>
                          </div>
                        )}
                        {program.applicationDeadlines.summer && (
                          <div className="text-center p-4 sm:p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-primary text-sm sm:text-base lg:text-lg">Summer Semester</div>
                            <div className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">{program.applicationDeadlines.summer}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-6 sm:space-y-8">
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <School className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Curriculum & Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 sm:px-6">
                    {program.curriculum && program.curriculum.length > 0 ? (
                      <ul className="space-y-2 sm:space-y-3">
                        {program.curriculum.map((course, index) => (
                          <li key={index} className="flex items-start">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                            <span className="text-sm sm:text-base">{course}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Detailed curriculum information will be provided during the application process.
                        Contact admissions for more specific course details.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="career" className="space-y-6 sm:space-y-8">
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Career Prospects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 sm:px-6">
                    {program.metadata?.careerProspects && program.metadata.careerProspects.length > 0 ? (
                      <ul className="space-y-2 sm:space-y-3">
                        {program.metadata.careerProspects.map((career, index) => (
                          <li key={index} className="flex items-start">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                            <span className="text-sm sm:text-base">{career}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        This program opens up various career opportunities in {formatFieldOfStudy(program.field)}.
                        Contact the admissions office for detailed career guidance and placement information.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Info */}
            <Card className="shadow-sm border-0 sm:border">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Program Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between py-2 border-b border-muted/30">
                  <span className="flex items-center text-sm sm:text-base">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                    Tuition
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-right">{formatTuition(program.tuition)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-muted/30">
                  <span className="flex items-center text-sm sm:text-base">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                    Duration
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-right">{formatDuration(program.duration)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-muted/30">
                  <span className="flex items-center text-sm sm:text-base">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-red-600 flex-shrink-0" />
                    Location
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-right">{program.location.city}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-muted/30">
                  <span className="flex items-center text-sm sm:text-base">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-purple-600 flex-shrink-0" />
                    Views
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-right">{program.viewCount || program.views || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-sm sm:text-base">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-orange-600 flex-shrink-0" />
                    Applications
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-right">{program.applicationCount || program.applications || 0}</span>
                </div>
                
                {program.tuition.scholarshipAvailable && (
                  <div className="pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                    <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-200 py-2 sm:py-3 text-sm sm:text-base">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Scholarship Available
                    </Badge>
                    {program.tuition.scholarshipDetails && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
                        {program.tuition.scholarshipDetails}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Card className="shadow-sm border-0 sm:border">
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                <Link href={`/categories/education/${program._id}/apply`} className="w-full block">
                  <Button size="lg" className="w-full mb-3 sm:mb-4 h-11 sm:h-12 text-sm sm:text-base">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Apply Now
                  </Button>
                </Link>
                <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                  Start your application process for this program
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {program.contactInfo && (
              <Card className="shadow-sm border-0 sm:border">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Contact Admissions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6 space-y-3 sm:space-y-4">
                  {program.contactInfo?.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-3 sm:mr-4 text-blue-600 flex-shrink-0" />
                      <a
                        href={`mailto:${program.contactInfo.email}`}
                        className="text-primary hover:underline text-sm sm:text-base break-all"
                      >
                        {program.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {program.contactInfo?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-3 sm:mr-4 text-green-600 flex-shrink-0" />
                      <a
                        href={`tel:${program.contactInfo.phone}`}
                        className="text-primary hover:underline text-sm sm:text-base"
                      >
                        {program.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {program.contactInfo?.admissionsOfficer && (
                    <div>
                      <h4 className="font-semibold mb-3 text-base">Admissions Officer</h4>
                      <div className="space-y-3">
                        {program.contactInfo.admissionsOfficer?.name && (
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-4 text-purple-600" />
                            <span className="text-base">{program.contactInfo.admissionsOfficer.name}</span>
                          </div>
                        )}
                        {program.contactInfo.admissionsOfficer?.email && (
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 mr-4 text-blue-600" />
                            <a
                              href={`mailto:${program.contactInfo.admissionsOfficer.email}`}
                              className="text-primary hover:underline text-base"
                            >
                              {program.contactInfo.admissionsOfficer.email}
                            </a>
                          </div>
                        )}
                        {program.contactInfo.admissionsOfficer?.phone && (
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 mr-4 text-green-600" />
                            <a
                              href={`tel:${program.contactInfo.admissionsOfficer.phone}`}
                              className="text-primary hover:underline text-base"
                            >
                              {program.contactInfo.admissionsOfficer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {program.tags.length > 0 && (
              <Card className="shadow-sm border-0 sm:border">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Tags</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6">
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
