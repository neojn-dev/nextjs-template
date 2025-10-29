import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow access to all authenticated users for the app routes
    if (req.nextUrl.pathname.startsWith("/dashboard") || 
        req.nextUrl.pathname.startsWith("/doctors") ||
        req.nextUrl.pathname.startsWith("/engineers") ||
        req.nextUrl.pathname.startsWith("/teachers") ||
        req.nextUrl.pathname.startsWith("/lawyers")) {
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL("/signin", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/signin") || 
            req.nextUrl.pathname.startsWith("/signup") ||
            req.nextUrl.pathname.startsWith("/verify") ||
            req.nextUrl.pathname.startsWith("/forgot-password") ||
            req.nextUrl.pathname.startsWith("/reset-password") ||
            req.nextUrl.pathname.startsWith("/change-password")) {
          return true
        }
        
        // Require token for protected routes
        if (req.nextUrl.pathname.startsWith("/dashboard") || 
            req.nextUrl.pathname.startsWith("/doctors") ||
            req.nextUrl.pathname.startsWith("/engineers") ||
            req.nextUrl.pathname.startsWith("/teachers") ||
            req.nextUrl.pathname.startsWith("/lawyers")) {
          return !!token
        }
        
        // Allow access to other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/doctors/:path*", 
    "/engineers/:path*",
    "/teachers/:path*",
    "/lawyers/:path*",
    "/signin",
    "/signup", 
    "/verify",
    "/forgot-password",
    "/reset-password",
    "/change-password/:path*"
  ]
}
