"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, XCircle, Send, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const USER_ROLES = [
  "Student",
  "Local", 
  "Foreigner",
  "Worker",
  "Business Owner",
  "Agent",
  "Owner"
]

// Helper function to set cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
}

export default function TelegramAuthPage() {
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [telegramData, setTelegramData] = useState<any>(null)
  const [authState, setAuthState] = useState<"loading" | "role_selection" | "processing" | "success" | "error">("loading")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Extract Telegram auth data from URL parameters
    const extractTelegramData = () => {
      const params = new URLSearchParams(window.location.search)
      
      // Check if we have Telegram auth data
      const id = params.get("id")
      const firstName = params.get("first_name")
      const authDate = params.get("auth_date")
      const hash = params.get("hash")

      if (id && firstName && authDate && hash) {
        // Real Telegram authentication data
        const data = {
          id,
          first_name: firstName,
          last_name: params.get("last_name") || "",
          username: params.get("username") || "",
          photo_url: params.get("photo_url") || "",
          auth_date: authDate,
          hash: hash
        }

        console.log("Real Telegram auth data received:", data)
        setTelegramData(data)
        setAuthState("role_selection")
      } else {
        // No valid Telegram data found
        setError("Invalid Telegram authentication data")
        setAuthState("error")
      }
      
      setLoading(false)
    }

    extractTelegramData()
  }, [])

  const handleRoleSubmit = async () => {
    if (!selectedRole || !telegramData) return

    setAuthState("processing")
    
    try {
      const response = await authApi.telegramAuth({
        ...telegramData,
        role: selectedRole
      })

      console.log("Telegram auth response:", response)
      
      if (response.success) {
        setAuthState("success")
        
        // Store auth data
        if (response.token) {
          localStorage.setItem("authToken", response.token)
          
          // Set cookies for middleware
          setCookie("token", response.token)
        }
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user))
          
          // Set cookies for middleware
          setCookie("user", JSON.stringify(response.user))
        }
        
        // Redirect to dashboard after success
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        throw new Error(response.message || "Authentication failed")
      }
    } catch (error) {
      console.error("Telegram auth error:", error)
      setError(error instanceof Error ? error.message : "Authentication failed")
      setAuthState("error")
    }
  }

  const handleRetry = () => {
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading Telegram authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (authState === "role_selection") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome, {telegramData?.first_name}!
            </CardTitle>
            <CardDescription>
              Please select your role to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="role">Select Your Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleRoleSubmit}
              className="w-full"
              disabled={!selectedRole}
            >
              <Send className="mr-2 h-4 w-4" />
              Complete Registration
            </Button>
            
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (authState === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Completing Registration
            </CardTitle>
            <CardDescription>
              Please wait while we set up your account...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (authState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Registration Successful!
            </CardTitle>
            <CardDescription>
              You have successfully registered with Telegram. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (authState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication Failed
            </CardTitle>
            <CardDescription>
              There was an error authenticating with Telegram.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
} 