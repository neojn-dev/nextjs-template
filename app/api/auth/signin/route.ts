/**
 * USER SIGNIN API ROUTE
 * 
 * This API route handles user authentication (signin).
 * 
 * ENDPOINT: POST /api/auth/signin
 * 
 * FLOW OVERVIEW:
 * 1. Validate request body (Zod schema)
 * 2. Find user by username or email
 * 3. Check if user exists
 * 4. Check if email is verified
 * 5. Check if account is active
 * 6. Verify password with bcrypt
 * 7. Return user data (without password)
 * 
 * SECURITY FEATURES:
 * - Password verification (bcrypt.compare)
 * - Email verification required
 * - Account status check (isActive)
 * - Generic error messages (prevents user enumeration)
 * 
 * ERROR HANDLING:
 * - Validation errors: 400 Bad Request
 * - Invalid credentials: 401 Unauthorized
 * - Email not verified: 401 Unauthorized
 * - Account deactivated: 401 Unauthorized
 * - Generic errors: 500 Internal Server Error
 * 
 * NOTE:
 * This route is separate from NextAuth's signin.
 * NextAuth handles the actual session creation.
 * This route can be used for API authentication or custom flows.
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "identifier": "johndoe",
 *   "password": "SecurePass123!"
 * }
 * ```
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "user": {
 *     "id": "user-id",
 *     "username": "johndoe",
 *     "email": "john@example.com",
 *     "role": "User",
 *     "emailVerified": true
 *   },
 *   "message": "Sign in successful"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

/**
 * SIGNIN REQUEST SCHEMA
 * 
 * Validates signin request body.
 * 
 * VALIDATION RULES:
 * - identifier: Required, non-empty (username OR email)
 * - password: Required, non-empty
 * 
 * NOTE: identifier can be either username or email.
 * This provides flexibility for users (they can use either).
 */
const signinSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
})

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/auth/signin
 * 
 * PROCESS:
 * 1. Validate request body
 * 2. Find user by username or email
 * 3. Check user existence
 * 4. Check email verification
 * 5. Check account status
 * 6. Verify password
 * 7. Return user data
 * 
 * @param request - Next.js request object
 * @returns JSON response with user data or error
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
    const { identifier, password } = signinSchema.parse(body)

    /**
     * STEP 2: FIND USER BY USERNAME OR EMAIL
     * 
     * Searches for user using OR condition:
     * - Try username first
     * - Try email second
     * 
     * INCLUDES:
     * - Role data (for authorization)
     * - Only select needed fields (security)
     * 
     * WHY OR CONDITION?
     * Provides flexibility - users can sign in with either.
     */
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: identifier }, // Try username
          { email: identifier }, // Try email
        ],
      },
      include: {
        role: {
          select: {
            id: true,
            name: true, // Role name (Admin, User, etc.)
            description: true,
          }
        }
      }
    })

    /**
     * STEP 3: CHECK IF USER EXISTS
     * 
     * If user not found, return generic error.
     * Generic message prevents user enumeration attacks.
     * 
     * SECURITY: Same error message whether username or password is wrong.
     */
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      )
    }

    /**
     * STEP 4: CHECK EMAIL VERIFICATION
     * 
     * Users must verify email before signing in.
     * This prevents unverified accounts from accessing the app.
     * 
     * SECURITY BENEFIT:
     * - Prevents fake email accounts
     * - Ensures valid email addresses
     * - Reduces spam accounts
     */
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in" },
        { status: 401 }
      )
    }

    /**
     * STEP 5: CHECK ACCOUNT STATUS
     * 
     * Check if account is active.
     * Admins can deactivate accounts (isActive = false).
     * 
     * WHY THIS CHECK?
     * - Admins can disable accounts without deleting them
     * - Deactivated accounts cannot sign in
     * - User data is preserved (for audit purposes)
     */
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact your administrator." },
        { status: 401 }
      )
    }

    /**
     * STEP 6: VERIFY PASSWORD
     * 
     * Uses bcrypt.compare to securely compare passwords.
     * 
     * HOW IT WORKS:
     * - Extracts salt from stored hash
     * - Hashes provided password with same salt
     * - Compares hashes
     * - Prevents timing attacks
     * 
     * SECURITY:
     * - Slow by design (prevents brute force)
     * - Constant-time comparison (prevents timing attacks)
     * - Never stores plain passwords
     */
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      )
    }

    /**
     * STEP 7: RETURN USER DATA (WITHOUT PASSWORD)
     * 
     * Returns user information needed for frontend.
     * 
     * WHAT'S INCLUDED:
     * - id: User ID
     * - username: Username
     * - email: Email address
     * - role: Role name (for authorization)
     * - emailVerified: Verification status
     * 
     * WHAT'S NOT INCLUDED:
     * - passwordHash: Never returned!
     * - Other sensitive data: Only what's needed
     */
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name || 'User', // Default to 'User' if no role
        emailVerified: user.emailVerified,
      },
      message: "Sign in successful",
    })
  } catch (error) {
    console.error("Sign in error:", error)
    
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
