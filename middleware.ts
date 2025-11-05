/**
 * NEXT.JS MIDDLEWARE - Authentication & Authorization
 * 
 * This middleware runs on the Edge Runtime before requests reach your pages.
 * It handles authentication and authorization checks.
 * 
 * WHAT IS MIDDLEWARE?
 * - Runs on Edge Runtime (faster than Node.js runtime)
 * - Executes before page rendering
 * - Can redirect, rewrite, or modify requests
 * - Runs on every request matching the matcher pattern
 * 
 * FLOW OVERVIEW:
 * 1. Request comes in
 * 2. Middleware checks if route matches matcher pattern
 * 3. Checks authentication status (token)
 * 4. Redirects unauthenticated users to signin
 * 5. Allows authenticated users to proceed
 * 
 * SECURITY FEATURES:
 * - Protects routes before they're accessed
 * - Redirects unauthenticated users
 * - Allows public routes (auth pages)
 * - Role-based access control (handled in pages)
 * 
 * PROTECTED ROUTES:
 * - /dashboard: Dashboard (requires auth)
 * - /doctors: Doctor records (requires auth)
 * - /engineers: Engineer records (requires auth)
 * - /teachers: Teacher records (requires auth)
 * - /lawyers: Lawyer records (requires auth)
 * 
 * PUBLIC ROUTES:
 * - /signin: Sign in page (no auth required)
 * - /signup: Sign up page (no auth required)
 * - /verify: Email verification (no auth required)
 * - /forgot-password: Password reset request (no auth required)
 * - /reset-password: Password reset completion (no auth required)
 * 
 * HOW IT WORKS:
 * 1. withAuth() wraps middleware function
 * 2. authorized callback checks if user has token
 * 3. If no token and route is protected → redirect to /signin
 * 4. If token exists or route is public → allow access
 */

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * MIDDLEWARE FUNCTION
 * 
 * Handles request processing and redirects.
 * 
 * PROCESS:
 * 1. Check if route is protected
 * 2. Check if user has token
 * 3. Redirect to signin if no token
 * 4. Allow access if token exists
 * 
 * @param req - Next.js request object with NextAuth token
 * @returns NextResponse (redirect or continue)
 */
export default withAuth(
  function middleware(req) {
    /**
     * PROTECTED ROUTES CHECK
     * 
     * Checks if current route is protected (requires authentication).
     * Protected routes include:
     * - Dashboard
     * - Master data pages (doctors, engineers, teachers, lawyers)
     * 
     * WHY THIS CHECK?
     * - Provides extra layer of security
     * - Ensures token exists before allowing access
     * - Handles edge cases where token might be missing
     */
    if (req.nextUrl.pathname.startsWith("/dashboard") || 
        req.nextUrl.pathname.startsWith("/doctors") ||
        req.nextUrl.pathname.startsWith("/engineers") ||
        req.nextUrl.pathname.startsWith("/teachers") ||
        req.nextUrl.pathname.startsWith("/lawyers")) {
      
      /**
       * TOKEN CHECK
       * 
       * If no token found, redirect to signin page.
       * This prevents unauthenticated access to protected routes.
       */
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL("/signin", req.url))
      }
    }
    
    /**
     * ALLOW REQUEST TO CONTINUE
     * 
     * If route is public or user is authenticated, allow access.
     * Request proceeds to the page component.
     */
    return NextResponse.next()
  },
  {
    /**
     * AUTHORIZED CALLBACK
     * 
     * Determines if user is authorized to access the route.
     * 
     * LOGIC:
     * 1. Public routes (auth pages): Always allow (return true)
     * 2. Protected routes: Require token (return !!token)
     * 3. Other routes: Allow access (return true)
     * 
     * @param token - NextAuth token (null if not authenticated)
     * @param req - Request object with route information
     * @returns Boolean indicating if access is allowed
     */
    callbacks: {
      authorized: ({ token, req }) => {
        /**
         * PUBLIC ROUTES (AUTH PAGES)
         * 
         * Always allow access to authentication pages.
         * Users need to access these pages even when not logged in.
         * 
         * ROUTES:
         * - /signin: Sign in page
         * - /signup: Sign up page
         * - /verify: Email verification
         * - /forgot-password: Password reset request
         * - /reset-password: Password reset completion
         */
        if (req.nextUrl.pathname.startsWith("/signin") || 
            req.nextUrl.pathname.startsWith("/signup") ||
            req.nextUrl.pathname.startsWith("/verify") ||
            req.nextUrl.pathname.startsWith("/forgot-password") ||
            req.nextUrl.pathname.startsWith("/reset-password")) {
          return true // Always allow access to auth pages
        }
        
        /**
         * PROTECTED ROUTES
         * 
         * Require authentication token for access.
         * 
         * ROUTES:
         * - /dashboard: Dashboard (requires auth)
         * - /doctors: Doctor records (requires auth)
         * - /engineers: Engineer records (requires auth)
         * - /teachers: Teacher records (requires auth)
         * - /lawyers: Lawyer records (requires auth)
         * 
         * !!token converts token to boolean:
         * - null/undefined → false (not authenticated)
         * - object → true (authenticated)
         */
        if (req.nextUrl.pathname.startsWith("/dashboard") || 
            req.nextUrl.pathname.startsWith("/doctors") ||
            req.nextUrl.pathname.startsWith("/engineers") ||
            req.nextUrl.pathname.startsWith("/teachers") ||
            req.nextUrl.pathname.startsWith("/lawyers")) {
          return !!token // Require token for protected routes
        }
        
        /**
         * OTHER ROUTES
         * 
         * Allow access to other routes (not explicitly protected).
         * This provides flexibility for routes that don't need authentication.
         */
        return true // Allow access to other routes
      },
    },
  }
)

/**
 * MIDDLEWARE CONFIGURATION
 * 
 * Defines which routes the middleware should run on.
 * 
 * MATCHER PATTERN:
 * - Uses pathname patterns to match routes
 * - :path* matches all sub-routes
 * - Only matched routes trigger middleware
 * 
 * PERFORMANCE:
 * - Only runs on matched routes (faster)
 * - Reduces unnecessary processing
 * - Edge Runtime optimization
 * 
 * ROUTES MATCHED:
 * - Protected routes: /dashboard, /doctors, /engineers, /teachers, /lawyers
 * - Auth routes: /signin, /signup, /verify, /forgot-password, /reset-password
 */
export const config = {
  matcher: [
    "/dashboard/:path*",      // Dashboard and all sub-routes
    "/doctors/:path*",        // Doctors and all sub-routes
    "/engineers/:path*",      // Engineers and all sub-routes
    "/teachers/:path*",       // Teachers and all sub-routes
    "/lawyers/:path*",        // Lawyers and all sub-routes
    "/signin",                // Sign in page
    "/signup",                // Sign up page
    "/verify",                // Email verification page
    "/forgot-password",       // Password reset request page
    "/reset-password"         // Password reset completion page
  ]
}
