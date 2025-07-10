import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Job {
  id: string
  title: string
  role: string
  description: string
  company: {
    name: string
    website?: string
    description?: string
  }
  location: {
    city: string
    region: string
  }
  salary: {
    min?: number
    max?: number
    currency: string
    frequency: string
  }
  jobType: string
  workLocation: string
  requirements: string[]
  benefits: string[]
  applicationDeadline?: string
  contact: {
    email: string
  }
  applicationCount: number
  views: number
  createdAt: string
}

async function getJob(id: string): Promise<Job | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      return null
    }
    
    const response = await res.json()
    return response.success ? response.data : null
  } catch (error) {
    console.error('Error fetching job:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJob(params.id)
  
  if (!job) {
    return {
      title: 'Job Not Found'
    }
  }

  return {
    title: `${job.title} at ${job.company.name}`,
    description: job.description.substring(0, 160),
  }
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id)

  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{job.company.name}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>📍 {job.location.city}, {job.location.region}</span>
            <span>💼 {job.jobType}</span>
            <span>🏠 {job.workLocation}</span>
          </div>
        </div>

        {/* Salary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">💰 Salary</h2>
          <p className="text-lg text-green-600">
            {job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} / {job.salary.frequency}
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">📄 Description</h2>
          <p className="text-gray-700">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">✅ Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {job.benefits?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">🎁 Benefits</h2>
            <ul className="space-y-2">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">📧 Apply</h2>
          <p>Send your application to: 
            <a href={`mailto:${job.contact.email}`} className="text-blue-600 ml-1">
              {job.contact.email}
            </a>
          </p>
          {job.applicationDeadline && (
            <p className="text-sm text-gray-500 mt-2">
              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
            </p>
          )}
        </div>

      </div>
    </div>
  )
} 