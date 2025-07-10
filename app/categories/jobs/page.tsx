import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign } from "lucide-react"

// Mock job listings
const jobs = [
  {
    id: "job1",
    title: "Hotel Manager",
    company: "Luxury Resort & Spa",
    description: "Experienced hotel manager needed for a 5-star resort in Kyrenia",
    salary: "$3,500-$4,500/month",
    location: "Kyrenia",
    type: "Full-time",
    image: "/images/job-1.jpg",
    posted: "2 days ago",
    featured: true,
  },
  {
    id: "job2",
    title: "Software Developer",
    company: "Tech Solutions Ltd",
    description: "Looking for a skilled software developer with React and Node.js experience",
    salary: "$2,800-$3,800/month",
    location: "Nicosia",
    type: "Full-time",
    image: "/images/job-2.jpg",
    posted: "1 week ago",
    featured: false,
  },
  {
    id: "job3",
    title: "Restaurant Chef",
    company: "Mediterranean Cuisine",
    description: "Experienced chef needed for a popular restaurant in Famagusta",
    salary: "$2,200-$2,800/month",
    location: "Famagusta",
    type: "Full-time",
    image: "/images/job-3.jpg",
    posted: "3 days ago",
    featured: false,
  },
  {
    id: "job4",
    title: "English Teacher",
    company: "International School",
    description: "Certified English teacher needed for an international school",
    salary: "$2,000-$2,500/month",
    location: "Kyrenia",
    type: "Full-time",
    image: "/images/job-4.jpg",
    posted: "5 days ago",
    featured: false,
  },
  {
    id: "job5",
    title: "Marketing Specialist",
    company: "Global Brands Agency",
    description: "Marketing specialist with digital marketing experience needed",
    salary: "$2,500-$3,200/month",
    location: "Nicosia",
    type: "Full-time",
    image: "/images/job-5.jpg",
    posted: "1 day ago",
    featured: true,
  },
  {
    id: "job6",
    title: "Tour Guide",
    company: "Cyprus Adventures",
    description: "Knowledgeable tour guide with language skills needed for tourist groups",
    salary: "$1,800-$2,200/month",
    location: "Famagusta",
    type: "Seasonal",
    image: "/images/job-6.jpg",
    posted: "2 weeks ago",
    featured: false,
  },
]

export default function JobsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Jobs & Opportunities</h1>
        <p className="mt-2 text-muted-foreground">Find your dream job in North Cyprus</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          All Jobs
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Full-time
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Part-time
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Kyrenia
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Famagusta
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
          Nicosia
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <div className="relative">
              <img src={job.image || "/placeholder.svg"} alt={job.title} className="aspect-video w-full object-cover" />
              {job.featured && (
                <div className="absolute left-2 top-2">
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">Featured</Badge>
                </div>
              )}
              <div className="absolute right-2 top-2">
                <Badge className="bg-primary">{job.type}</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <div className="text-sm font-medium">{job.company}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {job.location}
              </div>
              <CardDescription>{job.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="text-sm">{job.salary}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span className="text-sm">Posted {job.posted}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
