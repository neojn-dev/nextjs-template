/**
 * EMAIL VERIFICATION API ROUTE
 * 
 * This API route verifies a user's email address using a token.
 * 
 * ENDPOINT: GET /api/auth/verify?token=abc123
 * 
 * FLOW OVERVIEW:
 * 1. Extract token from query parameters
 * 2. Find verification token in database
 * 3. Check if token exists
 * 4. Check if token is expired
 * 5. Check if email is already verified
 * 6. Mark email as verified
 * 7. Delete verification token (single-use)
 * 8. Return success response
 * 
 * SECURITY FEATURES:
 * - Token-based verification (single-use)
 * - Token expiration (24 hours)
 * - Prevents double verification
 * - Token deletion after use
 * 
 * ERROR HANDLING:
 * - Missing token: 400 Bad Request
 * - Invalid token: 400 Bad Request
 * - Expired token: 400 Bad Request
 * - Already verified: 400 Bad Request
 * - Generic errors: 500 Internal Server Error
 * 
 * REQUEST:
 * GET /api/auth/verify?token=verification-token-here
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "message": "Email verified successfully"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET HANDLER
 * 
 * Handles GET requests to /api/auth/verify
 * 
 * PROCESS:
 * 1. Extract token from URL
 * 2. Find token in database
 * 3. Validate token
 * 4. Verify email
 * 5. Delete token
 * 
 * @param request - Next.js request object
 * @returns JSON response with success/error message
 */
export async function GET(request: NextRequest) {
  try {
    /**
     * STEP 1: EXTRACT TOKEN FROM URL
     * 
     * Gets token from query parameters.
     * Token comes from email verification link.
     * 
     * EXAMPLE URL:
     * /api/auth/verify?token=abc123def456
     */
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    /**
     * STEP 2: FIND VERIFICATION TOKEN IN DATABASE
     * 
     * Looks up token in VerificationToken table.
     * Includes related user data for validation.
     * 
     * WHAT'S INCLUDED:
     * - Token data (expires, userId)
     * - User data (emailVerified status)
     */
    const verificationToken = await db.verificationToken.findUnique({
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
    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    /**
     * STEP 4: CHECK IF TOKEN IS EXPIRED
     * 
     * Tokens expire after 24 hours.
     * Prevents old tokens from being used.
     * 
     * SECURITY BENEFIT:
     * - Limits window for token misuse
     * - Forces users to request new token if expired
     */
    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      )
    }

    /**
     * STEP 5: CHECK IF EMAIL IS ALREADY VERIFIED
     * 
     * Prevents double verification.
     * If already verified, return error (idempotent check).
     * 
     * WHY THIS CHECK?
     * - User might click link multiple times
     * - Prevents unnecessary database writes
     * - Provides clear feedback to user
     */
    if (verificationToken.user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    /**
     * STEP 6: MARK EMAIL AS VERIFIED
     * 
     * Updates user's emailVerified field with current timestamp.
     * 
     * WHAT HAPPENS:
     * - emailVerified changes from null to Date
     * - User can now sign in
     * - Account is activated
     */
    await db.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    })

    /**
     * STEP 7: DELETE VERIFICATION TOKEN (SINGLE-USE)
     * 
     * Deletes token after successful verification.
     * Makes token single-use (can't be reused).
     * 
     * ERROR HANDLING:
     * - If delete fails, log warning but don't fail verification
     * - Token might already be deleted (race condition)
     * - Verification is still successful
     */
    try {
      await db.verificationToken.delete({
        where: { id: verificationToken.id },
      })
    } catch (deleteError) {
      // Log the error but don't fail the verification
      // Token might already be deleted (race condition)
      console.warn("Could not delete verification token:", deleteError)
    }

    /**
     * STEP 8: RETURN SUCCESS RESPONSE
     * 
     * Returns success message.
     * User can now sign in with verified email.
     */
    return NextResponse.json({
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Verification error:", error)
    
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
