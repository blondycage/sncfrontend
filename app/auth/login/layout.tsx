import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - SNC",
  description: "Sign in to your SNC account",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
