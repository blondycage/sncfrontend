import { NextResponse } from "next/server"
import { getMockListings, addMockListing } from "@/lib/mongodb"

// GET all listings
export async function GET() {
  try {
    const listings = await getMockListings()
    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

// POST a new listing
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 })
    }

    const newListing = await addMockListing({
      ...data,
      createdAt: new Date(),
    })

    return NextResponse.json(newListing, { status: 201 })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
