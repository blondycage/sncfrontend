import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the user and token from cookies
  const userCookie = request.cookies.get("user")?.value
  const tokenCookie = request.cookies.get("token")?.value

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/create-listing"]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // For protected routes, check if user is authenticated
  // Require BOTH user and token cookies to avoid false positives with stale tokens
  const isAuthenticated = Boolean(userCookie && tokenCookie)

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (
    isAuthenticated &&
    (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/register"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/create-listing/:path*", "/auth/login", "/auth/register"],
}
