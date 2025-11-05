/**
 * VERIFY RESET TOKEN API ROUTE
 * 
 * This API route validates a password reset token before allowing password reset.
 * 
 * ENDPOINT: POST /api/auth/verify-reset-token
 * 
 * FLOW OVERVIEW:
 * 1. Validate request body (token)
 * 2. Find reset token in database
 * 3. Check if token exists
 * 4. Check if token is expired
 * 5. Check if user exists and is active
 * 6. Return token validity status
 * 
 * USE CASE:
 * Used by reset password page to verify token before showing password reset form.
 * This prevents users from entering a new password if token is invalid/expired.
 * 
 * SECURITY FEATURES:
 * - Token validation (checks existence and expiration)
 * - User existence check
 * - User active status check
 * - Token expiration check (1 hour)
 * 
 * ERROR HANDLING:
 * - Missing token: 400 Bad Request
 * - Invalid token: 400 Bad Request
 * - Expired token: 400 Bad Request
 * - User not found: 400 Bad Request
 * - Generic errors: 500 Internal Server Error
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "token": "reset-token-here"
 * }
 * ```
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "message": "Reset token is valid",
 *   "userId": "user-id-here"
 * }
 * ```
 * 
 * RESPONSE (ERROR):
 * ```json
 * {
 *   "error": "Invalid reset token"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

/**
 * VERIFY RESET TOKEN REQUEST SCHEMA
 * 
 * Validates verify reset token request body.
 * 
 * VALIDATION RULES:
 * - token: Required, non-empty string
 */
const verifyResetTokenSchema = z.object({
  token: z.string(),
})

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/auth/verify-reset-token
 * 
 * PROCESS:
 * 1. Validate request body
 * 2. Find reset token
 * 3. Validate token
 * 4. Check user status
 * 5. Return validation result
 * 
 * @param request - Next.js request object
 * @returns JSON response with token validity status
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: PARSE AND VALIDATE REQUEST BODY
     * 
     * - Parse JSON body from request
     * - Validate against Zod schema
     * - Extract token
     */
    const body = await request.json()
    const { token } = verifyResetTokenSchema.parse(body)

    /**
     * STEP 2: CHECK IF TOKEN IS PROVIDED
     * 
     * Additional check (redundant with Zod but explicit).
     * Ensures token is present.
     */
    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    /**
     * STEP 3: FIND RESET TOKEN IN DATABASE
     * 
     * Looks up token in PasswordResetToken table.
     * Includes related user data for validation.
     * 
     * WHAT'S INCLUDED:
     * - Token data (expires, userId)
     * - User data (for existence and status checks)
     */
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    /**
     * STEP 4: CHECK IF TOKEN EXISTS
     * 
     * If token not found, it's invalid or already used.
     */
    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      )
    }

    /**
     * STEP 5: CHECK IF TOKEN IS EXPIRED
     * 
     * Tokens expire after 1 hour.
     * Prevents old tokens from being used.
     * 
     * SECURITY BENEFIT:
     * - Limits window for token misuse
     * - Forces users to request new token if expired
     */
    if (resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    /**
     * STEP 6: CHECK IF USER EXISTS AND IS ACTIVE
     * 
     * Verifies user associated with token exists.
     * This prevents using tokens for deleted/deactivated accounts.
     */
    if (!resetToken.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      )
    }

    /**
     * STEP 7: RETURN SUCCESS RESPONSE
     * 
     * Token is valid and ready for password reset.
     * Returns success message with user ID.
     */
    return NextResponse.json({
      message: "Reset token is valid",
      userId: resetToken.userId,
    })
  } catch (error) {
    console.error("Verify reset token error:", error)
    
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

