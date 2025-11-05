/**
 * CHECK USER STATUS API ROUTE
 * 
 * This API route checks if a user exists and their account status.
 * 
 * ENDPOINT: POST /api/auth/check-user-status
 * 
 * FLOW OVERVIEW:
 * 1. Validate request body (identifier: username or email)
 * 2. Find user by username or email
 * 3. Return user status information
 * 
 * USE CASES:
 * - Check if username/email is already taken (during signup)
 * - Check account status before signin
 * - Verify user exists and account status
 * 
 * SECURITY CONSIDERATIONS:
 * - Does NOT reveal if email exists (returns same structure)
 * - Returns status information only if user exists
 * - Does NOT expose sensitive user data
 * 
 * RESPONSE FORMATS:
 * 
 * USER EXISTS:
 * ```json
 * {
 *   "exists": true,
 *   "isActive": true,
 *   "emailVerified": true
 * }
 * ```
 * 
 * USER DOES NOT EXIST:
 * ```json
 * {
 *   "exists": false,
 *   "isActive": false,
 *   "emailVerified": false
 * }
 * ```
 * 
 * NOTE:
 * Even if user doesn't exist, returns same structure.
 * This prevents user enumeration attacks.
 * 
 * ERROR HANDLING:
 * - Validation errors: 400 Bad Request
 * - Generic errors: 500 Internal Server Error
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "identifier": "johndoe"
 * }
 * ```
 * 
 * OR:
 * ```json
 * {
 *   "identifier": "john@example.com"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

/**
 * CHECK USER STATUS REQUEST SCHEMA
 * 
 * Validates check user status request body.
 * 
 * VALIDATION RULES:
 * - identifier: Required, non-empty (username OR email)
 * 
 * NOTE: identifier can be either username or email.
 * This provides flexibility for users.
 */
const checkUserSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
})

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/auth/check-user-status
 * 
 * PROCESS:
 * 1. Validate request body
 * 2. Find user by username or email
 * 3. Return user status (or default if not found)
 * 
 * @param request - Next.js request object
 * @returns JSON response with user status information
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: PARSE AND VALIDATE REQUEST BODY
     * 
     * - Parse JSON body from request
     * - Validate against Zod schema
     * - Extract identifier (username or email)
     */
    const body = await request.json()
    const { identifier } = checkUserSchema.parse(body)

    /**
     * STEP 2: FIND USER BY USERNAME OR EMAIL
     * 
     * Searches for user using OR condition:
     * - Try username first
     * - Try email second
     * 
     * WHAT'S INCLUDED:
     * - id: User ID (for internal use)
     * - isActive: Account active status
     * - emailVerified: Email verification status
     * 
     * SECURITY:
     * Only selects necessary fields (not sensitive data).
     */
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      select: {
        id: true,
        isActive: true,
        emailVerified: true,
      }
    })

    /**
     * STEP 3: RETURN USER STATUS
     * 
     * If user not found, return default values.
     * This prevents user enumeration attacks.
     * 
     * SECURITY NOTE:
     * Always returns same structure regardless of whether user exists.
     * Prevents attackers from discovering which usernames/emails are registered.
     */
    if (!user) {
      return NextResponse.json({
        exists: false,
        isActive: false,
        emailVerified: false
      })
    }

    /**
     * STEP 4: RETURN USER STATUS (USER EXISTS)
     * 
     * User found - return actual status information.
     */
    return NextResponse.json({
      exists: true,
      isActive: user.isActive,
      emailVerified: !!user.emailVerified // Convert to boolean
    })
  } catch (error) {
    console.error("Check user status error:", error)
    
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
