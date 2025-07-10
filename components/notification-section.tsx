"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NotificationSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle the email submission
    console.log("Email submitted:", email)
    setEmail("")
    // Show success message or toast
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">Be the First to Know</h2>
          <p className="mt-2 text-muted-foreground">
            Get notified when our platform launches and gain early access to all features.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex gap-4">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit">Notify Me</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
