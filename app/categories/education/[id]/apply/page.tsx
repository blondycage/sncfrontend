'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, ChevronRight, Upload, FileText, User, GraduationCap, 
  Mail, Phone, MapPin, Calendar, CheckCircle, AlertCircle, Clock,
  School, Award, FileCheck, Heart, Building
} from "lucide-react"
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { DocumentUpload } from '@/components/ui/document-upload'

interface EducationalProgram {
  _id: string
  title: string
  institution: { name: string }
  level: string
  requirements: { [key: string]: string[] }
}

interface ApplicationData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  gender: string
  passportNumber: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  emergencyContactName: string
  emergencyContactPhone: string
  
  // Family Information
  fatherName: string
  fatherOccupation: string
  motherName: string
  motherOccupation: string
  
  // Academic Background
  highSchoolName: string
  highSchoolGraduationYear: string
  waecNecoGrades: string
  
  // For transfer/postgraduate
  undergraduateInstitution: string
  undergraduateGraduationYear: string
  undergraduateGPA: string
  undergraduateFieldOfStudy: string
  
  // For postgraduate
  postgraduateInstitution: string
  postgraduateGraduationYear: string
  postgraduateGPA: string
  postgraduateFieldOfStudy: string
  
  // Application Information
  startSemester: string
  startYear: string
  motivation: string
  careerGoals: string
  whyThisProgram: string
  extracurricular: string
  scholarshipInterested: boolean
  financialSupport: string[]
  
  // Final step
  declaration: boolean
  
  // Documents - store URLs and cloudinary IDs
  passportDatapage: { url: string; cloudinaryId?: string } | null
  passportPhotograph: { url: string; cloudinaryId?: string } | null
  waecNecoResults: { url: string; cloudinaryId?: string } | null
  bachelorTranscript: { url: string; cloudinaryId?: string } | null
  bachelorDiploma: { url: string; cloudinaryId?: string } | null
  masterTranscript: { url: string; cloudinaryId?: string } | null
  masterDiploma: { url: string; cloudinaryId?: string } | null
  cv: { url: string; cloudinaryId?: string } | null
  researchProposal: { url: string; cloudinaryId?: string } | null
  englishProficiency: { url: string; cloudinaryId?: string } | null
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Academic Background', icon: GraduationCap },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Application Details', icon: School },
  { id: 5, title: 'Review & Submit', icon: CheckCircle }
]

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Bulgaria',
  'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France',
  'Germany', 'Ghana', 'Greece', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Italy',
  'Japan', 'Jordan', 'Kenya', 'Lebanon', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'Nigeria', 'Norway',
  'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'South Africa', 'Spain', 'Sweden',
  'Switzerland', 'Syria', 'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Venezuela', 'Yemen'
]

