"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { Loader2 } from "lucide-react"

interface NotificationSectionProps {
  source?: 'homepage' | 'search_page' | 'listing_page'
}

export default function NotificationSection({ source = 'homepage' }: NotificationSectionProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "error"
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('📧 Newsletter subscription attempt:', { email, source })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/subscribers/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source,
          preferences: {
            newsletter: true,
            updates: true,
            promotions: false
          }
        })
      })

      const data = await response.json()
      console.log('📧 Newsletter subscription response:', { success: data.success, message: data.message })

      if (response.ok && data.success) {
        toast({
          title: "Success! 🎉",
          description: data.message || "Thank you for subscribing to our newsletter!",
          variant: "success"
        })
        setEmail("")
      } else {
        throw new Error(data.message || 'Subscription failed')
      }
    } catch (error) {
      console.error('❌ Newsletter subscription error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      
      toast({
        title: "Subscription Failed",
        description: errorMessage,
        variant: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold">Sign up for our Newsletter</h2>
          <p className="mt-2 text-muted-foreground">
            Get notified on new updates and gain early access to all features.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex gap-4">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !email.trim()}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Notify Me'
              )}
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
