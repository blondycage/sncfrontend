"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/toast"
import { ApiError } from "@/lib/api"

interface EmailLoginFormProps {
  onSuccess?: (token: string, user: any) => void
  className?: string
}

export default function EmailLoginForm({ onSuccess, className }: EmailLoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}
    
    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent form submission immediately
    e.preventDefault()
    
    // Clear any previous errors
    setError("")
    setFieldErrors({})
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await login(formData.email, formData.password)

      // Show success toast
      toast({
        title: "Login Successful! 🎉",
        description: "Welcome back! Redirecting to your dashboard...",
        variant: "success",
        duration: 3000,
      })

      // Call success callback if provided
      if (onSuccess) {
        const token = localStorage.getItem("authToken")
        const user = localStorage.getItem("user")
        onSuccess(token || "", user ? JSON.parse(user) : null)
      }

      // Use router.replace instead of push to prevent adding to history
      setTimeout(() => {
        router.replace("/dashboard")
      }, 1000)

    } catch (error) {
      console.error("Login error:", error)
      
      let errorMessage = "Login failed. Please try again."
      
      if (error instanceof ApiError) {
        if (error.status === 401) {
          errorMessage = "Invalid email or password"
        } else if (error.status === 400) {
          errorMessage = error.message || "Invalid login data"
        } else if (error.status === 423) {
          errorMessage = "Account is temporarily locked. Please try again later."
        } else {
          errorMessage = error.message || "Login failed"
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = "Network error. Please check your connection and try again."
      }

      // Show error toast
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "error",
        duration: 5000,
      })

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Clear general error
    if (error) {
      setError("")
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-4 ${className}`}
      method="POST"
      action="#"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`pl-10 ${fieldErrors.email ? "border-red-500" : ""}`}
            disabled={isLoading}
            required
          />
        </div>
        {fieldErrors.email && (
          <p className="text-sm text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`pl-10 pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-sm text-red-500">{fieldErrors.password}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link 
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
} 