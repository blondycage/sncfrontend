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
import Image from 'next/image'

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
  field: string
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
  requirements: {
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
  viewCount: number
  applicationCount: number
  views: number
  applications: number
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  const formatFieldOfStudy = (field: string) => {
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
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href="/categories/education">
            <Button variant="ghost" className="mb-6 px-4 h-11">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={program.images[currentImageIndex]?.url || '/placeholder.svg'}
              alt={program.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6 md:p-8">
              <div>
                <div className="flex items-center justify-center mb-6">
                  <IconComponent className="h-8 w-8 mr-3" />
                  <Badge className="bg-primary text-white px-4 py-2 text-sm">
                    {levelData.label}
                  </Badge>
                  {program.featured && (
                    <Badge className="bg-amber-500 text-white ml-3 px-4 py-2 text-sm">
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{program.title}</h1>
                <h2 className="text-xl md:text-2xl lg:text-3xl mb-4 font-medium">{program.institution.name}</h2>
                <div className="flex items-center justify-center text-lg md:text-xl">
                  <MapPin className="h-5 w-5 mr-3" />
                  {program.location.city}, Northern Cyprus
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Navigation */}
          {program.images.length > 1 && (
            <div className="flex justify-center mt-6 space-x-3">
              {program.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? 'bg-primary scale-110' : 'bg-muted hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 mb-8">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="requirements" className="text-sm">Requirements</TabsTrigger>
                <TabsTrigger value="curriculum" className="text-sm">Curriculum</TabsTrigger>
                <TabsTrigger value="career" className="text-sm">Career</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <BookOpen className="h-6 w-6 mr-3 text-primary" />
                      Program Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg leading-relaxed mb-6 text-muted-foreground">{program.description}</p>
                    {program.detailedDescription && (
                      <p className="text-base leading-relaxed text-muted-foreground">{program.detailedDescription}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <Building className="h-6 w-6 mr-3 text-primary" />
                      Institution Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <strong className="text-base">Institution:</strong> 
                        <span className="ml-2 text-base">{program.institution.name}</span>
                      </div>
                      {program.institution.website && (
                        <div className="flex items-center">
                          <strong className="mr-3 text-base">Website:</strong>
                          <a
                            href={program.institution.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center text-base"
                          >
                            {program.institution.website}
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </div>
                      )}
                      {program.institution.accreditation && (
                        <div>
                          <strong className="text-base block mb-3">Accreditation:</strong>
                          <div className="flex flex-wrap gap-2">
                            {typeof program.institution.accreditation === 'string' 
                              ? (program.institution.accreditation as string).split(',').map((acc: string, index: number) => (
                                  <Badge key={index} variant="outline" className="px-3 py-1">{acc.trim()}</Badge>
                                ))
                              : Array.isArray(program.institution.accreditation)
                              ? (program.institution.accreditation as string[]).map((acc: string, index: number) => (
                                  <Badge key={index} variant="outline" className="px-3 py-1">{acc}</Badge>
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
                  <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center text-xl">
                        <Users className="h-6 w-6 mr-3 text-primary" />
                        Faculty Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-base leading-relaxed">{program.facultyInfo}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="requirements" className="space-y-8">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="h-6 w-6 mr-3 text-primary" />
                      Admission Requirements
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Requirements for {levelData.label} level programs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {/* Academic Requirements */}
                      {program.requirements.academic && (
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Academic Requirements</h4>
                          <ul className="space-y-3">
                            {program.level.includes('undergraduate') && program.requirements.academic.undergraduate && (
                              <>
                                {program.requirements.academic.undergraduate.waecNeco && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-base">WAEC/NECO certificate required</span>
                                  </li>
                                )}
                                {program.requirements.academic.undergraduate.credits && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-base">Minimum {program.requirements.academic.undergraduate.credits} credits required</span>
                                  </li>
                                )}
                              </>
                            )}
                            {program.level.includes('postgraduate') && program.requirements.academic.postgraduate && (
                              <>
                                {program.requirements.academic.postgraduate.bachelorDegree && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-base">Bachelor's degree required</span>
                                  </li>
                                )}
                                {program.requirements.academic.postgraduate.transcript && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-base">Official transcript required</span>
                                  </li>
                                )}
                                {program.requirements.academic.postgraduate.cv && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-base">CV/Resume required</span>
                                  </li>
                                )}
                                {program.requirements.academic.postgraduate.researchProposal && (
                                  <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-base">Research proposal required</span>
                                  </li>
                                )}
                              </>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Document Requirements */}
                      {program.requirements.documents && (
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Document Requirements</h4>
                          <ul className="space-y-3">
                            {program.requirements.documents.passportIdDatapage && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Passport/ID data page</span>
                              </li>
                            )}
                            {program.requirements.documents.passportPhotograph && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Passport photograph</span>
                              </li>
                            )}
                            {program.requirements.documents.fatherName && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Father's name documentation</span>
                              </li>
                            )}
                            {program.requirements.documents.motherName && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Mother's name documentation</span>
                              </li>
                            )}
                            {program.requirements.documents.highSchoolName && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">High school name documentation</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Language Requirements */}
                      {program.requirements.language && (
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Language Requirements</h4>
                          <ul className="space-y-3">
                            {program.requirements.language.englishProficiency && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">English Proficiency: {program.requirements.language.englishProficiency.toUpperCase()}</span>
                              </li>
                            )}
                            {program.requirements.language.minimumScore && (
                              <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                                <span className="text-base">Minimum Score: {program.requirements.language.minimumScore}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {(!program.requirements.academic && !program.requirements.documents && !program.requirements.language) && (
                        <p className="text-muted-foreground text-base">No specific requirements listed for this program.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {program.applicationDeadlines && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center text-xl">
                        <Calendar className="h-6 w-6 mr-3 text-primary" />
                        Application Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {program.applicationDeadlines.fall && (
                          <div className="text-center p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-primary text-lg">Fall Semester</div>
                            <div className="text-muted-foreground mt-2">{program.applicationDeadlines.fall}</div>
                          </div>
                        )}
                        {program.applicationDeadlines.spring && (
                          <div className="text-center p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-primary text-lg">Spring Semester</div>
                            <div className="text-muted-foreground mt-2">{program.applicationDeadlines.spring}</div>
                          </div>
                        )}
                        {program.applicationDeadlines.summer && (
                          <div className="text-center p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-primary text-lg">Summer Semester</div>
                            <div className="text-muted-foreground mt-2">{program.applicationDeadlines.summer}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-8">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <School className="h-6 w-6 mr-3 text-primary" />
                      Curriculum & Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {program.curriculum && program.curriculum.length > 0 ? (
                      <ul className="space-y-3">
                        {program.curriculum.map((course, index) => (
                          <li key={index} className="flex items-start">
                            <BookOpen className="h-5 w-5 text-primary mr-4 mt-1 flex-shrink-0" />
                            <span className="text-base">{course}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-base leading-relaxed">
                        Detailed curriculum information will be provided during the application process.
                        Contact admissions for more specific course details.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="career" className="space-y-8">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <Award className="h-6 w-6 mr-3 text-primary" />
                      Career Prospects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {program.metadata?.careerProspects && program.metadata.careerProspects.length > 0 ? (
                      <ul className="space-y-3">
                        {program.metadata.careerProspects.map((career, index) => (
                          <li key={index} className="flex items-start">
                            <Star className="h-5 w-5 text-amber-500 mr-4 mt-1 flex-shrink-0" />
                            <span className="text-base">{career}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-base leading-relaxed">
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
          <div className="space-y-8">
            {/* Quick Info */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Program Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-base">
                    <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                    Tuition
                  </span>
                  <span className="font-semibold text-base">{formatTuition(program.tuition)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-base">
                    <Clock className="h-5 w-5 mr-3 text-blue-600" />
                    Duration
                  </span>
                  <span className="font-semibold text-base">{formatDuration(program.duration)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-base">
                    <MapPin className="h-5 w-5 mr-3 text-red-600" />
                    Location
                  </span>
                  <span className="font-semibold text-base">{program.location.city}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-base">
                    <Eye className="h-5 w-5 mr-3 text-purple-600" />
                    Views
                  </span>
                  <span className="font-semibold text-base">{program.viewCount}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-base">
                    <UserPlus className="h-5 w-5 mr-3 text-orange-600" />
                    Applications
                  </span>
                  <span className="font-semibold text-base">{program.applicationCount}</span>
                </div>
                
                {program.tuition.scholarshipAvailable && (
                  <div className="pt-6 border-t">
                    <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-200 py-3 text-base">
                      <Heart className="h-4 w-4 mr-2" />
                      Scholarship Available
                    </Badge>
                    {program.tuition.scholarshipDetails && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {program.tuition.scholarshipDetails}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Card className="shadow-sm">
              <CardContent className="pt-8 pb-6">
                <Link href={`/categories/education/${program._id}/apply`} className="w-full block">
                  <Button size="lg" className="w-full mb-4 h-12 text-base">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Apply Now
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Start your application process for this program
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {program.contactInfo && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Contact Admissions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {program.contactInfo.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-4 text-blue-600" />
                      <a
                        href={`mailto:${program.contactInfo.email}`}
                        className="text-primary hover:underline text-base"
                      >
                        {program.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {program.contactInfo.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-4 text-green-600" />
                      <a
                        href={`tel:${program.contactInfo.phone}`}
                        className="text-primary hover:underline text-base"
                      >
                        {program.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {program.contactInfo.admissionsOfficer && (
                    <div>
                      <h4 className="font-semibold mb-3 text-base">Admissions Officer</h4>
                      <div className="space-y-3">
                        {program.contactInfo.admissionsOfficer.name && (
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-4 text-purple-600" />
                            <span className="text-base">{program.contactInfo.admissionsOfficer.name}</span>
                          </div>
                        )}
                        {program.contactInfo.admissionsOfficer.email && (
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
                        {program.contactInfo.admissionsOfficer.phone && (
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
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Tags</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
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