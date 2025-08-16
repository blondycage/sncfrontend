import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import TelegramLoginButton from "@/components/telegram-login-button"
import EmailRegisterForm from "@/components/auth/email-register-form"

export const metadata: Metadata = {
  title: "Register - SNC",
  description: "Create your SNC account",
}

export default function RegisterPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-8">
      <Card className="mx-auto w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join SNC to start listing and discovering amazing opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="telegram">Telegram</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <EmailRegisterForm />
            </TabsContent>
            
            <TabsContent value="telegram" className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Register with your Telegram account for quick and secure access
                </p>
                <TelegramLoginButton botName="bot7906063270" className="w-full" />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in to your account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
