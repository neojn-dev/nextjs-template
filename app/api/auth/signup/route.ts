/**
 * USER SIGNUP API ROUTE
 * 
 * This API route handles user registration.
 * 
 * ENDPOINT: POST /api/auth/signup
 * 
 * FLOW OVERVIEW:
 * 1. Validate request body (Zod schema)
 * 2. Check if user already exists (username or email)
 * 3. Hash password with bcrypt
 * 4. Find default "User" role
 * 5. Create user account in database
 * 6. Generate verification token
 * 7. Send verification email
 * 8. Return success response
 * 
 * SECURITY FEATURES:
 * - Password hashing (bcrypt, 12 rounds)
 * - Input validation (Zod schema)
 * - Duplicate user prevention
 * - Email verification required
 * 
 * ERROR HANDLING:
 * - Validation errors: 400 Bad Request
 * - Duplicate user: 400 Bad Request
 * - Missing role: 500 Internal Server Error
 * - Email send failure: Logged but doesn't fail signup
 * - Generic errors: 500 Internal Server Error
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "username": "johndoe",
 *   "email": "john@example.com",
 *   "password": "SecurePass123!"
 * }
 * ```
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "message": "User created successfully. Please check your email to verify your account.",
 *   "userId": "user-id-here"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { generateRandomString } from "@/lib/utils"

/**
 * SIGNUP REQUEST SCHEMA
 * 
 * Validates signup request body.
 * 
 * VALIDATION RULES:
 * - firstName: 1-50 characters
 * - lastName: 1-50 characters
 * - username: 3-20 characters
 * - email: Valid email format
 * - password: Minimum 8 characters (additional validation in frontend)
 * 
 * NOTE: This is a simplified schema for API validation.
 * Full validation (password requirements) happens in frontend.
 */
const signupSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
})

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/auth/signup
 * 
 * PROCESS:
 * 1. Parse and validate request body
 * 2. Check for existing user
 * 3. Hash password
 * 4. Find default role
 * 5. Create user
 * 6. Create verification token
 * 7. Send verification email
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
    const { firstName, lastName, username, email, password } = signupSchema.parse(body)

    /**
     * STEP 2: CHECK IF USER ALREADY EXISTS
     * 
     * Prevents duplicate accounts.
     * Checks both username AND email (OR condition).
     * 
     * SECURITY: Prevents account takeover attacks.
     */
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username }, // Check username
          { email }, // Check email
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this username or email already exists" },
        { status: 400 }
      )
    }

    /**
     * STEP 3: HASH PASSWORD
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
     * STEP 4: FIND DEFAULT "USER" ROLE
     * 
     * New users get the default "User" role.
     * This role must exist in database (created in seed).
     * 
     * WHY DEFAULT ROLE?
     * - Simplifies user creation
     * - Ensures all users have a role
     * - Can be changed later by admin
     */
    const defaultRole = await db.role.findFirst({
      where: { name: "User" }
    })

    if (!defaultRole) {
      return NextResponse.json(
        { error: "Default user role not found. Please contact administrator." },
        { status: 500 }
      )
    }

    /**
     * STEP 5: CREATE USER IN DATABASE
     * 
     * Creates new user account with:
     * - Personal info (firstName, lastName)
     * - Credentials (username, email, passwordHash)
     * - Default role (roleId)
     * 
     * NOTE: emailVerified is false by default.
     * User must verify email before signing in.
     */
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        passwordHash,
        roleId: defaultRole.id, // Assign default "User" role
      },
    })

    /**
     * STEP 6: CREATE VERIFICATION TOKEN
     * 
     * Generates random token for email verification.
     * Token expires in 24 hours.
     * 
     * TOKEN DETAILS:
     * - Random 32-character string
     * - Stored in VerificationToken table
     * - Linked to user via userId
     * - Expires after 24 hours
     */
    const token = generateRandomString(32)
    
    await db.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    })

    /**
     * STEP 7: SEND VERIFICATION EMAIL
     * 
     * Sends email with verification link.
     * 
     * ERROR HANDLING:
     * - If email fails, log error but don't fail signup
     * - User can request new verification email later
     * - Signup is still successful
     */
    try {
      await sendVerificationEmail(email, token)
    } catch (error) {
      console.error("Failed to send verification email:", error)
      // Don't fail the signup if email fails
    }

    /**
     * STEP 8: RETURN SUCCESS RESPONSE
     * 
     * Returns success message and user ID.
     * User must verify email before signing in.
     */
    return NextResponse.json({
      message: "User created successfully. Please check your email to verify your account.",
      userId: user.id,
    })
  } catch (error) {
    console.error("Signup error:", error)
    
    /**
     * VALIDATION ERROR HANDLING
     * 
     * If Zod validation fails, return validation errors.
     * Helps frontend show specific field errors.
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
