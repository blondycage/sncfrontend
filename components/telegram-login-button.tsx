'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface TelegramLoginButtonProps {
  botName: string
  className?: string
}

export default function TelegramLoginButton({ botName, className }: TelegramLoginButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleTelegramLogin = async () => {
    setLoading(true)
    
    try {
      // Show info toast
      toast({
        title: "Opening Telegram...",
        description: "Please complete authentication in the Telegram app",
        variant: "info",
        duration: 3000,
      })
      
      // Generate a unique auth code
      const authCode = Math.random().toString(36).substring(2, 15)
      
      // Store the auth code
      sessionStorage.setItem('telegram_auth_code', authCode)
      
      // Open Telegram with the bot
      const telegramUrl = `https://t.me/${botName}?start=${authCode}`
      window.open(telegramUrl, '_blank')
      
    } catch (error) {
      console.error('Error opening Telegram:', error)
      toast({
        title: "Error",
        description: "Failed to open Telegram. Please try again.",
        variant: "error",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleTelegramLogin}
      disabled={loading}
      className={className}
      variant="outline"
    >
      {loading ? (
        <>
          <Send className="mr-2 h-4 w-4 animate-pulse" />
          Connecting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Login with Telegram
        </>
      )}
    </Button>
  )
} 