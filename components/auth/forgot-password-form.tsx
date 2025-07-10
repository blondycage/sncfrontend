"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { authApi, ApiError } from "@/lib/api"

interface ForgotPasswordFormProps {
  className?: string
}

export default function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required"
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address"
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    
    const emailValidationError = validateEmail(email)
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.forgotPassword(email.toLowerCase())

      if (response.success) {
        setSuccess(true)
        setEmail("") // Clear form
      } else {
        setError(response.message || response.error || "Failed to send reset email")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setError("No account found with this email address")
        } else if (error.status === 429) {
          setError("Too many requests. Please try again later.")
        } else {
          setError(error.message || "Failed to send reset email")
        }
      } else {
        setError("Network error. Please check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    
    // Clear errors when user starts typing
    if (emailError) {
      setEmailError("")
    }
    if (error) {
      setError("")
    }
    if (success) {
      setSuccess(false)
    }
  }

  if (success) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Email sent successfully!</strong>
            <br />
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </AlertDescription>
        </Alert>
        
        <div className="text-center text-sm text-gray-600">
          Didn't receive the email? Check your spam folder or{" "}
          <button
            onClick={() => {
              setSuccess(false)
              setEmail("")
            }}
            className="text-blue-600 hover:underline"
          >
            try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`pl-10 ${emailError ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
        </div>
        {emailError && (
          <p className="text-sm text-red-500">{emailError}</p>
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
            Sending reset link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  )
} 