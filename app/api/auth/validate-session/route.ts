/**
 * VALIDATE SESSION API ROUTE
 * 
 * This API route validates the current user session and checks user status.
 * 
 * ENDPOINT: GET /api/auth/validate-session
 * 
 * FLOW OVERVIEW:
 * 1. Get current session from NextAuth.js
 * 2. Check if session exists
 * 3. Get user from database
 * 4. Check if user exists
 * 5. Check if user is active
 * 6. Check if email is verified
 * 7. Return validation result with user data
 * 
 * USE CASES:
 * - Check if session is still valid (before sensitive operations)
 * - Verify user account status (active, email verified)
 * - Get current user role information
 * - Refresh session data on client-side
 * 
 * SECURITY FEATURES:
 * - Session validation
 * - User existence check
 * - Account status check (isActive)
 * - Email verification check
 * - Role information included
 * 
 * RESPONSE FORMATS:
 * 
 * VALID SESSION:
 * ```json
 * {
 *   "valid": true,
 *   "user": {
 *     "id": "user-id",
 *     "role": "User",
 *     "roleId": "role-id"
 *   }
 * }
 * ```
 * 
 * INVALID SESSION (NO SESSION):
 * ```json
 * {
 *   "valid": false,
 *   "reason": "NO_SESSION"
 * }
 * ```
 * 
 * INVALID SESSION (USER NOT FOUND):
 * ```json
 * {
 *   "valid": false,
 *   "reason": "USER_NOT_FOUND"
 * }
 * ```
 * 
 * INVALID SESSION (ACCOUNT DEACTIVATED):
 * ```json
 * {
 *   "valid": false,
 *   "reason": "ACCOUNT_DEACTIVATED"
 * }
 * ```
 * 
 * INVALID SESSION (EMAIL NOT VERIFIED):
 * ```json
 * {
 *   "valid": false,
 *   "reason": "EMAIL_NOT_VERIFIED"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET HANDLER
 * 
 * Handles GET requests to /api/auth/validate-session
 * 
 * PROCESS:
 * 1. Get session
 * 2. Validate session exists
 * 3. Get user from database
 * 4. Check user status
 * 5. Return validation result
 * 
 * @param request - Next.js request object
 * @returns JSON response with session validation result
 */
export async function GET(request: NextRequest) {
  try {
    /**
     * STEP 1: GET CURRENT SESSION
     * 
     * Retrieves session from NextAuth.js.
     * Session contains user ID and basic user info.
     * 
     * HOW IT WORKS:
     * - Reads session from cookies/headers
     * - Validates session token
     * - Returns session object if valid
     */
    const session = await getServerSession(authOptions)
    
    /**
     * STEP 2: CHECK IF SESSION EXISTS
     * 
     * If no session, user is not authenticated.
     * Return invalid session response.
     */
    if (!session?.user?.id) {
      return NextResponse.json({
        valid: false,
        reason: "NO_SESSION"
      })
    }

    /**
     * STEP 3: GET USER FROM DATABASE
     * 
     * Retrieves current user data from database.
     * Checks user status and verification.
     * 
     * WHAT'S INCLUDED:
     * - id: User ID
     * - isActive: Account active status
     * - emailVerified: Email verification status
     * - role: Role information (id, name)
     * 
     * WHY THIS CHECK?
     * - User might have been deleted
     * - Account might have been deactivated
     * - Email might not be verified
     * - Role might have changed
     */
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isActive: true,
        emailVerified: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    /**
     * STEP 4: CHECK IF USER EXISTS
     * 
     * If user not found, session is invalid.
     * User might have been deleted.
     */
    if (!user) {
      return NextResponse.json({
        valid: false,
        reason: "USER_NOT_FOUND"
      })
    }

    /**
     * STEP 5: CHECK IF USER IS ACTIVE
     * 
     * If account is deactivated, session is invalid.
     * User cannot use the application if account is inactive.
     */
    if (!user.isActive) {
      return NextResponse.json({
        valid: false,
        reason: "ACCOUNT_DEACTIVATED"
      })
    }

    /**
     * STEP 6: CHECK IF EMAIL IS VERIFIED
     * 
     * If email is not verified, session is invalid.
     * Users must verify email before using the application.
     */
    if (!user.emailVerified) {
      return NextResponse.json({
        valid: false,
        reason: "EMAIL_NOT_VERIFIED"
      })
    }

    /**
     * STEP 7: RETURN VALID SESSION RESPONSE
     * 
     * All checks passed - session is valid.
     * Returns user information including role.
     */
    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        role: user.role?.name || 'User',
        roleId: user.role?.id || null
      }
    })
  } catch (error) {
    console.error("Session validation error:", error)
    
    /**
     * ERROR HANDLING
     * 
     * Catch-all for unexpected errors.
     * Returns invalid session response with error reason.
     */
    return NextResponse.json(
      { 
        valid: false, 
        reason: "VALIDATION_ERROR",
        error: "Internal server error" 
      },
      { status: 500 }
    )
  }
}
