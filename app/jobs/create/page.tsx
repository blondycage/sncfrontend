'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Plus, X, Save, ArrowLeft } from 'lucide-react'

interface JobFormData {
  title: string
  role: string
  description: string
  company: {
    name: string
    website: string
    description: string
  }
  location: {
    city: string
    state: string
    country: string
    remote: boolean
    hybrid: boolean
  }
  salary: {
    min: string
    max: string
    currency: string
    frequency: string
    negotiable: boolean
  }
  jobType: string
  workLocation: string
  requirements: string[]
  benefits: string[]
  applicationDeadline: string
  contactEmail: string
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
const WORK_LOCATIONS = ['On-site', 'Remote', 'Hybrid']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
const FREQUENCIES = ['per year', 'per month', 'per hour']

export default function CreateJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newRequirement, setNewRequirement] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    role: '',
    description: '',
    company: {
      name: '',
      website: '',
      description: ''
    },
    location: {
      city: '',
      state: '',
      country: '',
      remote: false,
      hybrid: false
    },
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      frequency: 'per year',
      negotiable: false
    },
    jobType: '',
    workLocation: '',
    requirements: [],
    benefits: [],
    applicationDeadline: '',
    contactEmail: ''
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    console.log('Auth token:', token); // Debug log
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        if (userData) {
          setUser(userData)
          setFormData(prev => ({
            ...prev,
            contactEmail: userData.email || ''
          }))
        } else {
          router.push('/auth/login')
        }
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.')
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0] as keyof JobFormData], [keys[1]]: value }
      }))
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.role || !formData.description || !formData.company.name || 
        !formData.location.city || !formData.location.country || !formData.jobType || 
        !formData.workLocation || !formData.contactEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'error',
        duration: 3000
      })
      return
    }

    setSubmitting(true)
    toast({
      title: 'Creating job...',
      description: 'Please wait while we create your job posting',
      variant: 'info',
      duration: 3000
    })

    try {
      const submitData = {
        ...formData,
        salary: {
          ...formData.salary,
          min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
          max: formData.salary.max ? parseInt(formData.salary.max) : undefined
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        const job = await response.json()
        toast({
          title: 'Success!',
          description: 'Job posted successfully! It will be reviewed before going live.',
          variant: 'success',
          duration: 3000
        })
        router.push(`/jobs/${job._id}`)
      } else {
        const error = await response.json()
        toast({
          title: 'Creation Failed',
          description: error.message || 'Failed to create job',
          variant: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create job. Please try again.',
        variant: 'error',
        duration: 3000
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Post a Job</h1>
            <p className="text-muted-foreground">Create a new job listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Basic details about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workLocation">Work Location *</Label>
                  <Select value={formData.workLocation} onValueChange={(value) => handleInputChange('workLocation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work location" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_LOCATIONS.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="Applications will be sent to this email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="applicationDeadline">Application Deadline (optional)</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Details about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.company.name}
                  onChange={(e) => handleInputChange('company.name', e.target.value)}
                  placeholder="Your company name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  value={formData.company.website}
                  onChange={(e) => handleInputChange('company.website', e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
              
              <div>
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  value={formData.company.description}
                  onChange={(e) => handleInputChange('company.description', e.target.value)}
                  placeholder="Brief description of your company..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where is this job located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="e.g. San Francisco"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    placeholder="e.g. California"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.location.country}
                  onChange={(e) => handleInputChange('location.country', e.target.value)}
                  placeholder="e.g. United States"
                  required
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={formData.location.remote}
                    onCheckedChange={(checked) => handleInputChange('location.remote', checked)}
                  />
                  <Label htmlFor="remote">Remote work available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hybrid"
                    checked={formData.location.hybrid}
                    onCheckedChange={(checked) => handleInputChange('location.hybrid', checked)}
                  />
                  <Label htmlFor="hybrid">Hybrid work available</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>Compensation details (optional but recommended)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salary.min}
                    onChange={(e) => handleInputChange('salary.min', e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Maximum Salary</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salary.max}
                    onChange={(e) => handleInputChange('salary.max', e.target.value)}
                    placeholder="80000"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.salary.currency} onValueChange={(value) => handleInputChange('salary.currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.salary.frequency} onValueChange={(value) => handleInputChange('salary.frequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(freq => (
                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="negotiable"
                      checked={formData.salary.negotiable}
                      onCheckedChange={(checked) => handleInputChange('salary.negotiable', checked)}
                    />
                    <Label htmlFor="negotiable">Salary is negotiable</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>What skills and experience are needed?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {req}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeRequirement(index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>What benefits do you offer?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {benefit}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeBenefit(index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                'Creating...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Job
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 
