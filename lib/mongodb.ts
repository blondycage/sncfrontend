const MONGODB_URI = process.env.MONGODB_URI || ""
const MONGODB_DB = process.env.MONGODB_DB || "snc"

// Mock database for testing
const mockUsers: any[] = []
const mockListings: any[] = []

// Mock database implementation
export async function connectToDatabase() {
  // MOCK DATABASE IMPLEMENTATION
  // Comment out the real MongoDB implementation below when ready to use actual MongoDB

  console.log("Using mock database for testing")

  const mockDb = {
    collection: (collectionName: string) => {
      // Return mock collection methods
      return {
        findOne: async (query: any) => {
          if (collectionName === "users") {
            return mockUsers.find((user) => user.telegramId === query.telegramId) || null
          }
          return null
        },
        insertOne: async (document: any) => {
          if (collectionName === "users") {
            mockUsers.push(document)
            console.log("Mock user created:", document)
            return { insertedId: Date.now().toString() }
          }
          return { insertedId: Date.now().toString() }
        },
        updateOne: async (query: any, update: any) => {
          if (collectionName === "users") {
            const userIndex = mockUsers.findIndex((user) => user.telegramId === query.telegramId)
            if (userIndex !== -1) {
              mockUsers[userIndex] = { ...mockUsers[userIndex], ...update.$set }
              console.log("Mock user updated:", mockUsers[userIndex])
            }
            return { modifiedCount: userIndex !== -1 ? 1 : 0 }
          }
          return { modifiedCount: 0 }
        },
        find: async (query: any) => {
          if (collectionName === "users") {
            return {
              toArray: async () =>
                mockUsers.filter((user) => !query || Object.keys(query).every((key) => user[key] === query[key])),
            }
          } else if (collectionName === "listings") {
            return {
              toArray: async () =>
                mockListings.filter(
                  (listing) => !query || Object.keys(query).every((key) => listing[key] === query[key]),
                ),
            }
          }
          return { toArray: async () => [] }
        },
      }
    },
  }

  return { client: null, db: mockDb }

  /* REAL MONGODB IMPLEMENTATION - Uncomment when ready to use actual MongoDB
  // Check if MongoDB URI is defined
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  // Check if MongoDB DB is defined
  if (!MONGODB_DB) {
    throw new Error("Please define the MONGODB_DB environment variable")
  }

  let cachedClient: MongoClient | null = null
  let cachedDb: any = null

  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Create a new MongoDB client
  const client = new MongoClient(MONGODB_URI)

  // Connect to the client
  await client.connect()

  // Get the database
  const db = client.db(MONGODB_DB)

  // Cache the client and db connections
  cachedClient = client
  cachedDb = db

  return { client, db }
  */
}

// Helper function to get all mock users (for testing only)
export async function getMockUsers() {
  return [...mockUsers]
}

// Helper function to get all mock listings (for testing only)
export async function getMockListings() {
  return [...mockListings]
}

// Helper function to add a mock listing (for testing only)
export async function addMockListing(listing: any) {
  const newListing = {
    ...listing,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  mockListings.push(newListing)
  return newListing
}

// Helper function to clear mock data (for testing only)
export async function clearMockData() {
  mockUsers.length = 0
  mockListings.length = 0
}
