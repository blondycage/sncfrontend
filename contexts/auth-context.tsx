"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authApi, ApiError } from "@/lib/api"
import { useRouter } from "next/navigation"
// Helper function to set cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
}

// Helper function to delete cookies
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
}

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
  isVerified: boolean
  uploadQuota?: {
    freeUploadsUsed: number
    freeUploadsLimit: number
    paidUploadsRemaining: number
    canUpload: boolean
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
  }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const isAuthenticated = !!user && !!token

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedToken = localStorage.getItem("authToken")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error loading user from storage:", error)
        // Clear corrupted data
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  // Verify token on mount and when token changes
  useEffect(() => {
    const verifyToken = async () => {
      if (token && !isLoading) {
        try {
          const response = await authApi.getProfile(token)
          if (response.success && response.user) {
            setUser(response.user)
          } else {
            // Token is invalid
            logout()
          }
        } catch (error) {
          console.error("Token verification failed:", error)
          logout()
        }
      }
    }

    verifyToken()
  }, [token, isLoading])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })

      if (response.success && response.token && response.user) {
        setToken(response.token)
        setUser(response.user)
      
        // Store in localStorage
        localStorage.setItem("authToken", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))
        
        // Set cookies for middleware
        setCookie("token", response.token)
        setCookie("user", JSON.stringify(response.user))
        if (response.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
       // console.log("Login failed", response)
        throw new Error(response.message || response.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
  }) => {
    try {
      const response = await authApi.register(userData)

      if (response.success && response.token && response.user) {
        setToken(response.token)
        setUser(response.user)

        // Store in localStorage
        localStorage.setItem("authToken", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))
        
        // Set cookies for middleware
        setCookie("token", response.token)
        setCookie("user", JSON.stringify(response.user))
      } else {
        throw new Error(response.message || response.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    // Clear localStorage
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    
    // Clear cookies
    deleteCookie("token")
    deleteCookie("user")

    // Optional: Call logout endpoint
    if (token) {
      authApi.logout().catch(console.error)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      
      // Update user cookie as well
      setCookie("user", JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    setToken,
    setUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 