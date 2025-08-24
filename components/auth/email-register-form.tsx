"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, Lock, User, Loader2, AtSign } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/toast"
import { ApiError } from "@/lib/api"

interface EmailRegisterFormProps {
  onSuccess?: (token: string, user: any) => void
  className?: string
}

const USER_ROLES = [
  { value: 'Student', label: 'Student' },
  { value: 'Local', label: 'Local Resident' },
  { value: 'Foreigner', label: 'Foreigner' },
  { value: 'Worker', label: 'Worker' },
  { value: 'Business Owner', label: 'Business Owner' },
  { value: 'Agent', label: 'Agent' },
  { value: 'Owner', label: 'Property Owner' },
]

export default function EmailRegisterForm({ onSuccess, className }: EmailRegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
    role?: string
  }>({})

  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const errors: {
      username?: string
      firstName?: string
      lastName?: string
      email?: string
      password?: string
      confirmPassword?: string
      role?: string
    } = {}
    
    if (!formData.username.trim()) {
      errors.username = "Username is required"
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters"
    } else if (formData.username.trim().length > 30) {
      errors.username = "Username cannot exceed 30 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errors.username = "Username can only contain letters, numbers, and underscores"
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters"
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters"
    }
    
    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    if (!formData.role) {
      errors.role = "Please select your role"
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        username: formData.username.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role,
      }
      await register(payload as any)

      // Success toast handled in AuthContext

      // Call success callback if provided
      if (onSuccess) {
        const token = localStorage.getItem("authToken")
        const user = localStorage.getItem("user")
        onSuccess(token || "", user ? JSON.parse(user) : null)
      }

      // Add a small delay to show the toast, then redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)

    } catch (error) {
      console.error("Registration error:", error)
      
      let errorMessage = "Registration failed. Please try again."
      
      if (error instanceof ApiError) {
        if (error.status === 409) {
          errorMessage = "An account with this email or username already exists"
        } else if (error.status === 400) {
          errorMessage = error.message || "Invalid registration data"
        } else {
          errorMessage = error.message || "Registration failed"
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = "Network error. Please check your connection and try again."
      }

      // Show error toast
      toast({
        title: "Registration Failed",
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
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            className={`pl-10 ${fieldErrors.username ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
        </div>
        {fieldErrors.username && (
          <p className="text-sm text-red-500">{fieldErrors.username}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={`pl-10 ${fieldErrors.firstName ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
          </div>
          {fieldErrors.firstName && (
            <p className="text-sm text-red-500">{fieldErrors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={`pl-10 ${fieldErrors.lastName ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
          </div>
          {fieldErrors.lastName && (
            <p className="text-sm text-red-500">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`pl-10 ${fieldErrors.email ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-sm text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => handleInputChange("role", value)}
          disabled={isLoading}
        >
          <SelectTrigger className={fieldErrors.role ? "border-red-500" : ""}>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.role && (
          <p className="text-sm text-red-500">{fieldErrors.role}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`pl-10 pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
            disabled={isLoading}
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className={`pl-10 pr-10 ${fieldErrors.confirmPassword ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
} 
