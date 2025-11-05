/**
 * NEXTAUTH.JS API ROUTE HANDLER
 * 
 * This is the catch-all route handler for NextAuth.js.
 * It handles all NextAuth.js API requests.
 * 
 * ROUTE PATTERN: [...nextauth]
 * 
 * This catch-all route matches all requests to:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - /api/auth/providers
 * - /api/auth/csrf
 * - And other NextAuth.js endpoints
 * 
 * WHAT IT DOES:
 * - Handles authentication requests (signin, signout)
 * - Manages session creation and validation
 * - Handles OAuth callbacks
 * - Provides CSRF protection
 * - Returns session data
 * - Lists available providers
 * 
 * HOW IT WORKS:
 * 1. NextAuth.js creates a handler with our authOptions
 * 2. Handler processes requests based on NextAuth.js conventions
 * 3. Routes to appropriate handler based on URL path
 * 
 * AUTH OPTIONS:
 * Defined in lib/auth.ts, includes:
 * - CredentialsProvider (username/password)
 * - JWT session strategy
 * - Custom callbacks (jwt, session)
 * - Cookie configuration
 * 
 * RUNTIME CONFIGURATION:
 * Explicitly set to 'nodejs' for Next.js 15 compatibility.
 * Ensures NextAuth.js runs in Node.js runtime (not Edge).
 * 
 * IMPORTANT:
 * - This is the main entry point for NextAuth.js
 * - All authentication flows go through this handler
 * - Don't modify unless you understand NextAuth.js internals
 * 
 * DOCUMENTATION:
 * See https://next-auth.js.org/getting-started/example
 */

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NEXTAUTH HANDLER
 * 
 * Creates NextAuth.js handler with our configuration.
 * This handler processes all NextAuth.js API requests.
 */
const handler = NextAuth(authOptions)

/**
 * EXPORT HANDLERS
 * 
 * NextAuth.js handler supports both GET and POST requests.
 * - GET: Used for session, providers, CSRF token
 * - POST: Used for signin, signout, callbacks
 */
export { handler as GET, handler as POST }

/**
 * RUNTIME CONFIGURATION
 * 
 * Explicitly set runtime to 'nodejs' for Next.js 15 compatibility.
 * 
 * WHY THIS?
 * - NextAuth.js requires Node.js runtime
 * - Edge runtime doesn't support all NextAuth.js features
 * - Ensures consistent behavior across Next.js versions
 */
export const runtime = 'nodejs'