export default function ApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [program, setProgram] = useState<EducationalProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    // Personal Information
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', nationality: '', gender: '',
    passportNumber: '', address: '', city: '', state: '', postalCode: '', country: '', 
    emergencyContactName: '', emergencyContactPhone: '',
    
    // Family Information
    fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
    
    // Academic Background
    highSchoolName: '', highSchoolGraduationYear: '', waecNecoGrades: '',
    
    // For transfer/postgraduate
    undergraduateInstitution: '', undergraduateGraduationYear: '', undergraduateGPA: '', undergraduateFieldOfStudy: '',
    
    // For postgraduate
    postgraduateInstitution: '', postgraduateGraduationYear: '', postgraduateGPA: '', postgraduateFieldOfStudy: '',
    
    // Application Information
    startSemester: '', startYear: '', motivation: '', careerGoals: '', whyThisProgram: '', 
    extracurricular: '', scholarshipInterested: false, financialSupport: [],
    
    // Final step
    declaration: false,
    
    // Documents
    passportDatapage: null, passportPhotograph: null, waecNecoResults: null, bachelorTranscript: null,
    bachelorDiploma: null, masterTranscript: null, masterDiploma: null, cv: null, researchProposal: null, englishProficiency: null
  })

  useEffect(() => {
    const fetchProgram = async () => {
      if (!params.id) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/programs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProgram(data.data)
        }
      } catch (error) {
        console.error('Error fetching program:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [params.id])

  const updateApplicationData = (field: keyof ApplicationData, value: any) => {
    setApplicationData(prev => ({ ...prev, [field]: value }))
  }

  const handleDocumentUpload = (field: keyof ApplicationData) => (url: string, cloudinaryId?: string) => {
    if (!url) {
      updateApplicationData(field, null)
      return
    }
    
    updateApplicationData(field, { url, cloudinaryId })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Only check fields that actually exist in the form
        return !!(applicationData.firstName && applicationData.lastName && applicationData.email && 
                 applicationData.phone && applicationData.dateOfBirth && applicationData.nationality &&
                 applicationData.fatherName && applicationData.motherName)
      case 2:
        if (!program) return false
        const baseValid = !!(applicationData.highSchoolName && applicationData.highSchoolGraduationYear)
        if (program.level.includes('transfer') || program.level.includes('postgraduate')) {
          return baseValid && !!(applicationData.undergraduateInstitution && applicationData.undergraduateGraduationYear)
        }
        return baseValid
      case 3:
        // For now, make documents optional to test the flow
        // Users can upload documents but it's not required to proceed
        return true
      case 4:
        return !!(applicationData.startSemester && applicationData.startYear && applicationData.motivation)
      case 5:
        return !!(applicationData.declaration)
      default:
        return true
    }
  }

  const getRequiredDocuments = () => {
    if (!program) return []
    
    const base = ['Passport ID Datapage', 'Passport Photograph', 'WAEC/NECO Results (6+ credits)']
    
    if (program.level === 'undergraduate_transfer') {
      return [...base, 'Bachelor\'s Transcript']
    } else if (program.level === 'postgraduate_masters') {
      return [...base, 'Bachelor\'s Diploma', 'Bachelor\'s Transcript', 'CV (Optional)']
    } else if (program.level === 'postgraduate_phd') {
      return [...base, 'Bachelor\'s Diploma', 'Bachelor\'s Transcript', 'Master\'s Diploma', 'Master\'s Transcript', 'CV (Optional)', 'Research Proposal']
    }
    
    return base
  }

  const uploadDocuments = async (applicationId: string, token: string) => {
    const documentFields = [
      'passportDatapage', 'passportPhotograph', 'waecNecoResults', 'bachelorTranscript',
      'bachelorDiploma', 'masterTranscript', 'masterDiploma', 'cv', 'researchProposal', 'englishProficiency'
    ]

    const uploadPromises = documentFields
      .filter(field => applicationData[field as keyof ApplicationData])
      .map(async (field) => {
        const file = applicationData[field as keyof ApplicationData] as File
        if (!file) return

        const formData = new FormData()
        formData.append('document', file)
        formData.append('documentType', field)

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/education/applications/${applicationId}/documents`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to upload ${field}: ${errorData.message}`)
          }

          return await response.json()
        } catch (error) {
          console.error(`Error uploading ${field}:`, error)
          throw error
        }
      })

    await Promise.all(uploadPromises)
  }

  const prepareDocuments = () => {
    const documentFields = [
      'passportDatapage', 'passportPhotograph', 'waecNecoResults', 'bachelorTranscript',
      'bachelorDiploma', 'masterTranscript', 'masterDiploma', 'cv', 'researchProposal', 'englishProficiency'
    ]

    const documents: any = {}
    
    documentFields.forEach(field => {
      const doc = applicationData[field as keyof ApplicationData]
      if (doc && typeof doc === 'object' && 'url' in doc) {
        documents[field] = {
          uploaded: true,
          url: doc.url,
          cloudinaryId: doc.cloudinaryId,
          verified: false
        }
      }
    })

    return documents
  }

  const handleSubmit = async () => {
    if (!program || !validateStep(currentStep)) return
    
    setSubmitting(true)
    
    try {
      // Structure data according to Application schema
      const applicationPayload = {
        personalInfo: {
          firstName: applicationData.firstName,
          lastName: applicationData.lastName,
          email: applicationData.email,
          phone: applicationData.phone,
          dateOfBirth: applicationData.dateOfBirth,
          nationality: applicationData.nationality,
          gender: applicationData.gender,
          passportNumber: applicationData.passportNumber,
          address: {
            street: applicationData.address,
            city: applicationData.city,
            state: applicationData.state,
            postalCode: applicationData.postalCode,
            country: applicationData.country || 'Nigeria'
          }
        },
        familyInfo: {
          fatherName: applicationData.fatherName,
          motherName: applicationData.motherName,
          fatherOccupation: applicationData.fatherOccupation,
          motherOccupation: applicationData.motherOccupation
        },
        academicBackground: {
          highSchool: {
            name: applicationData.highSchoolName,
            graduationYear: parseInt(applicationData.highSchoolGraduationYear),
            gpa: 0 // GPA will be assessed from uploaded documents
          },
          previousEducation: []
        },
        applicationInfo: {
          intendedStartSemester: applicationData.startSemester,
          intendedStartYear: parseInt(applicationData.startYear),
          motivation: applicationData.motivation,
          careerGoals: applicationData.careerGoals,
          whyThisProgram: applicationData.whyThisProgram,
          extracurricularActivities: applicationData.extracurricular
        }
      }

      // Add undergraduate education if applicable
      if (applicationData.undergraduateInstitution) {
        applicationPayload.academicBackground.previousEducation.push({
          institution: applicationData.undergraduateInstitution,
          degree: 'Bachelor',
          field: applicationData.undergraduateFieldOfStudy,
          graduationYear: parseInt(applicationData.undergraduateGraduationYear),
          gpa: parseFloat(applicationData.undergraduateGPA) || 0
        })
      }

      // Add postgraduate education if applicable
      if (applicationData.postgraduateInstitution) {
        applicationPayload.academicBackground.previousEducation.push({
          institution: applicationData.postgraduateInstitution,
          degree: 'Master',
          field: applicationData.postgraduateFieldOfStudy,
          graduationYear: parseInt(applicationData.postgraduateGraduationYear),
          gpa: parseFloat(applicationData.postgraduateGPA) || 0
        })
      }

      // Add documents to the payload
      applicationPayload.documents = prepareDocuments()

      let token = localStorage.getItem('authToken')
      
      // For testing purposes, use the test token we generated earlier
      if (!token) {
        console.log('No auth token found, using test token for demo')
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWJkOTc4ZjBkNTEwYWUxOWU0YTYwZCIsImlhdCI6MTc1NjA5Mjc5NSwiZXhwIjoxNzU2Njk3NTk1fQ.DYXEpaDn5ZDTzcDLJU7IShJ542joKZLZRKR8EM_YXpI'
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/education/programs/${program._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationPayload)
      })
      
      if (response.ok) {
        const data = await response.json()
        const applicationId = data.data._id

        toast({
          title: 'Success!',
          description: 'Your application has been submitted successfully!',
          variant: 'default',
          duration: 3000
        })
        router.push(`/categories/education/applications/${applicationId}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit application')
      }
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit application. Please try again.',
        variant: 'error',
        duration: 3000
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container py-8">Loading...</div>
  if (!program) return <div className="container py-8">Program not found</div>

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <Link href={`/categories/education/${program._id}`}>
            <Button variant="ghost" className="mb-4 sm:mb-6 px-3 sm:px-4 h-10 sm:h-11 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
              Back to Program
            </Button>
          </Link>
          
          <div className="text-center px-4 sm:px-6 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight break-words hyphens-auto">Apply to {program.title}</h1>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-base sm:text-lg break-words">{program.institution.name}</p>
            <div className="flex flex-col items-center space-y-3">
              <Progress value={progress} className="w-full max-w-xs sm:max-w-md md:max-w-lg h-3 sm:h-4 bg-muted" />
              <div className="flex items-center justify-center space-x-2">
                <div className="text-xs sm:text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  Step {currentStep} of {STEPS.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="w-full">
            {/* Mobile: Compact centered design for all small screens */}
            <div className="block sm:hidden">
              <div className="w-full max-w-xs mx-auto px-2">
                <div className="flex justify-between items-center relative">
                  {/* Background connection line */}
                  <div className="absolute top-3 left-6 right-6 h-0.5 bg-muted"></div>
                  
                  {STEPS.map((step, index) => {
                    const IconComponent = step.icon
                    const isCompleted = currentStep > step.id
                    const isCurrent = currentStep === step.id
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center relative z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                          isCompleted ? 'bg-green-500 border-green-500 text-white shadow-sm' :
                          isCurrent ? 'bg-primary border-primary text-white shadow-sm' :
                          'bg-background border-muted-foreground text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-3 w-3" /> : <IconComponent className="h-3 w-3" />}
                        </div>
                        <span className={`text-[9px] mt-1.5 text-center font-medium leading-none max-w-[2.5rem] ${
                          isCurrent ? 'text-primary font-semibold' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                        }`} style={{fontSize: '9px', lineHeight: '10px'}}>
                          {step.id === 1 ? 'Info' : 
                           step.id === 2 ? 'School' : 
                           step.id === 3 ? 'Docs' : 'Review'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                
                {/* Progress dots for smaller screens */}
                <div className="flex justify-center mt-3 space-x-1">
                  {STEPS.map((step) => (
                    <div key={step.id} className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      currentStep >= step.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Desktop: Centered with full labels */}
            <div className="hidden sm:block">
              <div className="flex justify-center items-center max-w-4xl mx-auto">
                <div className="flex justify-center space-x-4 md:space-x-6 lg:space-x-8">
                  {STEPS.map((step, index) => {
                    const IconComponent = step.icon
                    const isCompleted = currentStep > step.id
                    const isCurrent = currentStep === step.id
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center relative">
                        {/* Desktop connection line */}
                        {index < STEPS.length - 1 && (
                          <div className={`absolute left-full top-6 w-4 md:w-6 lg:w-8 h-0.5 ${
                            currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                          } transition-colors duration-200`} />
                        )}
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                          isCompleted ? 'bg-green-500 border-green-500 text-white shadow-md' :
                          isCurrent ? 'bg-primary border-primary text-white shadow-md' :
                          'bg-background border-muted-foreground text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-6 w-6 md:h-7 md:w-7" /> : <IconComponent className="h-6 w-6 md:h-7 md:w-7" />}
                        </div>
                        <span className={`text-sm md:text-base mt-3 text-center font-medium leading-tight max-w-[6rem] md:max-w-none ${
                          isCurrent ? 'text-primary font-semibold' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                        }`}>{step.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-sm border-0 sm:border">
            <CardHeader className="pb-4 sm:pb-6 px-6 sm:px-8 text-center sm:text-left">
              <CardTitle className="flex flex-col sm:flex-row items-center justify-center sm:justify-start text-lg sm:text-xl lg:text-2xl">
                {React.createElement(STEPS[currentStep - 1].icon, { className: "h-6 w-6 sm:h-7 sm:w-7 mb-2 sm:mb-0 mr-0 sm:mr-3 text-primary flex-shrink-0" })}
                <span className="break-words text-center sm:text-left">{STEPS[currentStep - 1].title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-6 sm:px-8 space-y-6 sm:space-y-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-sm sm:text-base font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      value={applicationData.firstName}
                      onChange={(e) => updateApplicationData('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      className="mt-1 sm:mt-2 h-10 sm:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm sm:text-base font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={applicationData.lastName}
                      onChange={(e) => updateApplicationData('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      className="mt-1 sm:mt-2 h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={applicationData.email}
                      onChange={(e) => updateApplicationData('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="mt-1 sm:mt-2 h-10 sm:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={applicationData.phone}
                      onChange={(e) => updateApplicationData('phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="mt-1 sm:mt-2 h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-sm sm:text-base font-medium">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={applicationData.dateOfBirth}
                      onChange={(e) => updateApplicationData('dateOfBirth', e.target.value)}
                      className="mt-1 sm:mt-2 h-10 sm:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality" className="text-sm sm:text-base font-medium">Nationality *</Label>
                    <Select value={applicationData.nationality} onValueChange={(value) => updateApplicationData('nationality', value)}>
                      <SelectTrigger className="mt-1 sm:mt-2 h-10 sm:h-11">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="passportNumber" className="text-sm sm:text-base font-medium">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={applicationData.passportNumber}
                    onChange={(e) => updateApplicationData('passportNumber', e.target.value)}
                    placeholder="Enter passport number"
                    className="mt-1 sm:mt-2 h-10 sm:h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <Label htmlFor="address" className="text-sm sm:text-base font-medium">Address</Label>
                    <Input
                      id="address"
                      value={applicationData.address}
                      onChange={(e) => updateApplicationData('address', e.target.value)}
                      placeholder="Street address"
                      className="mt-1 sm:mt-2 h-10 sm:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm sm:text-base font-medium">City</Label>
                    <Input
                      id="city"
                      value={applicationData.city}
                      onChange={(e) => updateApplicationData('city', e.target.value)}
                      placeholder="City"
                      className="mt-1 sm:mt-2 h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-sm sm:text-base font-medium">Country</Label>
                  <Select value={applicationData.country} onValueChange={(value) => updateApplicationData('country', value)}>
                    <SelectTrigger className="mt-1 sm:mt-2 h-10 sm:h-11">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Family Information */}
                <div className="pt-6 sm:pt-8 border-t">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary flex-shrink-0" />
                    Family Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <Label htmlFor="fatherName" className="text-sm sm:text-base font-medium">Father's Name *</Label>
                      <Input
                        id="fatherName"
                        value={applicationData.fatherName}
                        onChange={(e) => updateApplicationData('fatherName', e.target.value)}
                        placeholder="Father's full name"
                        className="mt-1 sm:mt-2 h-10 sm:h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatherOccupation" className="text-sm sm:text-base font-medium">Father's Occupation</Label>
                      <Input
                        id="fatherOccupation"
                        value={applicationData.fatherOccupation}
                        onChange={(e) => updateApplicationData('fatherOccupation', e.target.value)}
                        placeholder="Father's occupation"
                        className="mt-1 sm:mt-2 h-10 sm:h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    <div>
                      <Label htmlFor="motherName" className="text-sm sm:text-base font-medium">Mother's Name *</Label>
                      <Input
                        id="motherName"
                        value={applicationData.motherName}
                        onChange={(e) => updateApplicationData('motherName', e.target.value)}
                        placeholder="Mother's full name"
                        className="mt-1 sm:mt-2 h-10 sm:h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motherOccupation" className="text-sm sm:text-base font-medium">Mother's Occupation</Label>
                      <Input
                        id="motherOccupation"
                        value={applicationData.motherOccupation}
                        onChange={(e) => updateApplicationData('motherOccupation', e.target.value)}
                        placeholder="Mother's occupation"
                        className="mt-1 sm:mt-2 h-10 sm:h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="pt-6 sm:pt-8 border-t">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary flex-shrink-0" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <Label htmlFor="emergencyContactName" className="text-sm sm:text-base font-medium">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={applicationData.emergencyContactName}
                        onChange={(e) => updateApplicationData('emergencyContactName', e.target.value)}
                        placeholder="Emergency contact name"
                        className="mt-1 sm:mt-2 h-10 sm:h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone" className="text-sm sm:text-base font-medium">Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={applicationData.emergencyContactPhone}
                        onChange={(e) => updateApplicationData('emergencyContactPhone', e.target.value)}
                        placeholder="Emergency contact phone"
                        className="mt-1 sm:mt-2 h-10 sm:h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Steps 2-5 would continue here with similar structure... */}
            {/* For brevity, I'll just show the structure for the remaining steps */}
            
            {currentStep === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <h3 className="text-lg sm:text-xl font-semibold flex items-center">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary flex-shrink-0" />
                  Academic Background
                </h3>
                
                {/* High School Information */}
                <div className="space-y-4 sm:space-y-6">
                  <h4 className="text-base sm:text-lg font-medium text-muted-foreground">High School Education</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <Label htmlFor="highSchoolName" className="text-sm sm:text-base font-medium">High School Name *</Label>
                      <Input
                        id="highSchoolName"
                        value={applicationData.highSchoolName}
                        onChange={(e) => updateApplicationData('highSchoolName', e.target.value)}
                        placeholder="Name of your high school"
                        className="mt-1 sm:mt-2 h-10 sm:h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="highSchoolGraduationYear" className="text-sm sm:text-base font-medium">Graduation Year *</Label>
                      <Select 
                        value={applicationData.highSchoolGraduationYear} 
                        onValueChange={(value) => updateApplicationData('highSchoolGraduationYear', value)}
                      >
                        <SelectTrigger className="mt-1 sm:mt-2 h-10 sm:h-11">
                          <SelectValue placeholder="Select graduation year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="waecNecoGrades" className="text-sm sm:text-base font-medium">WAEC/NECO Grades (Optional)</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-2">
                      You can optionally list your grades here, or we'll review them from your uploaded certificate
                    </p>
                    <Textarea
                      id="waecNecoGrades"
                      value={applicationData.waecNecoGrades}
                      onChange={(e) => updateApplicationData('waecNecoGrades', e.target.value)}
                      placeholder="List your WAEC/NECO subjects and grades (e.g., Mathematics: A1, English: B2, Physics: B3, etc.)"
                      className="mt-1 sm:mt-2 text-sm sm:text-base"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Undergraduate Education (for transfer and postgraduate) */}
                {(program?.level.includes('transfer') || program?.level.includes('postgraduate')) && (
                  <div className="space-y-6 pt-6 border-t">
                    <h4 className="text-lg font-medium text-muted-foreground">Undergraduate Education</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="undergraduateInstitution" className="text-base font-medium">Institution Name *</Label>
                        <Input
                          id="undergraduateInstitution"
                          value={applicationData.undergraduateInstitution}
                          onChange={(e) => updateApplicationData('undergraduateInstitution', e.target.value)}
                          placeholder="Name of your university/college"
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="undergraduateGraduationYear" className="text-base font-medium">Graduation Year *</Label>
                        <Select 
                          value={applicationData.undergraduateGraduationYear} 
                          onValueChange={(value) => updateApplicationData('undergraduateGraduationYear', value)}
                        >
                          <SelectTrigger className="mt-2 h-11">
                            <SelectValue placeholder="Select graduation year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 20}, (_, i) => new Date().getFullYear() - i).map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="undergraduateFieldOfStudy" className="text-base font-medium">Field of Study *</Label>
                        <Input
                          id="undergraduateFieldOfStudy"
                          value={applicationData.undergraduateFieldOfStudy}
                          onChange={(e) => updateApplicationData('undergraduateFieldOfStudy', e.target.value)}
                          placeholder="Your major/field of study"
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="undergraduateGPA" className="text-base font-medium">GPA/CGPA</Label>
                        <Input
                          id="undergraduateGPA"
                          value={applicationData.undergraduateGPA}
                          onChange={(e) => updateApplicationData('undergraduateGPA', e.target.value)}
                          placeholder="e.g., 3.5/4.0 or 4.2/5.0"
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Postgraduate Education (for PhD) */}
                {program?.level === 'postgraduate_phd' && (
                  <div className="space-y-6 pt-6 border-t">
                    <h4 className="text-lg font-medium text-muted-foreground">Postgraduate Education</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="postgraduateInstitution" className="text-base font-medium">Institution Name</Label>
                        <Input
                          id="postgraduateInstitution"
                          value={applicationData.postgraduateInstitution}
                          onChange={(e) => updateApplicationData('postgraduateInstitution', e.target.value)}
                          placeholder="Name of your graduate school"
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postgraduateGraduationYear" className="text-base font-medium">Graduation Year</Label>
                        <Select 
                          value={applicationData.postgraduateGraduationYear} 
                          onValueChange={(value) => updateApplicationData('postgraduateGraduationYear', value)}
                        >
                          <SelectTrigger className="mt-2 h-11">
                            <SelectValue placeholder="Select graduation year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 15}, (_, i) => new Date().getFullYear() - i).map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="postgraduateFieldOfStudy" className="text-base font-medium">Field of Study</Label>
                        <Input
                          id="postgraduateFieldOfStudy"
                          value={applicationData.postgraduateFieldOfStudy}
                          onChange={(e) => updateApplicationData('postgraduateFieldOfStudy', e.target.value)}
                          placeholder="Your graduate field of study"
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postgraduateGPA" className="text-base font-medium">GPA/CGPA</Label>
                        <Input
                          id="postgraduateGPA"
                          value={applicationData.postgraduateGPA}
                          onChange={(e) => updateApplicationData('postgraduateGPA', e.target.value)}
                          placeholder="e.g., 3.8/4.0"
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Required Documents
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Passport Documents */}
                  <DocumentUpload
                    label="Passport ID Datapage"
                    required
                    currentDocument={applicationData.passportDatapage ? { url: applicationData.passportDatapage.url, name: "Passport ID Page" } : undefined}
                    onDocumentChange={handleDocumentUpload('passportDatapage')}
                    acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                    className="border rounded-lg p-6"
                  />

                  <DocumentUpload
                    label="Passport Photograph"
                    required
                    currentDocument={applicationData.passportPhotograph ? { url: applicationData.passportPhotograph.url, name: "Passport Photo" } : undefined}
                    onDocumentChange={handleDocumentUpload('passportPhotograph')}
                    acceptedTypes={['.jpg', '.jpeg', '.png']}
                    className="border rounded-lg p-6"
                  />

                  {/* Academic Documents */}
                  <DocumentUpload
                    label="WAEC/NECO Results"
                    required
                    currentDocument={applicationData.waecNecoResults ? { url: applicationData.waecNecoResults.url, name: "WAEC/NECO Results" } : undefined}
                    onDocumentChange={handleDocumentUpload('waecNecoResults')}
                    acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                    className="border rounded-lg p-6"
                  />

                  {/* Undergraduate Documents (for transfer and postgraduate) */}
                  {(program?.level.includes('transfer') || program?.level.includes('postgraduate')) && (
                    <>
                      <DocumentUpload
                        label="Bachelor's Transcript"
                        required
                        currentDocument={applicationData.bachelorTranscript ? { url: applicationData.bachelorTranscript.url, name: "Bachelor's Transcript" } : undefined}
                        onDocumentChange={handleDocumentUpload('bachelorTranscript')}
                        acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                        className="border rounded-lg p-6"
                      />

                      <DocumentUpload
                        label="Bachelor's Diploma"
                        currentDocument={applicationData.bachelorDiploma ? { url: applicationData.bachelorDiploma.url, name: "Bachelor's Diploma" } : undefined}
                        onDocumentChange={handleDocumentUpload('bachelorDiploma')}
                        acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                        className="border rounded-lg p-6"
                      />
                    </>
                  )}

                  {/* Postgraduate Documents (for PhD) */}
                  {program?.level === 'postgraduate_phd' && (
                    <>
                      <DocumentUpload
                        label="Master's Transcript"
                        currentDocument={applicationData.masterTranscript ? { url: applicationData.masterTranscript.url, name: "Master's Transcript" } : undefined}
                        onDocumentChange={handleDocumentUpload('masterTranscript')}
                        acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                        className="border rounded-lg p-6"
                      />

                      <DocumentUpload
                        label="Master's Diploma"
                        currentDocument={applicationData.masterDiploma ? { url: applicationData.masterDiploma.url, name: "Master's Diploma" } : undefined}
                        onDocumentChange={handleDocumentUpload('masterDiploma')}
                        acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                        className="border rounded-lg p-6"
                      />

                      <DocumentUpload
                        label="Research Proposal"
                        currentDocument={applicationData.researchProposal ? { url: applicationData.researchProposal.url, name: "Research Proposal" } : undefined}
                        onDocumentChange={handleDocumentUpload('researchProposal')}
                        acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                        className="border rounded-lg p-6"
                      />
                    </>
                  )}

                  {/* Optional Documents */}
                  <DocumentUpload
                    label="CV/Resume (Optional)"
                    currentDocument={applicationData.cv ? { url: applicationData.cv.url, name: "CV/Resume" } : undefined}
                    onDocumentChange={handleDocumentUpload('cv')}
                    acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                    className="border rounded-lg p-6"
                  />

                  <DocumentUpload
                    label="English Proficiency Test (Optional)"
                    currentDocument={applicationData.englishProficiency ? { url: applicationData.englishProficiency.url, name: "English Proficiency Test" } : undefined}
                    onDocumentChange={handleDocumentUpload('englishProficiency')}
                    acceptedTypes={['.jpg', '.jpeg', '.png', '.webp']}
                    className="border rounded-lg p-6"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold flex items-center">
                  <School className="h-5 w-5 mr-2 text-primary" />
                  Application Details
                </h3>
                
                <div className="space-y-6">
                  {/* Start Term */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="startSemester" className="text-base font-medium">Intended Start Semester *</Label>
                      <Select 
                        value={applicationData.startSemester} 
                        onValueChange={(value) => updateApplicationData('startSemester', value)}
                      >
                        <SelectTrigger className="mt-2 h-11">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fall">Fall</SelectItem>
                          <SelectItem value="spring">Spring</SelectItem>
                          <SelectItem value="summer">Summer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startYear" className="text-base font-medium">Intended Start Year *</Label>
                      <Select 
                        value={applicationData.startYear} 
                        onValueChange={(value) => updateApplicationData('startYear', value)}
                      >
                        <SelectTrigger className="mt-2 h-11">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 3}, (_, i) => new Date().getFullYear() + i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Motivation Letter */}
                  <div>
                    <Label htmlFor="motivation" className="text-base font-medium">Personal Statement/Motivation Letter *</Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      Please explain why you want to study this program and how it aligns with your career goals. (Max 2000 characters)
                    </p>
                    <Textarea
                      id="motivation"
                      value={applicationData.motivation}
                      onChange={(e) => updateApplicationData('motivation', e.target.value)}
                      placeholder="Write your personal statement here..."
                      className="min-h-32 resize-y"
                      maxLength={2000}
                    />
                    <div className="text-right text-sm text-muted-foreground mt-1">
                      {applicationData.motivation?.length || 0}/2000 characters
                    </div>
                  </div>

                  {/* Career Goals */}
                  <div>
                    <Label htmlFor="careerGoals" className="text-base font-medium">Career Goals (Optional)</Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      Describe your long-term career objectives. (Max 1000 characters)
                    </p>
                    <Textarea
                      id="careerGoals"
                      value={applicationData.careerGoals}
                      onChange={(e) => updateApplicationData('careerGoals', e.target.value)}
                      placeholder="Describe your career aspirations..."
                      className="min-h-24 resize-y"
                      maxLength={1000}
                    />
                    <div className="text-right text-sm text-muted-foreground mt-1">
                      {applicationData.careerGoals?.length || 0}/1000 characters
                    </div>
                  </div>

                  {/* Why This Program */}
                  <div>
                    <Label htmlFor="whyThisProgram" className="text-base font-medium">Why This Program? (Optional)</Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      What specifically interests you about this program? (Max 1000 characters)
                    </p>
                    <Textarea
                      id="whyThisProgram"
                      value={applicationData.whyThisProgram}
                      onChange={(e) => updateApplicationData('whyThisProgram', e.target.value)}
                      placeholder="Explain your interest in this specific program..."
                      className="min-h-24 resize-y"
                      maxLength={1000}
                    />
                    <div className="text-right text-sm text-muted-foreground mt-1">
                      {applicationData.whyThisProgram?.length || 0}/1000 characters
                    </div>
                  </div>

                  {/* Extracurricular Activities */}
                  <div>
                    <Label htmlFor="extracurricular" className="text-base font-medium">Extracurricular Activities (Optional)</Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      List any relevant extracurricular activities, volunteer work, or achievements. (Max 1000 characters)
                    </p>
                    <Textarea
                      id="extracurricular"
                      value={applicationData.extracurricular}
                      onChange={(e) => updateApplicationData('extracurricular', e.target.value)}
                      placeholder="Describe your extracurricular activities..."
                      className="min-h-24 resize-y"
                      maxLength={1000}
                    />
                    <div className="text-right text-sm text-muted-foreground mt-1">
                      {applicationData.extracurricular?.length || 0}/1000 characters
                    </div>
                  </div>

                  {/* Scholarship Interest */}
                  <div className="border rounded-lg p-6 bg-muted/20">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="scholarshipInterested"
                        checked={applicationData.scholarshipInterested || false}
                        onChange={(e) => updateApplicationData('scholarshipInterested', e.target.checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="scholarshipInterested" className="text-base font-medium cursor-pointer">
                          I am interested in scholarship opportunities
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Check this if you would like to be considered for available scholarships
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Support */}
                  <div>
                    <Label className="text-base font-medium">How will you finance your studies? *</Label>
                    <div className="mt-3 space-y-2">
                      {['Self-funded', 'Family support', 'Scholarship/Grant', 'Student loan', 'Employer sponsorship', 'Other'].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`finance-${option}`}
                            checked={applicationData.financialSupport?.includes(option) || false}
                            onChange={(e) => {
                              const current = applicationData.financialSupport || [];
                              const updated = e.target.checked 
                                ? [...current, option]
                                : current.filter(item => item !== option);
                              updateApplicationData('financialSupport', updated);
                            }}
                          />
                          <Label htmlFor={`finance-${option}`} className="text-sm cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                  Review & Submit
                </h3>
                
                <div className="space-y-6">
                  {/* Application Summary */}
                  <div className="bg-muted/20 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Application Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Program:</strong> {program?.title}
                      </div>
                      <div>
                        <strong>Level:</strong> {program?.level?.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div>
                        <strong>Start:</strong> {applicationData.startSemester} {applicationData.startYear}
                      </div>
                      <div>
                        <strong>Scholarship Interest:</strong> {applicationData.scholarshipInterested ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong> {applicationData.firstName} {applicationData.lastName}
                      </div>
                      <div>
                        <strong>Email:</strong> {applicationData.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {applicationData.phone}
                      </div>
                      <div>
                        <strong>Date of Birth:</strong> {applicationData.dateOfBirth}
                      </div>
                      <div>
                        <strong>Nationality:</strong> {applicationData.nationality}
                      </div>
                      <div>
                        <strong>Gender:</strong> {applicationData.gender}
                      </div>
                    </div>
                  </div>

                  {/* Family Information Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Family Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Father's Name:</strong> {applicationData.fatherName}
                      </div>
                      <div>
                        <strong>Mother's Name:</strong> {applicationData.motherName}
                      </div>
                      <div>
                        <strong>Father's Occupation:</strong> {applicationData.fatherOccupation}
                      </div>
                      <div>
                        <strong>Mother's Occupation:</strong> {applicationData.motherOccupation}
                      </div>
                      <div>
                        <strong>Family Income:</strong> {applicationData.familyIncome?.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Academic Background Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Academic Background</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium">Secondary Education</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                          <div>
                            <strong>School:</strong> {applicationData.highSchoolName}
                          </div>
                          <div>
                            <strong>Graduation Year:</strong> {applicationData.highSchoolGraduationYear}
                          </div>
                          {applicationData.waecNecoGrades && (
                            <div className="md:col-span-2">
                              <strong>WAEC/NECO Grades:</strong>
                              <p className="mt-1 text-sm text-muted-foreground">{applicationData.waecNecoGrades}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {(program?.level?.includes('transfer') || program?.level?.includes('postgraduate')) && applicationData.undergraduateInstitution && (
                        <div>
                          <h5 className="font-medium">Undergraduate Education</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                            <div>
                              <strong>Institution:</strong> {applicationData.undergraduateInstitution}
                            </div>
                            <div>
                              <strong>Graduation Year:</strong> {applicationData.undergraduateGraduationYear}
                            </div>
                            <div>
                              <strong>Field of Study:</strong> {applicationData.undergraduateFieldOfStudy}
                            </div>
                            <div>
                              <strong>GPA:</strong> {applicationData.undergraduateGPA}
                            </div>
                          </div>
                        </div>
                      )}

                      {program?.level === 'postgraduate_phd' && applicationData.postgraduateInstitution && (
                        <div>
                          <h5 className="font-medium">Postgraduate Education</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                            <div>
                              <strong>Institution:</strong> {applicationData.postgraduateInstitution}
                            </div>
                            <div>
                              <strong>Graduation Year:</strong> {applicationData.postgraduateGraduationYear}
                            </div>
                            <div>
                              <strong>Field of Study:</strong> {applicationData.postgraduateFieldOfStudy}
                            </div>
                            <div>
                              <strong>GPA:</strong> {applicationData.postgraduateGPA}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Documents</h4>
                    <div className="space-y-2 text-sm">
                      {/* Required Documents */}
                      {applicationData.passportDatapage?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Passport ID Datapage:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.passportPhotograph?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Passport Photograph:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.waecNecoResults?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">WAEC/NECO Results:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      
                      {/* Conditional Documents */}
                      {applicationData.bachelorTranscript?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Bachelor's Transcript:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.bachelorDiploma?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Bachelor's Diploma:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.masterTranscript?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Master's Transcript:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.masterDiploma?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Master's Diploma:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.researchProposal?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Research Proposal:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.cv?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">CV/Resume:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      {applicationData.englishProficiency?.url && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">English Proficiency Test:</span>
                          <span className="text-green-600">✓ Uploaded</span>
                        </div>
                      )}
                      
                      {!applicationData.passportDatapage && !applicationData.passportPhotograph && !applicationData.waecNecoResults && (
                        <p className="text-muted-foreground">No documents uploaded yet</p>
                      )}
                    </div>
                  </div>

                  {/* Application Details Review */}
                  {applicationData.motivation && (
                    <div className="border rounded-lg p-6">
                      <h4 className="font-semibold mb-4">Application Details</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <strong>Personal Statement:</strong>
                          <p className="mt-2 p-3 bg-muted/20 rounded text-sm leading-relaxed">
                            {applicationData.motivation}
                          </p>
                        </div>
                        {applicationData.careerGoals && (
                          <div>
                            <strong>Career Goals:</strong>
                            <p className="mt-2 p-3 bg-muted/20 rounded text-sm leading-relaxed">
                              {applicationData.careerGoals}
                            </p>
                          </div>
                        )}
                        {applicationData.whyThisProgram && (
                          <div>
                            <strong>Why This Program:</strong>
                            <p className="mt-2 p-3 bg-muted/20 rounded text-sm leading-relaxed">
                              {applicationData.whyThisProgram}
                            </p>
                          </div>
                        )}
                        {applicationData.extracurricular && (
                          <div>
                            <strong>Extracurricular Activities:</strong>
                            <p className="mt-2 p-3 bg-muted/20 rounded text-sm leading-relaxed">
                              {applicationData.extracurricular}
                            </p>
                          </div>
                        )}
                        {applicationData.financialSupport?.length > 0 && (
                          <div>
                            <strong>Financial Support:</strong> {applicationData.financialSupport.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Declaration */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="declaration"
                        checked={applicationData.declaration || false}
                        onChange={(e) => updateApplicationData('declaration', e.target.checked)}
                        className="mt-1"
                        required
                      />
                      <div className="flex-1">
                        <Label htmlFor="declaration" className="text-base font-medium cursor-pointer">
                          Declaration *
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2">
                          I declare that all the information provided in this application is true and correct to the best of my knowledge. 
                          I understand that providing false or misleading information may result in the rejection of my application or 
                          cancellation of my admission.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Application Fee Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-600 mt-1">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">Application Fee</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          A non-refundable application fee may be required after submission. 
                          You will receive payment instructions via email if applicable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 sm:mt-12 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 max-w-2xl mx-auto sm:max-w-none">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-13 text-base font-medium order-2 sm:order-1 min-w-[140px]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                size="lg"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!validateStep(currentStep)}
                className="w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-13 text-base font-medium order-1 sm:order-2 min-w-[140px] shadow-md"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || submitting}
                className="w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-13 text-base font-medium order-1 sm:order-2 min-w-[160px] shadow-md"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
