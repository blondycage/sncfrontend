import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SearchSection() {
  return (
    <div className="container px-4 py-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 rounded-lg border bg-white p-6 shadow-sm md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">WHAT ARE YOU LOOKING FOR?</label>
          <Input placeholder="Services, rentals, jobs..." className="w-full" />
          <p className="text-xs text-muted-foreground">Search anything you need</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">CATEGORY</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="properties">Properties</SelectItem>
              <SelectItem value="jobs">Jobs</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select a specific category</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">LOCATION</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="kyrenia">Kyrenia</SelectItem>
              <SelectItem value="famagusta">Famagusta</SelectItem>
              <SelectItem value="nicosia">Nicosia</SelectItem>
              <SelectItem value="karpaz">Karpaz Peninsula</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select a specific region</p>
        </div>
      </div>
      <div className="mx-auto mt-4 flex max-w-5xl justify-end">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">GET NOTIFIED</h3>
            <p className="text-sm">At Launch</p>
            <p className="text-xs text-muted-foreground">Be the first to know</p>
          </div>
          <Button className="mt-2 w-full">Notify Me →</Button>
        </div>
      </div>
    </div>
  )
}
