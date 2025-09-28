import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TawkChat from "@/components/tawk-chat"
import { Providers } from "./providers"

const lexend = Lexend({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SNC - Your Ad Listing Platform", 
  description: "Find and post ads with Telegram authentication",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={lexend.className}>
        <Providers>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1 min-w-0">{children}</main>
            <Footer />
          </div>
          <TawkChat />
        </Providers>
      </body>
    </html>
  )
}
