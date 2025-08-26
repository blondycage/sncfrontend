'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, User, GraduationCap, FileText, Building, Phone, Mail, 
  MapPin, Calendar, CheckCircle, XCircle, Clock, AlertCircle,
  Download, Eye, Verify, X
} from "lucide-react"
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

interface Application {
  _id: string
  applicationId: string
  applicant: { firstName: string; lastName: string; email: string; username: string }
  program: { 
    title: string; 
    institution: { name: string }; 
    level: string; 
    location: { city: string }; 
    tuition: { amount: number; currency: string; period: string };
  }
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    nationality: string
    passportNumber?: string
    address?: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    emergencyContact?: {
      name: string
      relationship: string
      phone: string
      email: string
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
      gradeScale?: string
    }>
    standardizedTests?: {
      sat?: { score: number; date: string }
      act?: { score: number; date: string }
      toefl?: { score: number; date: string }
      ielts?: { score: number; date: string }
      other?: Array<{ testName: string; score: string; date: string }>
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
    awards?: Array<{
      title: string
      organization: string
      date: string
      description: string
    }>
  }
  documents: {
    passportDatapage?: { uploaded: boolean; url: string; verified: boolean }
    passportPhotograph?: { uploaded: boolean; url: string; verified: boolean }
    waecNecoResults?: { uploaded: boolean; url: string; verified: boolean }
    bachelorTranscript?: { uploaded: boolean; url: string; verified: boolean }
    bachelorDiploma?: { uploaded: boolean; url: string; verified: boolean }
    masterTranscript?: { uploaded: boolean; url: string; verified: boolean }
    masterDiploma?: { uploaded: boolean; url: string; verified: boolean }
    cv?: { uploaded: boolean; url: string; verified: boolean }
    researchProposal?: { uploaded: boolean; url: string; verified: boolean }
    englishProficiency?: { uploaded: boolean; url: string; verified: boolean }
    additional?: Array<{
      name: string
      url: string
      uploaded: boolean
      verified: boolean
    }>
  }
  status: string
  timeline?: Array<{
    status: string
    date: string
    notes?: string
    updatedBy?: { firstName: string; lastName: string }
  }>
  reviewNotes?: Array<{
    reviewer: { firstName: string; lastName: string }
    notes: string
    recommendation: string
    timestamp: string
  }>
  submittedAt: string
  createdAt: string
  progress?: number
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchApplication()
    }
  }, [params.id])

  const fetchApplication = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/education/applications/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplication(data.data)
        setStatusUpdate(prev => ({ ...prev, status: data.data.status }))
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load application',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Error fetching application:', error)
      toast({
        title: 'Error',
        description: 'Failed to load application',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) return

    setUpdating(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/education/applications/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusUpdate)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application status updated successfully',
          variant: 'default'
        })
        fetchApplication() // Refresh data
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to update status',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'error'
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'bg-gray-500', label: 'Draft', icon: Clock },
      submitted: { color: 'bg-blue-500', label: 'Submitted', icon: FileText },
      under_review: { color: 'bg-yellow-500', label: 'Under Review', icon: Eye },
      documents_required: { color: 'bg-orange-500', label: 'Documents Required', icon: AlertCircle },
      approved: { color: 'bg-green-500', label: 'Approved', icon: CheckCircle },
      conditionally_approved: { color: 'bg-green-400', label: 'Conditionally Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-500', label: 'Rejected', icon: XCircle },
      withdrawn: { color: 'bg-gray-400', label: 'Withdrawn', icon: X },
      enrolled: { color: 'bg-emerald-500', label: 'Enrolled', icon: GraduationCap },
      deferred: { color: 'bg-purple-500', label: 'Deferred', icon: Calendar }
    }
    
    const statusConfig = config[status as keyof typeof config] || { color: 'bg-gray-500', label: status, icon: Clock }
    const IconComponent = statusConfig.icon
    
    return (
      <Badge className={`${statusConfig.color} text-white flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDocumentIcon = (docType: string) => {
    return <FileText className="h-4 w-4 text-blue-500" />
  }

  const renderDocumentStatus = (doc: { uploaded: boolean; url: string; verified: boolean } | undefined, name: string) => {
    if (!doc || !doc.uploaded) {
      return (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
          <div className="flex items-center space-x-2">
            {getDocumentIcon(name)}
            <span className="text-sm font-medium">{name}</span>
          </div>
          <Badge variant="outline" className="text-red-600 border-red-300">
            Not Uploaded
          </Badge>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
        <div className="flex items-center space-x-2">
          {getDocumentIcon(name)}
          <span className="text-sm font-medium">{name}</span>
          {doc.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>
        <div className="flex items-center space-x-2">
          {doc.verified ? (
            <Badge className="bg-green-500 text-white">Verified</Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              Pending Verification
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(doc.url, '_blank')}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const a = document.createElement('a')
              a.href = doc.url
              a.download = name
              a.click()
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <Link href="/admin/education">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Education Admin
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/education">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Application #{application.applicationId}
            </h1>
            <p className="text-muted-foreground">
              {application.personalInfo.firstName} {application.personalInfo.lastName} • {application.program.title}
            </p>
          </div>
        </div>
        {getStatusBadge(application.status)}
      </div>

      {/* Status Update Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>Change the application status and add review notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="documents_required">Documents Required</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="conditionally_approved">Conditionally Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleStatusUpdate} disabled={updating || !statusUpdate.status}>
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Review Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this status change..."
              value={statusUpdate.notes}
              onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p>{application.personalInfo.firstName} {application.personalInfo.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p>{application.personalInfo.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p>{application.personalInfo.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p>{formatDate(application.personalInfo.dateOfBirth)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nationality</Label>
                  <p>{application.personalInfo.nationality}</p>
                </div>
                {application.personalInfo.passportNumber && (
                  <div>
                    <Label className="text-sm font-medium">Passport Number</Label>
                    <p>{application.personalInfo.passportNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Family Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Father's Name</Label>
                  <p>{application.familyInfo.fatherName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mother's Name</Label>
                  <p>{application.familyInfo.motherName}</p>
                </div>
                {application.familyInfo.fatherOccupation && (
                  <div>
                    <Label className="text-sm font-medium">Father's Occupation</Label>
                    <p>{application.familyInfo.fatherOccupation}</p>
                  </div>
                )}
                {application.familyInfo.motherOccupation && (
                  <div>
                    <Label className="text-sm font-medium">Mother's Occupation</Label>
                    <p>{application.familyInfo.motherOccupation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {application.personalInfo.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    {application.personalInfo.address.street}<br />
                    {application.personalInfo.address.city}, {application.personalInfo.address.state}<br />
                    {application.personalInfo.address.postalCode}<br />
                    {application.personalInfo.address.country}
                  </p>
                </CardContent>
              </Card>
            )}

            {application.personalInfo.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p>{application.personalInfo.emergencyContact.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Relationship</Label>
                    <p>{application.personalInfo.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p>{application.personalInfo.emergencyContact.phone}</p>
                  </div>
                  {application.personalInfo.emergencyContact.email && (
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p>{application.personalInfo.emergencyContact.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Academic Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">High School Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">School Name</Label>
                    <p>{application.academicBackground.highSchool.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Graduation Year</Label>
                    <p>{application.academicBackground.highSchool.graduationYear}</p>
                  </div>
                  {application.academicBackground.highSchool.city && (
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <p>{application.academicBackground.highSchool.city}</p>
                    </div>
                  )}
                  {application.academicBackground.highSchool.gpa && (
                    <div>
                      <Label className="text-sm font-medium">GPA</Label>
                      <p>{application.academicBackground.highSchool.gpa}</p>
                    </div>
                  )}
                </div>
              </div>

              {application.academicBackground.previousEducation && application.academicBackground.previousEducation.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Previous Education</h3>
                  <div className="space-y-4">
                    {application.academicBackground.previousEducation.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Institution</Label>
                            <p>{edu.institution}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Degree</Label>
                            <p>{edu.degree}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Field of Study</Label>
                            <p>{edu.field}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Graduation Year</Label>
                            <p>{edu.graduationYear}</p>
                          </div>
                          {edu.gpa && (
                            <div>
                              <Label className="text-sm font-medium">GPA</Label>
                              <p>{edu.gpa}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Program</Label>
                  <p>{application.program.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Institution</Label>
                  <p>{application.program.institution.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Level</Label>
                  <p>{application.program.level.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p>{application.program.location.city}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Intended Start</Label>
                  <p>{application.applicationInfo.intendedStartSemester} {application.applicationInfo.intendedStartYear}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <div className="mt-1">{getStatusBadge(application.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p>{formatDate(application.submittedAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Application ID</Label>
                  <p>{application.applicationId}</p>
                </div>
                {application.progress && (
                  <div>
                    <Label className="text-sm font-medium">Completion Progress</Label>
                    <p>{application.progress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Statement & Essays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Motivation Statement</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{application.applicationInfo.motivation}</p>
                </div>
              </div>

              {application.applicationInfo.careerGoals && (
                <div>
                  <Label className="text-sm font-medium">Career Goals</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{application.applicationInfo.careerGoals}</p>
                  </div>
                </div>
              )}

              {application.applicationInfo.whyThisProgram && (
                <div>
                  <Label className="text-sm font-medium">Why This Program</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{application.applicationInfo.whyThisProgram}</p>
                  </div>
                </div>
              )}

              {application.applicationInfo.extracurricularActivities && (
                <div>
                  <Label className="text-sm font-medium">Extracurricular Activities</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{application.applicationInfo.extracurricularActivities}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Review and verify uploaded documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {renderDocumentStatus(application.documents.passportDatapage, 'Passport ID Datapage')}
              {renderDocumentStatus(application.documents.passportPhotograph, 'Passport Photograph')}
              {renderDocumentStatus(application.documents.waecNecoResults, 'WAEC/NECO Results')}
              
              {/* Conditional documents based on program level */}
              {(application.program.level.includes('transfer') || application.program.level.includes('postgraduate')) && (
                <>
                  {renderDocumentStatus(application.documents.bachelorTranscript, 'Bachelor\'s Transcript')}
                  {renderDocumentStatus(application.documents.bachelorDiploma, 'Bachelor\'s Diploma')}
                </>
              )}
              
              {application.program.level === 'postgraduate_phd' && (
                <>
                  {renderDocumentStatus(application.documents.masterTranscript, 'Master\'s Transcript')}
                  {renderDocumentStatus(application.documents.masterDiploma, 'Master\'s Diploma')}
                  {renderDocumentStatus(application.documents.researchProposal, 'Research Proposal')}
                </>
              )}

              {/* Optional documents */}
              {renderDocumentStatus(application.documents.cv, 'CV/Resume')}
              {renderDocumentStatus(application.documents.englishProficiency, 'English Proficiency Test')}

              {/* Additional documents */}
              {application.documents.additional && application.documents.additional.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Additional Documents</h3>
                  <div className="space-y-3">
                    {application.documents.additional.map((doc, index) => (
                      <div key={index}>
                        {renderDocumentStatus(doc, doc.name)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>Track the progress and changes of this application</CardDescription>
            </CardHeader>
            <CardContent>
              {application.timeline && application.timeline.length > 0 ? (
                <div className="space-y-4">
                  {application.timeline.reverse().map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                      <div className="mt-1">{getStatusBadge(entry.status)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Status changed to: {entry.status.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(entry.date)}
                          {entry.updatedBy && (
                            <span> • Updated by {entry.updatedBy.firstName} {entry.updatedBy.lastName}</span>
                          )}
                        </p>
                        {entry.notes && (
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No timeline entries available.</p>
              )}

              {application.reviewNotes && application.reviewNotes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Review Notes</h3>
                  <div className="space-y-4">
                    {application.reviewNotes.reverse().map((note, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            {note.reviewer.firstName} {note.reviewer.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(note.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm mb-2">
                          <strong>Recommendation:</strong> {note.recommendation.replace('_', ' ')}
                        </p>
                        <p className="text-sm">{note.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}