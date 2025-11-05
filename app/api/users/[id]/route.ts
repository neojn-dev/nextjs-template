/**
 * USER BY ID API ROUTE
 * 
 * This API route handles individual user operations by ID.
 * 
 * ENDPOINT: GET /api/users/[id] - Get user by ID
 * ENDPOINT: PUT /api/users/[id] - Update user by ID
 * ENDPOINT: DELETE /api/users/[id] - Delete user by ID
 * 
 * FLOW OVERVIEW:
 * 
 * GET (Get User by ID):
 * 1. Verify authentication and admin role
 * 2. Validate user ID parameter
 * 3. Fetch user from database with role information
 * 4. Return user data (excluding sensitive fields)
 * 
 * PUT (Update User):
 * 1. Verify authentication and admin role
 * 2. Validate user ID and request body
 * 3. Check if user exists
 * 4. Validate username uniqueness (if changed)
 * 5. Validate email uniqueness (if changed)
 * 6. Validate role exists and is active (if changed)
 * 7. Hash password if provided (optional update)
 * 8. Update user in database
 * 9. Return updated user data
 * 
 * DELETE (Delete User):
 * 1. Verify authentication and admin role
 * 2. Validate user ID parameter
 * 3. Check if user exists
 * 4. Prevent self-deletion (admin cannot delete own account)
 * 5. Delete related records (cascade delete)
 * 6. Delete user account
 * 7. Return success message
 * 
 * SECURITY FEATURES:
 * - Requires authentication
 * - Requires Admin role for all operations
 * - Prevents self-deletion
 * - Password hashing for updates (bcrypt, 12 rounds)
 * - Duplicate username/email prevention
 * - Role validation (only active roles)
 * - Cascade deletion of related records
 * 
 * CASCADE DELETION:
 * When deleting a user, the following related records are deleted:
 * - Sessions (user sessions)
 * - Accounts (OAuth accounts)
 * - VerificationTokens (email verification tokens)
 * - PasswordResetTokens (password reset tokens)
 * - Uploads (user uploads)
 * - User record itself
 * 
 * PASSWORD UPDATE:
 * - Password update is optional
 * - If provided, password is hashed with bcrypt (12 rounds)
 * - Only admin can update passwords
 * - Useful for password reset by admin
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - Forbidden: 403 (not admin)
 * - Not Found: 404 (user doesn't exist)
 * - Bad Request: 400 (validation errors, duplicate username/email)
 * - Internal Server Error: 500 (database errors)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateUserSchema, userIdSchema } from '@/lib/validations/users'
import bcrypt from 'bcryptjs'

/**
 * GET HANDLER
 * 
 * Retrieves a single user by ID.
 * 
 * PROCESS:
 * 1. Check authentication and admin role
 * 2. Validate user ID parameter
 * 3. Fetch user from database
 * 4. Return user data
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing user ID
 * @returns JSON response with user data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    // Await params and validate the user ID
    const { id } = await params
    const validationResult = userIdSchema.safeParse({ id })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    /**
     * STEP 5: FETCH USER FROM DATABASE
     * 
     * Retrieves user data with role information.
     * 
     * WHAT'S INCLUDED:
     * - Basic user info (id, username, email, firstName, lastName)
     * - Account status (isActive, emailVerified)
     * - Role information (roleId, role details)
     * - Timestamps (createdAt, updatedAt)
     * 
     * WHAT'S NOT INCLUDED:
     * - passwordHash (never returned)
     * - Other sensitive fields
     */
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      }
    })

    /**
     * STEP 6: CHECK IF USER EXISTS
     * 
     * If user not found, return 404 error.
     */
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    /**
     * STEP 7: RETURN USER DATA
     * 
     * Returns user information without sensitive data.
     */
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT HANDLER
 * 
 * Updates an existing user by ID.
 * 
 * PROCESS:
 * 1. Check authentication and admin role
 * 2. Validate user ID and request body
 * 3. Check user existence
 * 4. Validate uniqueness constraints
 * 5. Update user data
 * 6. Return updated user
 * 
 * @param request - Next.js request object containing update data
 * @param params - Route parameters containing user ID
 * @returns JSON response with updated user data or error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  /**
   * STEP 1: RESOLVE PARAMS
   * 
   * Next.js 15+ requires params to be awaited.
   */
  const resolvedParams = await params
  try {
    /**
     * STEP 2: CHECK AUTHENTICATION
     * 
     * User must be authenticated to update users.
     */
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    /**
     * STEP 3: CHECK ADMIN ROLE
     * 
     * Only admins can update user accounts.
     */
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    /**
     * STEP 4: PARSE REQUEST BODY
     * 
     * Extracts update data from request body.
     */
    const body = await request.json()
    
    /**
     * STEP 5: VALIDATE REQUEST
     * 
     * Validates user ID and request body against schema.
     * Combines route params with body data for validation.
     */
    const { id } = await params
    const validationResult = updateUserSchema.safeParse({ ...body, id })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    /**
     * STEP 6: EXTRACT VALIDATED DATA
     * 
     * Destructures validated fields from validation result.
     * All fields are optional (can update specific fields only).
     */
    const { username, email, firstName, lastName, roleId, isActive, password } = validationResult.data

    /**
     * STEP 7: CHECK IF USER EXISTS
     * 
     * Verifies user exists before attempting update.
     * If not found, return 404 error.
     */
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    /**
     * STEP 8: VALIDATE USERNAME UNIQUENESS
     * 
     * If username is being changed, check if new username is available.
     * Skip check if username is unchanged.
     * 
     * SECURITY: Prevents duplicate usernames.
     */
    if (username && username !== existingUser.username) {
      const userWithSameUsername = await prisma.user.findUnique({
        where: { username }
      })

      if (userWithSameUsername) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        )
      }
    }

    /**
     * STEP 9: VALIDATE EMAIL UNIQUENESS
     * 
     * If email is being changed, check if new email is available.
     * Skip check if email is unchanged.
     * 
     * SECURITY: Prevents duplicate emails.
     */
    if (email && email !== existingUser.email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email }
      })

      if (userWithSameEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    /**
     * STEP 10: VALIDATE ROLE
     * 
     * If role is being changed, verify the role exists and is active.
     * Only active roles can be assigned to users.
     * 
     * NOTE: roleId can be null (user without role).
     */
    if (roleId && roleId !== null && roleId !== '') {
      const role = await prisma.role.findUnique({
        where: { 
          id: roleId,
          isActive: true // Only allow assignment to active roles
        }
      })

      if (!role) {
        return NextResponse.json(
          { error: 'Invalid or inactive role ID' },
          { status: 400 }
        )
      }
    }

    /**
     * STEP 11: BUILD UPDATE DATA OBJECT
     * 
     * Only includes fields that are provided in the request.
     * This allows partial updates (PATCH-like behavior).
     * 
     * FIELDS THAT CAN BE UPDATED:
     * - username: User's username
     * - email: User's email address
     * - firstName: User's first name
     * - lastName: User's last name
     * - roleId: User's role ID (can be null)
     * - isActive: User's active status
     * - passwordHash: User's password (hashed)
     */
    const updateData: any = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (roleId !== undefined) updateData.roleId = roleId === null ? null : roleId
    if (isActive !== undefined) updateData.isActive = isActive

    /**
     * STEP 12: HASH PASSWORD IF PROVIDED
     * 
     * If password is provided, hash it with bcrypt (12 rounds).
     * 
     * SECURITY:
     * - Never store plain passwords
     * - Uses bcrypt with high cost factor (12 rounds)
     * - Slow by design (prevents brute force attacks)
     */
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    /**
     * STEP 13: UPDATE USER IN DATABASE
     * 
     * Performs the actual database update.
     * Returns updated user data with role information.
     */
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE HANDLER
 * 
 * Deletes a user by ID and all related records.
 * 
 * PROCESS:
 * 1. Check authentication and admin role
 * 2. Validate user ID parameter
 * 3. Check user exists
 * 4. Prevent self-deletion
 * 5. Delete related records (cascade)
 * 6. Delete user account
 * 7. Return success message
 * 
 * SECURITY:
 * - Prevents self-deletion (admin cannot delete own account)
 * - Cascade deletion of all related records
 * - Explicit deletion (not relying on database cascade only)
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing user ID
 * @returns JSON response with success message or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  /**
   * STEP 1: RESOLVE PARAMS
   * 
   * Next.js 15+ requires params to be awaited.
   */
  const resolvedParams = await params
  try {
    /**
     * STEP 2: CHECK AUTHENTICATION
     * 
     * User must be authenticated to delete users.
     */
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    /**
     * STEP 3: CHECK ADMIN ROLE
     * 
     * Only admins can delete user accounts.
     */
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    /**
     * STEP 4: VALIDATE USER ID
     * 
     * Validates that the user ID parameter is valid.
     */
    const { id } = await params
    const validationResult = userIdSchema.safeParse({ id })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    /**
     * STEP 5: CHECK IF USER EXISTS
     * 
     * Verifies user exists before attempting deletion.
     */
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    /**
     * STEP 6: PREVENT SELF-DELETION
     * 
     * SECURITY FEATURE:
     * Admins cannot delete their own account.
     * This prevents accidental account lockout.
     * 
     * WHY THIS MATTERS:
     * - Prevents admin from locking themselves out
     * - Maintains at least one admin account
     * - Requires another admin to delete accounts
     */
    if (session.user?.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    /**
     * STEP 7: DELETE RELATED RECORDS (CASCADE)
     * 
     * Explicitly deletes all related records before deleting user.
     * While Prisma cascade might handle this, we're being explicit
     * to ensure clean deletion and avoid orphaned records.
     * 
     * RELATED RECORDS DELETED:
     * - Sessions: User's active sessions
     * - Accounts: OAuth account connections
     * - VerificationTokens: Email verification tokens
     * - PasswordResetTokens: Password reset tokens
     * - Uploads: User's uploaded files
     * 
     * NOTE: These are deleted in order to maintain referential integrity.
     */
    await prisma.session.deleteMany({
      where: { userId: id }
    })

    await prisma.account.deleteMany({
      where: { userId: id }
    })

    await prisma.verificationToken.deleteMany({
      where: { userId: id }
    })

    await prisma.passwordResetToken.deleteMany({
      where: { userId: id }
    })

    await prisma.upload.deleteMany({
      where: { userId: id }
    })

    /**
     * STEP 8: DELETE USER ACCOUNT
     * 
     * Finally deletes the user record itself.
     * All related records have been deleted in previous steps.
     */
    await prisma.user.delete({
      where: { id }
    })

    /**
     * STEP 9: RETURN SUCCESS RESPONSE
     * 
     * Returns success message after successful deletion.
     */
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
