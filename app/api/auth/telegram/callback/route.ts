import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const userCookie = cookieStore.get("user")

    if (!userCookie?.value) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)

    // Connect to database (mock or real)
    const { db } = await connectToDatabase()

    // Check if user exists
    const existingUser = await db.collection("users").findOne({
      telegramId: user.telegramId,
    })

    if (existingUser) {
      // Update user information
      await db.collection("users").updateOne(
        { telegramId: user.telegramId },
        {
          $set: {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
            lastLogin: new Date(),
          },
        },
      )
      console.log("User updated:", user.telegramId)
    } else {
      // Create new user
      await db.collection("users").insertOne({
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        createdAt: new Date(),
        lastLogin: new Date(),
        city: "",
        fullName: "",
        // Add other fields as needed
      })
      console.log("New user created:", user.telegramId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in Telegram callback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
