'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Building, 
  Globe, 
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  MessageCircle,
  Phone
} from 'lucide-react'

interface Job {
  _id: string
  title: string
  role: string
  description: string
  company: {
    name: string
    logo?: string
    website?: string
    description?: string
  }
  location: {
    city: string
    state?: string
    country: string
    remote: boolean
    hybrid: boolean
  }
  salary: {
    min?: number
    max?: number
    currency: string
    frequency: string
    negotiable: boolean
  }
  jobType: string
  workLocation: string
  requirements: string[]
  benefits: string[]
  applicationDeadline?: string
  contactEmail: string
  contactPhone?: string
  applicationCount: number
  views: number
  status: string
  createdAt: string
  updatedAt: string
}

interface JobDetailClientProps {
  job: Job
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null as File | null,
    phone: '',
    linkedinUrl: ''
  })

  useEffect(() => {
    // Check authentication status
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(userData => setUser(userData))
      .catch(() => setUser(null))
  }, [])

  const handleApply = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!applicationData.coverLetter.trim()) {
      toast.error('Please write a cover letter')
      return
    }

    setIsApplying(true)

    try {
      const formData = new FormData()
      formData.append('coverLetter', applicationData.coverLetter)
      formData.append('phone', applicationData.phone)
      formData.append('linkedinUrl', applicationData.linkedinUrl)
      
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume)
      }

      const response = await fetch(`/api/jobs/${job._id}/apply`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Application submitted successfully!')
        setApplicationSubmitted(true)
        setApplicationData({
          coverLetter: '',
          resume: null,
          phone: '',
          linkedinUrl: ''
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to submit application')
      }
    } catch (error) {
      toast.error('Failed to submit application')
    } finally {
      setIsApplying(false)
    }
  }

  const formatSalary = () => {
    const { min, max, currency, frequency, negotiable } = job.salary
    
    if (negotiable && !min && !max) {
      return 'Salary negotiable'
    }
    
    if (min && max) {
      return `${currency}${min?.toLocaleString()} - ${currency}${max?.toLocaleString()} ${frequency}`
    } else if (min) {
      return `From ${currency}${min?.toLocaleString()} ${frequency}`
    } else if (max) {
      return `Up to ${currency}${max?.toLocaleString()} ${frequency}`
    }
    
    return 'Salary not disclosed'
  }

  const formatLocation = () => {
    const { city, state, country, remote, hybrid } = job.location
    
    let location = city
    if (state) location += `, ${state}`
    location += `, ${country}`
    
    if (remote) {
      location += ' (Remote)'
    } else if (hybrid) {
      location += ' (Hybrid)'
    }
    
    return location
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDeadlinePassed = job.applicationDeadline && new Date(job.applicationDeadline) < new Date()

  const handleWhatsAppMessage = () => {
    if (!job.contactPhone) {
      toast.error('No contact number available for this listing')
      return
    }
    
    const message = `Hi! I am interested in the "${job.title}" position from SNC.to`
    const whatsappUrl = `https://wa.me/${job.contactPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid gap-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
                  <CardDescription className="text-lg">{job.role}</CardDescription>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {job.company.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {formatLocation()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {job.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.applicationCount} applications
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{job.jobType}</Badge>
                  <Badge variant="secondary">{job.workLocation}</Badge>
                  {job.location.remote && <Badge variant="outline">Remote</Badge>}
                  {job.location.hybrid && <Badge variant="outline">Hybrid</Badge>}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{formatSalary()}</div>
                <div className="text-sm text-muted-foreground">
                  Posted {formatDate(job.createdAt)}
                </div>
                {job.applicationDeadline && (
                  <div className={`text-sm ${isDeadlinePassed ? 'text-red-500' : 'text-muted-foreground'}`}>
                    Deadline: {formatDate(job.applicationDeadline)}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
              </CardHeader>
              <CardContent>
                {isDeadlinePassed ? (
                  <div className="text-center py-4">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 font-medium">Application deadline has passed</p>
                  </div>
                ) : applicationSubmitted ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">Application submitted!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll be in touch soon.
                    </p>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Send className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                          Submit your application for this position at {job.company.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={applicationData.phone}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Your phone number"
                          />
                        </div>

                        <div>
                          <Label htmlFor="linkedin">LinkedIn Profile (optional)</Label>
                          <Input
                            id="linkedin"
                            type="url"
                            value={applicationData.linkedinUrl}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </div>

                        <div>
                          <Label htmlFor="resume">Resume (optional)</Label>
                          <Input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setApplicationData(prev => ({ ...prev, resume: e.target.files?.[0] || null }))}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, or DOCX files only
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="coverLetter">Cover Letter *</Label>
                          <Textarea
                            id="coverLetter"
                            value={applicationData.coverLetter}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                            placeholder="Tell us why you're interested in this position..."
                            rows={4}
                            required
                          />
                        </div>

                        <Button 
                          onClick={handleApply} 
                          disabled={isApplying || !applicationData.coverLetter.trim()}
                          className="w-full"
                        >
                          {isApplying ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Contact Options */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Employer</CardTitle>
                <CardDescription>
                  Get in touch directly with the employer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleWhatsAppMessage}
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                  disabled={!job.contactPhone}
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp Employer
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 opacity-50 cursor-not-allowed"
                  disabled={true}
                >
                  <MessageCircle className="h-4 w-4" />
                  Telegram (Coming Soon)
                </Button>
                
                {!job.contactPhone && (
                  <p className="text-xs text-muted-foreground text-center">
                    Contact information not available for this listing
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.company.description && (
                  <p className="text-sm text-muted-foreground">
                    {job.company.description}
                  </p>
                )}
                
                {job.company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={job.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Visit website
                    </a>
                  </div>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatSalary()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{job.jobType}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.workLocation}</span>
                  </div>

                  {job.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Apply by {formatDate(job.applicationDeadline)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
