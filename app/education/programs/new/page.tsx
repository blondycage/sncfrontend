"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { 
  GraduationCap, 
  Building, 
  MapPin, 
  DollarSign,
  Clock,
  Globe,
  Phone,
  Mail,
  Image as ImageIcon,
  FileText,
  Tags,
  Calendar,
  AlertCircle,
  Save,
  ArrowLeft
} from 'lucide-react';

interface EducationProgramData {
  title: string;
  description: string;
  institution: {
    name: string;
    website?: string;
    logo?: string;
  };
  level: string;
  fieldOfStudy: string;
  duration: {
    value: number;
    unit: string;
  };
  tuition: {
    amount: number;
    currency: string;
    period: string;
  };
  location: {
    city: string;
    address?: string;
    campus?: string;
  };
  language: {
    instruction?: string;
    requirements?: string;
  };
  admissionRequirements: {
    academicRequirements: string[];
    languageRequirements: string[];
    documentsRequired: string[];
    additionalRequirements: string[];
  };
  applicationDeadlines: {
    fall?: Date | null;
    spring?: Date | null;
    summer?: Date | null;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
    admissionsOffice?: string;
  };
  images: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  brochure?: {
    url: string;
    filename: string;
  };
  tags: string[];
  featured: boolean;
  status: string;
}

const LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'undergraduate_transfer', label: 'Undergraduate Transfer' },
  { value: 'postgraduate_masters', label: 'Master\'s Degree' },
  { value: 'postgraduate_phd', label: 'PhD' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'language_course', label: 'Language Course' }
];

const FIELDS_OF_STUDY = [
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'business', label: 'Business' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'law', label: 'Law' },
  { value: 'education', label: 'Education' },
  { value: 'arts_humanities', label: 'Arts & Humanities' },
  { value: 'social_sciences', label: 'Social Sciences' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'tourism_hospitality', label: 'Tourism & Hospitality' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'design', label: 'Design' },
  { value: 'music', label: 'Music' },
  { value: 'sports_science', label: 'Sports Science' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'veterinary', label: 'Veterinary' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'dentistry', label: 'Dentistry' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'languages', label: 'Languages' },
  { value: 'communications', label: 'Communications' },
  { value: 'international_relations', label: 'International Relations' },
  { value: 'economics', label: 'Economics' },
  { value: 'other', label: 'Other' }
];

const CITIES = [
  'Nicosia',
  'Lefkoşa',
  'Famagusta', 
  'Gazimağusa',
  'Kyrenia',
  'Girne',
  'Morphou',
  'Güzelyurt',
  'İskele',
  'Lefke'
];

const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'TRY', label: 'TRY' },
  { value: 'GBP', label: 'GBP' }
];

const TUITION_PERIODS = [
  { value: 'per_semester', label: 'Per Semester' },
  { value: 'per_year', label: 'Per Year' },
  { value: 'total', label: 'Total' },
  { value: 'per_month', label: 'Per Month' }
];

const DURATION_UNITS = [
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
  { value: 'semesters', label: 'Semesters' }
];

const LANGUAGES = [
  'English',
  'Turkish', 
  'Greek',
  'French',
  'German',
  'Other'
];

