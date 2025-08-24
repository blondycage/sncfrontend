"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface TelegramChatWidgetProps {
  botUsername: string
  className?: string
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
}

// Helper function to set cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
}

export default function TelegramChatWidget({
  botUsername,
  className = "",
  onSuccess,
  onError
}: TelegramChatWidgetProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'start' | 'waiting' | 'code'>('start')
  const [chatId, setChatId] = useState("")
  const [authCode, setAuthCode] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const startTelegramAuth = async () => {
    setLoading(true)
    setError("")
    setStep('waiting')
    
    try {
      // Generate a unique auth code
      const code = Math.random().toString(36).substring(2, 15)
      setAuthCode(code)
      
      // Store the auth code temporarily
      sessionStorage.setItem('telegram_auth_code', code)
      
      // Show info toast
      toast({
        title: "Opening Telegram...",
        description: "Please complete authentication in the Telegram app",
        variant: "info",
        duration: 3000,
      })
      
      // Open Telegram chat
      const telegramUrl = `https://t.me/${botUsername}?start=${code}`
      window.open(telegramUrl, '_blank')
      
      // Start polling for authentication
      pollForAuth(code)
      
    } catch (err) {
      console.error('Error starting Telegram auth:', err)
      const errorMessage = 'Failed to start authentication process'
      setError(errorMessage)
      setStep('start')
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "error",
        duration: 5000,
      })
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const pollForAuth = async (code: string) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    
    const poll = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.success && data.authenticated) {
            // Authentication successful
            localStorage.setItem('authToken', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            
            // Set cookies for middleware
            setCookie('token', data.token)
            setCookie('user', JSON.stringify(data.user))
            
            setSuccess(true)
            sessionStorage.removeItem('telegram_auth_code')
            
            // Show success toast
            toast({
              title: "Authentication Successful! 🎉",
              description: "Welcome! Redirecting to your dashboard...",
              variant: "success",
              duration: 3000,
            })
            
            if (onSuccess) {
              onSuccess(data.user)
            }

            setTimeout(() => {
              router.push('/dashboard')
            }, 1500)
            
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          const errorMessage = 'Authentication timeout. Please try again.'
          setError(errorMessage)
          setStep('start')
          
          toast({
            title: "Authentication Timeout",
            description: errorMessage,
            variant: "error",
            duration: 5000,
          })
        }
        
      } catch (err) {
        console.error('Polling error:', err)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          const errorMessage = 'Authentication failed. Please try again.'
          setError(errorMessage)
          setStep('start')
          
          toast({
            title: "Authentication Failed",
            description: errorMessage,
            variant: "error",
            duration: 5000,
          })
        }
      }
    }

    poll()
  }

  const handleManualAuth = async () => {
    if (!chatId.trim()) {
      const errorMessage = 'Please enter your Chat ID'
      setError(errorMessage)
      toast({
        title: "Missing Information",
        description: errorMessage,
        variant: "warning",
        duration: 3000,
      })
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chatId: chatId.trim(),
          code: authCode 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const data = await response.json()
      
      if (data.success && data.token) {
        // Store authentication data
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Set cookies for middleware
        setCookie('token', data.token)
        setCookie('user', JSON.stringify(data.user))
        
        setSuccess(true)
        sessionStorage.removeItem('telegram_auth_code')
        
        // Show success toast
        toast({
          title: "Authentication Successful! 🎉",
          description: "Welcome! Redirecting to your dashboard...",
          variant: "success",
          duration: 3000,
        })
        
        if (onSuccess) {
          onSuccess(data.user)
        }

        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        throw new Error(data.error || 'Authentication failed')
      }
    } catch (err) {
      console.error('Manual auth error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "error",
        duration: 5000,
      })
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Authentication Successful!
          </CardTitle>
          <CardDescription>
            Welcome! Redirecting you to your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Login with Telegram
        </CardTitle>
        <CardDescription>
          Authenticate securely using your Telegram account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'start' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Click the button below to start authentication with Telegram
            </p>
            <Button 
              onClick={startTelegramAuth}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Open Telegram Chat
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'waiting' && (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">
                Waiting for Telegram authentication...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Complete the authentication in the Telegram app
              </p>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                Having trouble? Try manual authentication:
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep('code')}
                className="w-full"
              >
                Use Chat ID Instead
              </Button>
            </div>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="chatId">Your Chat ID</Label>
              <Input
                id="chatId"
                type="text"
                placeholder="Enter your Telegram Chat ID"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Send /getchatid to @{botUsername} to get your Chat ID
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleManualAuth}
                disabled={loading || !chatId.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Authenticate"
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setStep('waiting')}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
