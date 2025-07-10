import { NextResponse } from "next/server"
import { getMockUsers } from "@/lib/mongodb"

// GET all users (for testing only)
export async function GET() {
  try {
    const users = await getMockUsers()

    // Remove sensitive information
    const sanitizedUsers = users.map((user) => ({
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
