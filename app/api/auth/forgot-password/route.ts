/**
 * FORGOT PASSWORD API ROUTE
 * 
 * This API route handles password reset requests.
 * 
 * ENDPOINT: POST /api/auth/forgot-password
 * 
 * FLOW OVERVIEW:
 * 1. Validate request body (email)
 * 2. Find user by email
 * 3. Always return success (prevents email enumeration)
 * 4. Delete existing reset tokens (if user exists)
 * 5. Create new reset token
 * 6. Send password reset email
 * 7. Return success response
 * 
 * SECURITY FEATURES:
 * - Email enumeration prevention (always returns success)
 * - Token expiration (1 hour)
 * - Single-use tokens
 * - Token deletion before creating new one
 * 
 * EMAIL ENUMERATION PREVENTION:
 * This is CRITICAL for security!
 * - Always returns same success message
 * - Doesn't reveal if email exists
 * - Prevents attackers from discovering registered emails
 * 
 * ERROR HANDLING:
 * - Validation errors: 400 Bad Request
 * - Generic errors: 500 Internal Server Error
 * - Email send failure: Logged but doesn't fail request
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "email": "user@example.com"
 * }
 * ```
 * 
 * RESPONSE (ALWAYS SUCCESS):
 * ```json
 * {
 *   "message": "If an account with that email exists, a password reset link has been sent."
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { generateRandomString } from "@/lib/utils"

/**
 * FORGOT PASSWORD REQUEST SCHEMA
 * 
 * Validates forgot password request body.
 * 
 * VALIDATION RULES:
 * - email: Required, valid email format
 */
const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/auth/forgot-password
 * 
 * PROCESS:
 * 1. Validate email
 * 2. Find user (if exists)
 * 3. Create reset token
 * 4. Send email
 * 5. Always return success
 * 
 * SECURITY NOTE:
 * Always returns success message, even if email doesn't exist.
 * This prevents email enumeration attacks.
 * 
 * @param request - Next.js request object
 * @returns JSON response (always success)
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: PARSE AND VALIDATE REQUEST BODY
     * 
     * - Parse JSON body from request
     * - Validate email format
     */
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    /**
     * STEP 2: FIND USER BY EMAIL
     * 
     * Attempts to find user in database.
     * 
     * NOTE: We don't fail if user doesn't exist.
     * This prevents email enumeration attacks.
     */
    const user = await db.user.findUnique({
      where: { email },
    })

    /**
     * STEP 3: ALWAYS RETURN SUCCESS (EMAIL ENUMERATION PREVENTION)
     * 
     * CRITICAL SECURITY FEATURE!
     * 
     * Even if user doesn't exist, return success.
     * This prevents attackers from discovering which emails are registered.
     * 
     * ATTACK PREVENTION:
     * - Attacker tries email1@example.com → "success"
     * - Attacker tries email2@example.com → "success"
     * - Attacker can't tell which emails are registered
     * 
     * USER EXPERIENCE:
     * - Legitimate user gets reset email
     * - Invalid email gets same message (no difference)
     * - No information leakage
     */
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      })
    }

    /**
     * STEP 4: DELETE EXISTING RESET TOKENS
     * 
     * Deletes any existing password reset tokens for this user.
     * 
     * WHY DELETE FIRST?
     * - Prevents multiple valid tokens
     * - Only latest token is valid
     * - Prevents token accumulation
     * - Better security (single active token)
     */
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    /**
     * STEP 5: CREATE PASSWORD RESET TOKEN
     * 
     * Generates random token for password reset.
     * Token expires in 1 hour.
     * 
     * TOKEN DETAILS:
     * - Random 32-character string
     * - Stored in PasswordResetToken table
     * - Linked to user via userId
     * - Expires after 1 hour (shorter than verification token)
     * 
     * WHY 1 HOUR?
     * - Shorter window reduces risk if token is compromised
     * - Balance between security and usability
     * - User should reset password quickly
     */
    const token = generateRandomString(32)
    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      },
    })

    /**
     * STEP 6: SEND PASSWORD RESET EMAIL
     * 
     * Sends email with password reset link.
     * 
     * ERROR HANDLING:
     * - If email fails, log error but don't fail request
     * - Still return success (security: don't reveal email failure)
     * - User can try again if email doesn't arrive
     */
    try {
      await sendPasswordResetEmail(email, token)
    } catch (error) {
      console.error("Failed to send password reset email:", error)
      // Don't fail the request if email fails
    }

    /**
     * STEP 7: RETURN SUCCESS RESPONSE
     * 
     * Always returns success message.
     * Same message whether user exists or not (security).
     */
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    
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
