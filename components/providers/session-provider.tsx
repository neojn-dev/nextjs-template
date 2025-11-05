/**
 * SESSION PROVIDER WRAPPER COMPONENT
 * 
 * This component wraps the NextAuth SessionProvider to make session data
 * available to all client components in the application.
 * 
 * WHY DO WE NEED THIS?
 * NextAuth.js provides session data via React Context. This wrapper:
 * - Makes session data available throughout the app
 * - Handles session refresh automatically
 * - Provides session to client components via useSession() hook
 * 
 * HOW IT WORKS:
 * 1. Wraps entire app in root layout (app/layout.tsx)
 * 2. Provides session context to all child components
 * 3. Automatically refreshes session periodically
 * 4. Refreshes session when user returns to tab/window
 * 
 * CLIENT COMPONENT:
 * This must be a client component because:
 * - NextAuth SessionProvider is a client-side component
 * - Uses React Context API (client-side only)
 * - Manages browser-based session state
 * 
 * USAGE IN OTHER COMPONENTS:
 * ```typescript
 * import { useSession } from 'next-auth/react'
 * 
 * function MyComponent() {
 *   const { data: session } = useSession()
 *   return <div>Hello {session?.user?.name}</div>
 * }
 * ```
 * 
 * CONFIGURATION OPTIONS:
 * - refetchInterval: How often to refresh session (5 minutes)
 * - refetchOnWindowFocus: Refresh when user returns to tab
 * - basePath: NextAuth API route path
 */

"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

/**
 * Props interface for SessionProviderWrapper
 */
interface SessionProviderWrapperProps {
  children: ReactNode // Child components that need access to session
}

/**
 * SESSION PROVIDER WRAPPER
 * 
 * Wraps children with NextAuth SessionProvider to enable session access.
 * 
 * @param children - Child components that need session access
 * 
 * CONFIGURATION EXPLAINED:
 * 
 * refetchInterval={5 * 60}
 * - Refetches session every 5 minutes (300 seconds)
 * - Keeps session data fresh without user action
 * - Prevents stale session data
 * 
 * refetchOnWindowFocus={true}
 * - Refetches session when user returns to the browser tab
 * - Ensures session is current after user was away
 * - Useful if session was revoked while tab was inactive
 * 
 * basePath="/api/auth"
 * - Explicitly sets NextAuth API route path
 * - Ensures consistency across environments
 * - Defaults to /api/auth if not specified
 */
export function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes (300 seconds)
      refetchOnWindowFocus={true} // Refetch when user returns to browser tab
      basePath="/api/auth" // NextAuth API route path
    >
      {children}
    </SessionProvider>
  )
}

