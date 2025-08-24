'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, Clock, FileText, GraduationCap, MapPin, Download, 
  CheckCircle, XCircle, AlertCircle, User, School, Building,
  Phone, Mail, ChevronLeft, Eye, Edit, Trash2, RefreshCw,
  DollarSign, Upload, FileCheck, ArrowRight
} from "lucide-react"
import Link from 'next/link'

interface ApplicationDetail {
  _id: string
  applicationId: string
  programId: {
    _id: string
    title: string
    institution: { name: string }
    level: string
    location: { city: string }
    tuition: { amount: number; currency: string; period: string }
  }
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    nationality: string
    address: string
    fatherName: string
    motherName: string
  }
  academicBackground: {
    highSchoolName: string
    highSchoolGraduationYear: string
    waecNecoGrades: string
    undergraduateInstitution?: string
    undergraduateGraduationYear?: string
    undergraduateGPA?: string
  }
  applicationInfo: {
    startSemester: string
    startYear: string
    motivationLetter: string
    scholarshipInterest: boolean
  }
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  timeline: Array<{
    status: string
    timestamp: string
    notes?: string
    updatedBy?: string
  }>
  documents: {
    [key: string]: {
      uploaded: boolean
      verified: boolean
      filename?: string
      uploadedAt?: string
      verifiedAt?: string
      rejectionReason?: string
    }
  }
  applicationFee?: {
    amount: number
    currency: string
    paid: boolean
    paymentDate?: string
    paymentMethod?: string
  }
  reviewNotes?: string
  submittedAt?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500', textColor: 'text-gray-700' },
  submitted: { label: 'Submitted', color: 'bg-blue-500', textColor: 'text-blue-700' },
  under_review: { label: 'Under Review', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  approved: { label: 'Approved', color: 'bg-green-500', textColor: 'text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-700' }
}

