/**
 * CHANGE PASSWORD API ROUTE
 * 
 * This API route allows authenticated users to change their password.
 * 
 * ENDPOINT: POST /api/auth/change-password
 * 
 * FLOW OVERVIEW:
 * 1. Verify user is authenticated (session required)
 * 2. Validate request body (current password, new password)
 * 3. Verify current password is correct
 * 4. Check new password is different from current
 * 5. Hash new password
 * 6. Update user password in database
 * 7. Clear mustChangePassword flag (if set)
 * 8. Return success response
 * 
 * SECURITY FEATURES:
 * - Requires authentication (session check)
 * - Current password verification (prevents unauthorized changes)
 * - Password complexity requirements enforced
 * - Password hashing (bcrypt, 12 rounds)
 * - Prevents reusing current password
 * - Clears mustChangePassword flag after change
 * 
 * PASSWORD REQUIREMENTS:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - Validation errors: 400 Bad Request
 * - Current password incorrect: 400 Bad Request
 * - Same password: 400 Bad Request
 * - User not found: 404 Not Found
 * - Generic errors: 500 Internal Server Error
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "currentPassword": "OldPass123!",
 *   "newPassword": "NewSecurePass123!"
 * }
 * ```
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "message": "Password changed successfully"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

/**
 * CHANGE PASSWORD REQUEST SCHEMA
 * 
 * Validates change password request body.
 * 
 * VALIDATION RULES:
 * - currentPassword: Required, non-empty
 * - newPassword: Required, meets complexity requirements:
 *   - Minimum 8 characters
 *   - Contains lowercase letter
 *   - Contains uppercase letter
 *   - Contains number
 *   - Contains special character
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
})

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/auth/change-password
 * 
 * PROCESS:
 * 1. Check authentication
 * 2. Validate request body
 * 3. Verify current password
 * 4. Check password difference
 * 5. Hash and update password
 * 6. Clear mustChangePassword flag
 * 
 * @param request - Next.js request object
 * @returns JSON response with success/error message
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: CHECK AUTHENTICATION
     * 
     * User must be authenticated to change password.
     * Gets session from NextAuth.js.
     * 
     * SECURITY:
     * - Requires valid session
     * - Uses session user ID for database lookup
     * - Prevents unauthorized password changes
     */
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /**
     * STEP 2: PARSE AND VALIDATE REQUEST BODY
     * 
     * - Parse JSON body from request
     * - Validate against Zod schema
     * - Extract validated fields
     */
    const body = await request.json()
    const validationResult = changePasswordSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    /**
     * STEP 3: GET USER FROM DATABASE
     * 
     * Retrieves user data needed for password verification.
     * 
     * WHAT'S INCLUDED:
     * - id: User ID
     * - passwordHash: Current password hash
     * - mustChangePassword: Flag indicating if password change is required
     */
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        passwordHash: true,
        mustChangePassword: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    /**
     * STEP 4: VERIFY CURRENT PASSWORD
     * 
     * Uses bcrypt.compare to verify current password.
     * 
     * SECURITY:
     * - Prevents unauthorized password changes
     * - Even if session is valid, must know current password
     * - Protects against session hijacking
     */
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    /**
     * STEP 5: CHECK IF NEW PASSWORD IS DIFFERENT
     * 
     * Ensures new password is different from current password.
     * 
     * WHY THIS CHECK?
     * - Prevents user from "changing" to same password
     * - Ensures actual password change occurred
     * - Good security practice
     */
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash)
    
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      )
    }

    /**
     * STEP 6: HASH NEW PASSWORD
     * 
     * Uses bcrypt with 12 rounds (high security).
     * Never store plain passwords!
     */
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    /**
     * STEP 7: UPDATE USER PASSWORD
     * 
     * Updates password hash in database.
     * Also clears mustChangePassword flag if it was set.
     * 
     * WHAT HAPPENS:
     * - Old password hash is replaced
     * - mustChangePassword flag is cleared (if it was true)
     * - updatedAt timestamp is updated
     * - User can now sign in with new password
     */
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false, // Clear the mandatory change flag
        updatedAt: new Date(),
      }
    })

    /**
     * STEP 8: RETURN SUCCESS RESPONSE
     * 
     * Returns success message.
     * Password has been changed successfully.
     */
    return NextResponse.json({
      message: "Password changed successfully"
    })
  } catch (error) {
    console.error("Password change error:", error)
    
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
