'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, Calendar, Clock, FileText, User, School, 
  CheckCircle, XCircle, AlertCircle, Download, Eye,
  Mail, Phone, MapPin, GraduationCap, Building, Award,
  Users, Heart, Star, FileCheck, AlertTriangle
} from "lucide-react"
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

interface Application {
  _id: string
  applicationId: string
  applicant: {
    _id: string
    firstName: string
    lastName: string
    email: string
    username: string
  }
  program: {
    _id: string
    title: string
    institution: {
      name: string
    }
    level: string
    location: {
      city: string
    }
    tuition: {
      amount: number
      currency: string
      period: string
    }
  }
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    nationality: string
    passportNumber?: string
    address: {
      street?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }
    emergencyContact: {
      name?: string
      relationship?: string
      phone?: string
      email?: string
    }
  }
  familyInfo: {
    fatherName: string
    motherName: string
    fatherOccupation?: string
    motherOccupation?: string
    familyIncome?: string
  }
  academicBackground: {
    highSchool: {
      name: string
      city?: string
      country?: string
      graduationYear: number
      gpa?: number
      gradeScale?: string
    }
    previousEducation?: Array<{
      institution: string
      degree: string
      field: string
      graduationYear: number
      gpa?: number
    }>
    standardizedTests?: {
      sat?: { score: number; date: string }
      act?: { score: number; date: string }
      toefl?: { score: number; date: string }
      ielts?: { score: number; date: string }
    }
  }
  applicationInfo: {
    intendedStartSemester: string
    intendedStartYear: number
    motivation: string
    careerGoals?: string
    whyThisProgram?: string
    extracurricularActivities?: string
    workExperience?: Array<{
      company: string
      position: string
      startDate: string
      endDate?: string
      description: string
      isCurrent: boolean
    }>
    references?: Array<{
      name: string
      title: string
      organization: string
      email: string
      phone: string
      relationship: string
    }>
  }
  documents: {
    [key: string]: {
      uploaded: boolean
      url?: string
      cloudinaryId?: string
      verified: boolean
    }
  }
  status: 'draft' | 'submitted' | 'under_review' | 'documents_required' | 'approved' | 'conditionally_approved' | 'rejected' | 'withdrawn' | 'enrolled' | 'deferred'
  timeline: Array<{
    status: string
    date: string
    notes?: string
    updatedBy?: string
  }>
  reviewNotes?: Array<{
    reviewer: string
    notes: string
    recommendation: string
    timestamp: string
  }>
  admissionDecision?: {
    decision: string
    conditions?: string[]
    scholarshipOffered: boolean
    scholarshipAmount?: number
    scholarshipType?: string
    decisionDate?: string
    responseDeadline?: string
    decisionLetter?: string
  }
  progress: number
  fullName: string
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  documents_required: { label: 'Documents Required', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  conditionally_approved: { label: 'Conditionally Approved', color: 'bg-emerald-100 text-emerald-800', icon: AlertCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  enrolled: { label: 'Enrolled', color: 'bg-purple-100 text-purple-800', icon: GraduationCap },
  deferred: { label: 'Deferred', color: 'bg-indigo-100 text-indigo-800', icon: Calendar }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplication = async () => {
      if (!params.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/applications/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Application not found')
          }
          if (response.status === 403) {
            throw new Error('You do not have permission to view this application')
          }
          throw new Error('Failed to load application')
        }

        const data = await response.json()
        setApplication(data.data)
      } catch (error) {
        console.error('Error fetching application:', error)
        setError(error instanceof Error ? error.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDocumentCount = (documents: Application['documents']) => {
    const uploaded = Object.values(documents).filter(doc => doc.uploaded).length
    const verified = Object.values(documents).filter(doc => doc.verified).length
    const total = Object.keys(documents).length
    return { uploaded, verified, total }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-6xl">
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
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || 'The application you are looking for does not exist.'}
            </p>
            <Link href="/categories/education">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Programs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[application.status]
  const StatusIcon = statusConfig.icon
  const documentStats = getDocumentCount(application.documents)

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/dashboard/applications">
            <Button variant="ghost" className="mb-4 sm:mb-6 px-3 sm:px-4 h-10 sm:h-11 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
              Back to Applications
            </Button>
          </Link>
          
          {/* Application Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${statusConfig.color} px-3 py-1.5 text-sm font-medium`}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {statusConfig.label}
                  </Badge>
                  <span className="text-white/80 text-sm font-medium">#{application.applicationId}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                  Application for {application.program.title}
                </h1>
                <p className="text-white/90 text-lg mb-4">
                  {application.program.institution.name}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {application.program.location.city}, Northern Cyprus
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Applied {application.submittedAt ? formatDate(application.submittedAt) : 'Draft'}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center sm:items-end gap-3">
                <div className="text-center sm:text-right">
                  <div className="text-2xl font-bold">{application.progress}%</div>
                  <div className="text-white/80 text-sm">Complete</div>
                </div>
                <Progress value={application.progress} className="w-24 h-2 bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-10 sm:h-12 mb-6 sm:mb-8 bg-muted/50">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Overview</TabsTrigger>
                <TabsTrigger value="academic" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Academic</TabsTrigger>
                <TabsTrigger value="documents" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Documents</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 sm:space-y-8">
                {/* Personal Information */}
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-base font-medium">{application.personalInfo.firstName} {application.personalInfo.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-base">{application.personalInfo.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-base">{application.personalInfo.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                        <p className="text-base">{application.personalInfo.nationality}</p>
                      </div>
                      {application.personalInfo.dateOfBirth && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                          <p className="text-base">{formatDate(application.personalInfo.dateOfBirth)}</p>
                        </div>
                      )}
                      {application.personalInfo.passportNumber && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                          <p className="text-base">{application.personalInfo.passportNumber}</p>
                        </div>
                      )}
                    </div>

                    {application.personalInfo.address && (
                      <div className="pt-4 border-t">
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-base">
                          {[
                            application.personalInfo.address.street,
                            application.personalInfo.address.city,
                            application.personalInfo.address.state,
                            application.personalInfo.address.postalCode,
                            application.personalInfo.address.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    {application.personalInfo.emergencyContact?.name && (
                      <div className="pt-4 border-t">
                        <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                        <div className="mt-2">
                          <p className="text-base font-medium">{application.personalInfo.emergencyContact.name}</p>
                          <p className="text-sm text-muted-foreground">{application.personalInfo.emergencyContact.relationship}</p>
                          <p className="text-sm">{application.personalInfo.emergencyContact.phone}</p>
                          {application.personalInfo.emergencyContact.email && (
                            <p className="text-sm">{application.personalInfo.emergencyContact.email}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Family Information */}
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Family Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                        <p className="text-base font-medium">{application.familyInfo.fatherName}</p>
                        {application.familyInfo.fatherOccupation && (
                          <p className="text-sm text-muted-foreground">{application.familyInfo.fatherOccupation}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                        <p className="text-base font-medium">{application.familyInfo.motherName}</p>
                        {application.familyInfo.motherOccupation && (
                          <p className="text-sm text-muted-foreground">{application.familyInfo.motherOccupation}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Information */}
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Application Statement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Intended Start</label>
                      <p className="text-base capitalize">
                        {application.applicationInfo.intendedStartSemester} {application.applicationInfo.intendedStartYear}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Motivation Statement</label>
                      <p className="text-base leading-relaxed mt-2 whitespace-pre-wrap">
                        {application.applicationInfo.motivation}
                      </p>
                    </div>

                    {application.applicationInfo.careerGoals && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Career Goals</label>
                        <p className="text-base leading-relaxed mt-2 whitespace-pre-wrap">
                          {application.applicationInfo.careerGoals}
                        </p>
                      </div>
                    )}

                    {application.applicationInfo.whyThisProgram && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Why This Program</label>
                        <p className="text-base leading-relaxed mt-2 whitespace-pre-wrap">
                          {application.applicationInfo.whyThisProgram}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic" className="space-y-6 sm:space-y-8">
                {/* High School */}
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <School className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      High School Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">School Name</label>
                        <p className="text-base font-medium">{application.academicBackground.highSchool.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                        <p className="text-base">{application.academicBackground.highSchool.graduationYear}</p>
                      </div>
                      {application.academicBackground.highSchool.city && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="text-base">
                            {application.academicBackground.highSchool.city}
                            {application.academicBackground.highSchool.country && 
                              `, ${application.academicBackground.highSchool.country}`
                            }
                          </p>
                        </div>
                      )}
                      {application.academicBackground.highSchool.gpa && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">GPA</label>
                          <p className="text-base">
                            {application.academicBackground.highSchool.gpa}
                            {application.academicBackground.highSchool.gradeScale && 
                              ` (${application.academicBackground.highSchool.gradeScale})`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Previous Education */}
                {application.academicBackground.previousEducation && application.academicBackground.previousEducation.length > 0 && (
                  <Card className="shadow-sm border-0 sm:border">
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                        Previous Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 space-y-4">
                      {application.academicBackground.previousEducation.map((edu, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-medium text-base">{edu.degree} in {edu.field}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-sm">Graduated: {edu.graduationYear}</p>
                          {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Standardized Tests */}
                {application.academicBackground.standardizedTests && (
                  <Card className="shadow-sm border-0 sm:border">
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                        Standardized Test Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {application.academicBackground.standardizedTests.sat && (
                          <div className="p-3 border rounded-lg">
                            <h4 className="font-medium">SAT</h4>
                            <p className="text-sm">Score: {application.academicBackground.standardizedTests.sat.score}</p>
                            <p className="text-sm text-muted-foreground">
                              Date: {formatDate(application.academicBackground.standardizedTests.sat.date)}
                            </p>
                          </div>
                        )}
                        {application.academicBackground.standardizedTests.toefl && (
                          <div className="p-3 border rounded-lg">
                            <h4 className="font-medium">TOEFL</h4>
                            <p className="text-sm">Score: {application.academicBackground.standardizedTests.toefl.score}</p>
                            <p className="text-sm text-muted-foreground">
                              Date: {formatDate(application.academicBackground.standardizedTests.toefl.date)}
                            </p>
                          </div>
                        )}
                        {application.academicBackground.standardizedTests.ielts && (
                          <div className="p-3 border rounded-lg">
                            <h4 className="font-medium">IELTS</h4>
                            <p className="text-sm">Score: {application.academicBackground.standardizedTests.ielts.score}</p>
                            <p className="text-sm text-muted-foreground">
                              Date: {formatDate(application.academicBackground.standardizedTests.ielts.date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 sm:space-y-8">
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Submitted Documents
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {documentStats.uploaded} of {documentStats.total} documents uploaded
                      {documentStats.verified > 0 && ` • ${documentStats.verified} verified`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-3">
                      {Object.entries(application.documents).map(([key, doc]) => (
                        <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              doc.verified ? 'bg-green-500' : 
                              doc.uploaded ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <div>
                              <p className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {doc.verified ? 'Verified' : 
                                 doc.uploaded ? 'Uploaded' : 'Not uploaded'}
                              </p>
                            </div>
                          </div>
                          {doc.uploaded && doc.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6 sm:space-y-8">
                <Card className="shadow-sm border-0 sm:border">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                      Application Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-4">
                      {application.timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-primary rounded-full" />
                            {index < application.timeline.length - 1 && (
                              <div className="w-px h-8 bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize">{event.status.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(event.date)}
                            </p>
                            {event.notes && (
                              <p className="text-sm mt-1">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <Card className="shadow-sm border-0 sm:border">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/categories/education/${application.program._id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Program
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Program Info */}
            <Card className="shadow-sm border-0 sm:border">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Program Details</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Program</label>
                  <p className="text-base font-medium">{application.program.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution</label>
                  <p className="text-base">{application.program.institution.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level</label>
                  <p className="text-base capitalize">{application.program.level.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tuition</label>
                  <p className="text-base">
                    {application.program.tuition.currency === 'USD' ? '$' : application.program.tuition.currency}
                    {application.program.tuition.amount.toLocaleString()}/{application.program.tuition.period}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Admission Decision */}
            {application.admissionDecision && (
              <Card className="shadow-sm border-0 sm:border">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Admission Decision</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 space-y-4">
                  <div>
                    <Badge className={`${
                      application.admissionDecision.decision === 'accepted' ? 'bg-green-100 text-green-800' :
                      application.admissionDecision.decision === 'rejected' ? 'bg-red-100 text-red-800' :
                      application.admissionDecision.decision === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    } px-3 py-1.5 text-sm font-medium capitalize`}>
                      {application.admissionDecision.decision}
                    </Badge>
                  </div>
                  
                  {application.admissionDecision.decisionDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Decision Date</label>
                      <p className="text-base">{formatDate(application.admissionDecision.decisionDate)}</p>
                    </div>
                  )}

                  {application.admissionDecision.scholarshipOffered && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Heart className="h-4 w-4 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Scholarship Offered</span>
                      </div>
                      {application.admissionDecision.scholarshipAmount && (
                        <p className="text-sm text-green-700">
                          Amount: ${application.admissionDecision.scholarshipAmount.toLocaleString()}
                        </p>
                      )}
                      {application.admissionDecision.scholarshipType && (
                        <p className="text-sm text-green-700">
                          Type: {application.admissionDecision.scholarshipType}
                        </p>
                      )}
                    </div>
                  )}

                  {application.admissionDecision.conditions && application.admissionDecision.conditions.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Conditions</label>
                      <ul className="text-sm mt-1 space-y-1">
                        {application.admissionDecision.conditions.map((condition, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}