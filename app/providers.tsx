"use client";

import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ToastProvider>
  );
} 
