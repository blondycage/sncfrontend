"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Test page to view and manage mock data
export default function TestPage() {
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, listingsRes] = await Promise.all([fetch("/api/mock/users"), fetch("/api/mock/listings")])

      const usersData = await usersRes.json()
      const listingsData = await listingsRes.json()

      setUsers(usersData)
      setListings(listingsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetMockData = async () => {
    try {
      await fetch("/api/mock/reset", { method: "POST" })
      fetchData()
    } catch (error) {
      console.error("Error resetting data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SNC Test Dashboard</h1>
          <p className="text-muted-foreground">View and manage mock data for testing</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={fetchData} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={resetMockData} variant="destructive">
            Reset Mock Data
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Loading data...</p>
        </div>
      ) : (
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.length > 0 ? (
                users.map((user: any) => (
                  <Card key={user.telegramId}>
                    <CardHeader>
                      <CardTitle>
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <CardDescription>@{user.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Telegram ID:</span>
                          <span>{user.telegramId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Created:</span>
                          <span>{new Date(user.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Last Login:</span>
                          <span>{new Date(user.lastLogin).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>No Users</CardTitle>
                    <CardDescription>No users have been created yet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Try logging in with the Telegram button to create a test user</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.length > 0 ? (
                listings.map((listing: any) => (
                  <Card key={listing.id}>
                    <CardHeader>
                      <CardTitle>{listing.title}</CardTitle>
                      <CardDescription>{listing.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Category:</span>
                          <span>{listing.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Location:</span>
                          <span>{listing.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Created:</span>
                          <span>{new Date(listing.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>No Listings</CardTitle>
                    <CardDescription>No listings have been created yet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Create a listing to see it here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
