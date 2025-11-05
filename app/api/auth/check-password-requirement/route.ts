/**
 * CHECK PASSWORD REQUIREMENT API ROUTE
 * 
 * This API route checks if the current user must change their password.
 * 
 * ENDPOINT: GET /api/auth/check-password-requirement
 * 
 * FLOW OVERVIEW:
 * 1. Verify user is authenticated (session required)
 * 2. Get user from database
 * 3. Check mustChangePassword flag
 * 4. Check createdByAdmin flag
 * 5. Return password requirement status
 * 
 * USE CASES:
 * - Check if user must change password (admin-created accounts)
 * - Determine if password change prompt should be shown
 * - Verify account creation source
 * 
 * SECURITY FEATURES:
 * - Requires authentication (session check)
 * - Returns only password requirement flags
 * - Does NOT expose sensitive user data
 * 
 * FLAGS EXPLAINED:
 * - mustChangePassword: true = User must change password before using app
 * - createdByAdmin: true = Account was created by admin (not self-registered)
 * 
 * WHEN MUST CHANGE PASSWORD?
 * - Admin creates account for user
 * - Admin sets temporary password
 * - User must change password on first login
 * - Prevents using temporary/admin-set passwords
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - User not found: 404 Not Found
 * - Generic errors: 500 Internal Server Error
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "mustChangePassword": true,
 *   "createdByAdmin": true
 * }
 * ```
 * 
 * RESPONSE (NO REQUIREMENT):
 * ```json
 * {
 *   "mustChangePassword": false,
 *   "createdByAdmin": false
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * GET HANDLER
 * 
 * Handles GET requests to /api/auth/check-password-requirement
 * 
 * PROCESS:
 * 1. Check authentication
 * 2. Get user from database
 * 3. Return password requirement flags
 * 
 * @param request - Next.js request object
 * @returns JSON response with password requirement status
 */
export async function GET(request: NextRequest) {
  try {
    /**
     * STEP 1: CHECK AUTHENTICATION
     * 
     * User must be authenticated to check password requirement.
     * Gets session from NextAuth.js.
     * 
     * SECURITY:
     * - Requires valid session
     * - Uses session user ID for database lookup
     * - Prevents unauthorized access to user data
     */
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /**
     * STEP 2: GET USER PASSWORD REQUIREMENT STATUS
     * 
     * Retrieves password requirement flags from database.
     * 
     * WHAT'S INCLUDED:
     * - mustChangePassword: Boolean flag indicating if password change is required
     * - createdByAdmin: Boolean flag indicating if account was created by admin
     * 
     * WHY THESE FIELDS?
     * - mustChangePassword: Used to force password change (security)
     * - createdByAdmin: Used to determine account source (admin vs self-registered)
     */
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        mustChangePassword: true,
        createdByAdmin: true,
      }
    })

    /**
     * STEP 3: CHECK IF USER EXISTS
     * 
     * If user not found, return error.
     * This shouldn't happen if session is valid, but defensive check.
     */
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    /**
     * STEP 4: RETURN PASSWORD REQUIREMENT STATUS
     * 
     * Returns both flags:
     * - mustChangePassword: Whether user must change password
     * - createdByAdmin: Whether account was created by admin
     * 
     * USE CASE:
     * Frontend can use these flags to:
     * - Show password change prompt if mustChangePassword is true
     * - Display different UI for admin-created accounts
     * - Force password change before allowing app access
     */
    return NextResponse.json({
      mustChangePassword: user.mustChangePassword,
      createdByAdmin: user.createdByAdmin,
    })
  } catch (error) {
    console.error("Error checking password requirement:", error)
    
    /**
     * GENERIC ERROR HANDLING
     * 
     * Catch-all for unexpected errors.
     * Returns generic error message (don't expose internals).
     */
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