export default function CreateEducationProgramPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<EducationProgramData>({
    title: '',
    description: '',
    institution: {
      name: '',
      website: '',
      logo: ''
    },
    level: '',
    fieldOfStudy: '',
    duration: {
      value: 1,
      unit: 'years'
    },
    tuition: {
      amount: 0,
      currency: 'USD',
      period: 'per_year'
    },
    location: {
      city: '',
      address: '',
      campus: ''
    },
    language: {
      instruction: 'English',
      requirements: ''
    },
    admissionRequirements: {
      academicRequirements: [],
      languageRequirements: [],
      documentsRequired: [],
      additionalRequirements: []
    },
    applicationDeadlines: {
      fall: null,
      spring: null,
      summer: null
    },
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      admissionsOffice: ''
    },
    images: [],
    tags: [],
    featured: false,
    status: 'active'
  });

  const [tempRequirement, setTempRequirement] = useState({
    academic: '',
    language: '',
    document: '',
    additional: ''
  });

  const [tempTag, setTempTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          router.push('/auth/login');
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser?.role !== 'admin') {
            toast({
              title: 'Access Denied',
              description: 'Admin privileges required.',
              variant: 'error'
            });
            router.push('/auth/login');
            return;
          }
          
          setUser(parsedUser);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.institution.name) newErrors.institutionName = 'Institution name is required';
    if (!formData.level) newErrors.level = 'Program level is required';
    // fieldOfStudy is optional in backend, so removed validation
    if (!formData.duration.value || formData.duration.value < 1) newErrors.durationValue = 'Duration must be at least 1';
    if (!formData.tuition.amount || formData.tuition.amount < 0) newErrors.tuitionAmount = 'Tuition amount is required';
    if (!formData.location.city) newErrors.locationCity = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      // Clean the form data - remove empty optional fields
      const cleanedFormData = {
        ...formData,
        fieldOfStudy: formData.fieldOfStudy || undefined, // Remove empty string
        language: {
          ...formData.language,
          instruction: formData.language.instruction || undefined // Remove empty string
        }
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedFormData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: 'Education program created successfully!',
          variant: 'success'
        });
        router.push('/admin/education');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to create education program',
          variant: 'error'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create education program',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = (type: 'academic' | 'language' | 'document' | 'additional') => {
    const value = tempRequirement[type].trim();
    if (!value) return;

    const fieldMap = {
      academic: 'academicRequirements',
      language: 'languageRequirements', 
      document: 'documentsRequired',
      additional: 'additionalRequirements'
    };

    const field = fieldMap[type];
    setFormData(prev => ({
      ...prev,
      admissionRequirements: {
        ...prev.admissionRequirements,
        [field]: [...prev.admissionRequirements[field], value]
      }
    }));

    setTempRequirement(prev => ({ ...prev, [type]: '' }));
  };

  const removeRequirement = (type: 'academic' | 'language' | 'document' | 'additional', index: number) => {
    const fieldMap = {
      academic: 'academicRequirements',
      language: 'languageRequirements',
      document: 'documentsRequired', 
      additional: 'additionalRequirements'
    };

    const field = fieldMap[type];
    setFormData(prev => ({
      ...prev,
      admissionRequirements: {
        ...prev.admissionRequirements,
        [field]: prev.admissionRequirements[field].filter((_, i) => i !== index)
      }
    }));
  };

  const addTag = () => {
    const tag = tempTag.trim().toLowerCase();
    if (!tag || formData.tags.includes(tag)) return;

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setTempTag('');
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (field: 'fall' | 'spring' | 'summer', value: string) => {
    setFormData(prev => ({
      ...prev,
      applicationDeadlines: {
        ...prev.applicationDeadlines,
        [field]: value ? new Date(value) : null
      }
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-teal py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Education Program</h1>
          <p className="text-gray-600">Add a new education program to the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about the education program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Program Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Bachelor of Computer Science"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the program..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Program Level *</Label>
                  <Select 
                    value={formData.level} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && <p className="text-sm text-red-500 mt-1">{errors.level}</p>}
                </div>

                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Select 
                    value={formData.fieldOfStudy} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fieldOfStudy: value }))}
                  >
                    <SelectTrigger className={errors.fieldOfStudy ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELDS_OF_STUDY.map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fieldOfStudy && <p className="text-sm text-red-500 mt-1">{errors.fieldOfStudy}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="institutionName">Institution Name *</Label>
                <Input
                  id="institutionName"
                  value={formData.institution.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    institution: { ...prev.institution, name: e.target.value }
                  }))}
                  placeholder="e.g., Cyprus International University"
                  className={errors.institutionName ? 'border-red-500' : ''}
                />
                {errors.institutionName && <p className="text-sm text-red-500 mt-1">{errors.institutionName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institutionWebsite">Institution Website</Label>
                  <Input
                    id="institutionWebsite"
                    value={formData.institution.website}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      institution: { ...prev.institution, website: e.target.value }
                    }))}
                    placeholder="https://www.example.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="institutionLogo">Institution Logo URL</Label>
                  <Input
                    id="institutionLogo"
                    value={formData.institution.logo}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      institution: { ...prev.institution, logo: e.target.value }
                    }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Program Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="durationValue">Duration *</Label>
                  <Input
                    id="durationValue"
                    type="number"
                    min="1"
                    value={formData.duration.value}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      duration: { ...prev.duration, value: parseInt(e.target.value) || 0 }
                    }))}
                    className={errors.durationValue ? 'border-red-500' : ''}
                  />
                  {errors.durationValue && <p className="text-sm text-red-500 mt-1">{errors.durationValue}</p>}
                </div>

                <div>
                  <Label htmlFor="durationUnit">Unit</Label>
                  <Select 
                    value={formData.duration.unit} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      duration: { ...prev.duration, unit: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_UNITS.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="languageInstruction">Language of Instruction</Label>
                  <Select 
                    value={formData.language.instruction || ''} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      language: { ...prev.language, instruction: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="languageRequirements">Language Requirements</Label>
                <Textarea
                  id="languageRequirements"
                  value={formData.language.requirements}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    language: { ...prev.language, requirements: e.target.value }
                  }))}
                  placeholder="e.g., IELTS 6.0 overall, 5.5 in each band"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tuition & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tuition & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tuitionAmount">Tuition Amount *</Label>
                  <Input
                    id="tuitionAmount"
                    type="number"
                    min="0"
                    value={formData.tuition.amount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tuition: { ...prev.tuition, amount: parseFloat(e.target.value) || 0 }
                    }))}
                    className={errors.tuitionAmount ? 'border-red-500' : ''}
                  />
                  {errors.tuitionAmount && <p className="text-sm text-red-500 mt-1">{errors.tuitionAmount}</p>}
                </div>

                <div>
                  <Label htmlFor="tuitionCurrency">Currency</Label>
                  <Select 
                    value={formData.tuition.currency} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      tuition: { ...prev.tuition, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tuitionPeriod">Period</Label>
                  <Select 
                    value={formData.tuition.period} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      tuition: { ...prev.tuition, period: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TUITION_PERIODS.map(period => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="locationCity">City *</Label>
                  <Select 
                    value={formData.location.city} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, city: value }
                    }))}
                  >
                    <SelectTrigger className={errors.locationCity ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.locationCity && <p className="text-sm text-red-500 mt-1">{errors.locationCity}</p>}
                </div>

                <div>
                  <Label htmlFor="locationCampus">Campus</Label>
                  <Input
                    id="locationCampus"
                    value={formData.location.campus}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, campus: e.target.value }
                    }))}
                    placeholder="e.g., Main Campus"
                  />
                </div>

                <div>
                  <Label htmlFor="locationAddress">Address</Label>
                  <Input
                    id="locationAddress"
                    value={formData.location.address}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    placeholder="Full address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admission Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admission Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Academic Requirements */}
              <div>
                <Label>Academic Requirements</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempRequirement.academic}
                    onChange={(e) => setTempRequirement(prev => ({ ...prev, academic: e.target.value }))}
                    placeholder="Add academic requirement"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement('academic'))}
                  />
                  <Button type="button" onClick={() => addRequirement('academic')}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.admissionRequirements.academicRequirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement('academic', index)}>
                      {req} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Language Requirements */}
              <div>
                <Label>Language Requirements</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempRequirement.language}
                    onChange={(e) => setTempRequirement(prev => ({ ...prev, language: e.target.value }))}
                    placeholder="Add language requirement"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement('language'))}
                  />
                  <Button type="button" onClick={() => addRequirement('language')}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.admissionRequirements.languageRequirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement('language', index)}>
                      {req} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <Label>Required Documents</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempRequirement.document}
                    onChange={(e) => setTempRequirement(prev => ({ ...prev, document: e.target.value }))}
                    placeholder="Add required document"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement('document'))}
                  />
                  <Button type="button" onClick={() => addRequirement('document')}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.admissionRequirements.documentsRequired.map((req, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement('document', index)}>
                      {req} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Additional Requirements */}
              <div>
                <Label>Additional Requirements</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempRequirement.additional}
                    onChange={(e) => setTempRequirement(prev => ({ ...prev, additional: e.target.value }))}
                    placeholder="Add additional requirement"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement('additional'))}
                  />
                  <Button type="button" onClick={() => addRequirement('additional')}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.admissionRequirements.additionalRequirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement('additional', index)}>
                      {req} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Application Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fallDeadline">Fall Semester</Label>
                  <Input
                    id="fallDeadline"
                    type="date"
                    value={formatDate(formData.applicationDeadlines.fall)}
                    onChange={(e) => handleDateChange('fall', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="springDeadline">Spring Semester</Label>
                  <Input
                    id="springDeadline"
                    type="date"
                    value={formatDate(formData.applicationDeadlines.spring)}
                    onChange={(e) => handleDateChange('spring', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="summerDeadline">Summer Semester</Label>
                  <Input
                    id="summerDeadline"
                    type="date"
                    value={formatDate(formData.applicationDeadlines.summer)}
                    onChange={(e) => handleDateChange('summer', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contactInfo: { ...prev.contactInfo, email: e.target.value }
                    }))}
                    placeholder="admissions@university.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactInfo.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    placeholder="+90 392 XXX XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactWebsite">Website</Label>
                  <Input
                    id="contactWebsite"
                    value={formData.contactInfo.website}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contactInfo: { ...prev.contactInfo, website: e.target.value }
                    }))}
                    placeholder="https://www.university.edu/admissions"
                  />
                </div>

                <div>
                  <Label htmlFor="admissionsOffice">Admissions Office</Label>
                  <Input
                    id="admissionsOffice"
                    value={formData.contactInfo.admissionsOffice}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contactInfo: { ...prev.contactInfo, admissionsOffice: e.target.value }
                    }))}
                    placeholder="Office location or department"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Tags & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempTag}
                    onChange={(e) => setTempTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} className="cursor-pointer" onClick={() => removeTag(index)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                />
                <Label htmlFor="featured">Featured Program</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Program
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}