const DOCUMENT_LABELS = {
  passportDatapage: 'Passport ID Datapage',
  passportPhotograph: 'Passport Photograph',
  waecNecoResults: 'WAEC/NECO Results',
  bachelorTranscript: 'Bachelor\'s Transcript',
  bachelorDiploma: 'Bachelor\'s Diploma',
  masterTranscript: 'Master\'s Transcript',
  masterDiploma: 'Master\'s Diploma',
  cv: 'Curriculum Vitae',
  researchProposal: 'Research Proposal',
  englishProficiency: 'English Proficiency Test'
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      if (!params.id) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/education/applications/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setApplication(data.application)
        } else {
          router.push('/dashboard/applications')
        }
      } catch (error) {
        console.error('Error fetching application:', error)
        router.push('/dashboard/applications')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [params.id, router])

  const handleWithdraw = async () => {
    if (!application || !confirm('Are you sure you want to withdraw this application?')) return
    
    setWithdrawing(true)
    try {
      const response = await fetch(`/api/education/applications/${application._id}/withdraw`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        router.push('/dashboard/applications')
      }
    } catch (error) {
      console.error('Error withdrawing application:', error)
    } finally {
      setWithdrawing(false)
    }
  }

  const downloadDocument = async (documentKey: string) => {
    try {
      const response = await fetch(`/api/education/applications/${application?._id}/documents/${documentKey}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = application?.documents[documentKey]?.filename || `${documentKey}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentStatus = (doc: ApplicationDetail['documents'][string]) => {
    if (!doc.uploaded) return { icon: XCircle, color: 'text-gray-400', label: 'Not Uploaded' }
    if (doc.rejectionReason) return { icon: XCircle, color: 'text-red-500', label: 'Rejected' }
    if (doc.verified) return { icon: CheckCircle, color: 'text-green-500', label: 'Verified' }
    return { icon: Clock, color: 'text-yellow-500', label: 'Pending Review' }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <Link href="/dashboard/applications">
            <Button>Back to Applications</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_CONFIG[application.status]

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/applications">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{application.programId.title}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {application.programId.institution.name}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {application.programId.location.city}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className={`${statusInfo.color} text-white mb-2`}>
              {statusInfo.label}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Application ID: {application.applicationId}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-4 mb-8">
        {application.status === 'draft' && (
          <Link href={`/categories/education/${application.programId._id}/apply?edit=${application._id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Continue Application
            </Button>
          </Link>
        )}
        
        {['submitted', 'under_review'].includes(application.status) && (
          <Button variant="destructive" onClick={handleWithdraw} disabled={withdrawing}>
            <Trash2 className="h-4 w-4 mr-2" />
            {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
          </Button>
        )}
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Program Level</label>
                      <p className="text-lg">{application.programId.level.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tuition Fee</label>
                      <p className="text-lg">
                        {application.programId.tuition.currency === 'USD' ? '$' : application.programId.tuition.currency}
                        {application.programId.tuition.amount.toLocaleString()}/{application.programId.tuition.period}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Semester</label>
                      <p className="text-lg">{application.applicationInfo.startSemester} {application.applicationInfo.startYear}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Scholarship Interest</label>
                      <p className="text-lg">{application.applicationInfo.scholarshipInterest ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  {application.applicationInfo.motivationLetter && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Motivation Letter</label>
                      <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                        <p className="whitespace-pre-wrap">{application.applicationInfo.motivationLetter}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">High School</label>
                    <p>{application.academicBackground.highSchoolName} (Graduated: {application.academicBackground.highSchoolGraduationYear})</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">WAEC/NECO Grades</label>
                    <p>{application.academicBackground.waecNecoGrades}</p>
                  </div>
                  {application.academicBackground.undergraduateInstitution && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Undergraduate Institution</label>
                      <p>{application.academicBackground.undergraduateInstitution} (Graduated: {application.academicBackground.undergraduateGraduationYear})</p>
                      {application.academicBackground.undergraduateGPA && (
                        <p className="text-sm text-muted-foreground">GPA: {application.academicBackground.undergraduateGPA}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Status</CardTitle>
                  <CardDescription>
                    Track the status of your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(application.documents).map(([key, doc]) => {
                      const status = getDocumentStatus(doc)
                      const StatusIcon = status.icon
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <StatusIcon className={`h-5 w-5 ${status.color}`} />
                            <div>
                              <p className="font-medium">{DOCUMENT_LABELS[key as keyof typeof DOCUMENT_LABELS] || key}</p>
                              <p className={`text-sm ${status.color}`}>{status.label}</p>
                              {doc.uploadedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {formatDate(doc.uploadedAt)}
                                </p>
                              )}
                              {doc.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  Reason: {doc.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {doc.uploaded && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadDocument(key)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {doc.rejectionReason && (
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Timeline</CardTitle>
                  <CardDescription>
                    Track the progress of your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium capitalize">{event.status.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</p>
                          </div>
                          {event.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>
                          )}
                          {event.updatedBy && (
                            <p className="text-xs text-muted-foreground mt-1">Updated by: {event.updatedBy}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p>{application.personalInfo.firstName} {application.personalInfo.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p>{new Date(application.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                      <p>{application.personalInfo.nationality}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{application.personalInfo.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p>{application.personalInfo.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                      <p>{application.personalInfo.fatherName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                      <p>{application.personalInfo.motherName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Fee */}
          {application.applicationFee && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Application Fee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">
                      {application.applicationFee.currency === 'USD' ? '$' : application.applicationFee.currency}
                      {application.applicationFee.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={application.applicationFee.paid ? "default" : "destructive"}>
                      {application.applicationFee.paid ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  {application.applicationFee.paymentDate && (
                    <div className="flex justify-between">
                      <span>Paid On:</span>
                      <span className="text-sm">{formatDate(application.applicationFee.paymentDate)}</span>
                    </div>
                  )}
                  {!application.applicationFee.paid && (
                    <Button className="w-full mt-4">
                      Pay Application Fee
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Application Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Documents Uploaded:</span>
                <span>{Object.values(application.documents).filter(doc => doc.uploaded).length}/{Object.keys(application.documents).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Documents Verified:</span>
                <span>{Object.values(application.documents).filter(doc => doc.verified).length}/{Object.keys(application.documents).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-sm">{formatDate(application.createdAt)}</span>
              </div>
              {application.submittedAt && (
                <div className="flex justify-between">
                  <span>Submitted:</span>
                  <span className="text-sm">{formatDate(application.submittedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Notes */}
          {application.reviewNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Review Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.reviewNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {application.status === 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Congratulations!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Your application has been approved. Next steps:</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    Pay acceptance fee
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    Submit visa documents
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    Confirm enrollment
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 
