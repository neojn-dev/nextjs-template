/**
 * HOME PAGE COMPONENT
 * 
 * This is the root page (/) of the application.
 * 
 * WHAT IT DOES:
 * - Redirects unauthenticated users to the signin page
 * - Acts as a landing page redirect
 * 
 * WHY REDIRECT?
 * - This application is authenticated-only
 * - No public home page content
 * - All users must sign in to access the app
 * - Simplifies routing (one entry point)
 * 
 * ROUTING FLOW:
 * 1. User visits "/"
 * 2. This page redirects to "/signin"
 * 3. User signs in
 * 4. User is redirected to "/dashboard"
 * 
 * SERVER COMPONENT:
 * This is a Server Component (no "use client" directive).
 * - Runs on server only
 * - Can use redirect() directly
 * - No client-side JavaScript needed
 * - Faster initial load
 * 
 * REDIRECT BEHAVIOR:
 * - redirect() throws a NEXT_REDIRECT error internally
 * - Next.js catches this and performs the redirect
 * - This is normal behavior (not an actual error)
 * - Happens before page renders
 */

import { redirect } from 'next/navigation'

/**
 * HOME PAGE COMPONENT
 * 
 * Simple redirect component that sends users to signin page.
 * 
 * REASON:
 * Since this is an authenticated-only application,
 * there's no public home page. All users must sign in first.
 * 
 * ALTERNATIVE APPROACHES:
 * - Could show landing page for unauthenticated users
 * - Could check session and redirect accordingly
 * - Could show marketing content
 * 
 * CURRENT APPROACH:
 * Simple redirect to signin page for all users.
 * Clean and straightforward for authenticated-only apps.
 */
export default function HomePage() {
  /**
   * REDIRECT TO SIGNIN PAGE
   * 
   * redirect() is a Next.js Server Action that:
   * - Throws a special error internally (NEXT_REDIRECT)
   * - Next.js catches this and performs redirect
   * - Happens before page renders (server-side)
   * - Returns 307 Temporary Redirect status code
   * 
   * WHY THIS APPROACH?
   * - Simple and clean
   * - No client-side JavaScript needed
   * - Faster than client-side redirect
   * - Works for all users (authenticated or not)
   */
  redirect('/signin')
}
