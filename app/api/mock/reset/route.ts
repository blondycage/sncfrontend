import { NextResponse } from "next/server"
import { clearMockData } from "@/lib/mongodb"

// POST to reset all mock data (for testing only)
export async function POST() {
  try {
    await clearMockData()
    return NextResponse.json({ success: true, message: "Mock data has been reset" })
  } catch (error) {
    console.error("Error resetting mock data:", error)
    return NextResponse.json({ error: "Failed to reset mock data" }, { status: 500 })
  }
}
