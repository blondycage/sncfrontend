import Link from "next/link"
import { Facebook, Instagram, Send } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-white py-6">
      <div className="container flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">SNC</span>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://www.instagram.com/searchnorthcyprus?igsh=NXlkeXAwZDN4anF4" aria-label="Instagram">
            <Instagram className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <Link href="https://t.me/searchnorthcyprus" aria-label="Telegram">
            <Send className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <Link href="https://www.facebook.com/share/1a4bjuJ6iR/?mibextid=wwXIfr" aria-label="Facebook">
            <Facebook className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
