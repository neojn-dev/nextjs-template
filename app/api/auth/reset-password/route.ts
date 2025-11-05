/**
 * RESET PASSWORD API ROUTE
 * 
 * This API route handles password reset completion.
 * 
 * ENDPOINT: POST /api/auth/reset-password
 * 
 * FLOW OVERVIEW:
 * 1. Validate request body (token, password)
 * 2. Find reset token in database
 * 3. Check if token exists
 * 4. Check if token is expired
 * 5. Hash new password
 * 6. Update user password
 * 7. Delete reset token (single-use)
 * 8. Delete all other reset tokens for user
 * 9. Return success response
 * 
 * SECURITY FEATURES:
 * - Token-based reset (single-use)
 * - Token expiration (1 hour)
 * - Password hashing (bcrypt, 12 rounds)
 * - Token deletion after use
 * - Multiple token cleanup
 * 
 * ERROR HANDLING:
 * - Validation errors: 400 Bad Request
 * - Invalid token: 400 Bad Request
 * - Expired token: 400 Bad Request
 * - Generic errors: 500 Internal Server Error
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "token": "reset-token-here",
 *   "password": "NewSecurePass123!"
 * }
 * ```
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "message": "Password reset successfully"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

/**
 * RESET PASSWORD REQUEST SCHEMA
 * 
 * Validates reset password request body.
 * 
 * VALIDATION RULES:
 * - token: Required, non-empty string
 * - password: Required, minimum 8 characters
 * 
 * NOTE: Full password validation (uppercase, lowercase, etc.)
 * happens in frontend. This is minimum validation.
 */
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/auth/reset-password
 * 
 * PROCESS:
 * 1. Validate request body
 * 2. Find reset token
 * 3. Validate token
 * 4. Hash new password
 * 5. Update user password
 * 6. Delete tokens
 * 
 * @param request - Next.js request object
 * @returns JSON response with success/error message
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: PARSE AND VALIDATE REQUEST BODY
     * 
     * - Parse JSON body from request
     * - Validate against Zod schema
     * - Destructure validated fields
     */
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    /**
     * STEP 2: FIND PASSWORD RESET TOKEN
     * 
     * Looks up token in PasswordResetToken table.
     * Includes related user data for password update.
     * 
     * WHAT'S INCLUDED:
     * - Token data (expires, userId)
     * - User data (for password update)
     */
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    /**
     * STEP 3: CHECK IF TOKEN EXISTS
     * 
     * If token not found, it's invalid or already used.
     * 
     * SECURITY: Generic error message prevents token enumeration.
     */
    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    /**
     * STEP 4: CHECK IF TOKEN IS EXPIRED
     * 
     * Tokens expire after 1 hour.
     * Prevents old tokens from being used.
     * 
     * SECURITY BENEFIT:
     * - Limits window for token misuse
     * - Forces users to request new token if expired
     * - Shorter expiration than verification token (1 hour vs 24 hours)
     */
    if (resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    /**
     * STEP 5: HASH NEW PASSWORD
     * 
     * Uses bcrypt with 12 rounds (high security).
     * Never store plain passwords!
     * 
     * HOW BCRYPT WORKS:
     * - Generates random salt
     * - Hashes password with salt
     * - Returns hash string (includes salt)
     * - Slow by design (prevents brute force)
     */
    const passwordHash = await bcrypt.hash(password, 12)

    /**
     * STEP 6: UPDATE USER PASSWORD
     * 
     * Updates user's passwordHash in database.
     * 
     * WHAT HAPPENS:
     * - Old password hash is replaced
     * - User can now sign in with new password
     * - Old password no longer works
     */
    await db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    })

    /**
     * STEP 7: DELETE THE RESET TOKEN (SINGLE-USE)
     * 
     * Deletes the token that was just used.
     * Makes token single-use (can't be reused).
     * 
     * SECURITY:
     * - Token can only be used once
     * - Even if intercepted, can't be reused
     * - Prevents token replay attacks
     */
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    /**
     * STEP 8: DELETE ALL OTHER RESET TOKENS FOR USER
     * 
     * Cleans up any other reset tokens for this user.
     * 
     * WHY THIS STEP?
     * - User might have requested multiple resets
     * - Only latest token should be valid
     * - Prevents confusion (which token to use)
     * - Better security (single active token)
     */
    await db.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    })

    /**
     * STEP 9: RETURN SUCCESS RESPONSE
     * 
     * Returns success message.
     * User can now sign in with new password.
     */
    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    
    /**
     * VALIDATION ERROR HANDLING
     * 
     * If Zod validation fails, return validation errors.
     */
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

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
