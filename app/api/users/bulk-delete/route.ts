/**
 * BULK DELETE USERS API ROUTE
 * 
 * This API route handles bulk deletion of multiple users.
 * 
 * ENDPOINT: POST /api/users/bulk-delete
 * 
 * FLOW OVERVIEW:
 * 1. Verify authentication and admin role
 * 2. Parse and validate request body
 * 3. Verify admin password for delete-all operations
 * 4. Filter out admin accounts from deletion list
 * 5. Verify all user IDs exist
 * 6. Delete selected users or all users (except admin)
 * 7. Return deletion result with count
 * 
 * SECURITY FEATURES:
 * - Requires authentication
 * - Requires Admin role
 * - Requires password verification for delete-all operations
 * - Prevents deletion of admin accounts (username 'admin')
 * - Prevents self-deletion (current admin cannot delete themselves)
 * - Validates user IDs before deletion
 * 
 * DELETE ALL OPERATION:
 * - Requires admin password verification
 * - Deletes all users except:
 *   - Current admin user (session user)
 *   - Main admin account (username 'admin')
 * - Returns count of deleted users
 * 
 * BULK DELETE OPERATION:
 * - Deletes specific users by IDs
 * - Automatically filters out admin accounts
 * - Verifies all IDs exist before deletion
 * - Returns count of deleted users
 * 
 * REQUEST BODY (Delete Selected):
 * ```json
 * {
 *   "ids": ["user-id-1", "user-id-2"],
 *   "deleteAll": false
 * }
 * ```
 * 
 * REQUEST BODY (Delete All):
 * ```json
 * {
 *   "deleteAll": true,
 *   "password": "admin-password"
 * }
 * ```
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "success": true,
 *   "message": "Successfully deleted 5 users",
 *   "deletedCount": 5
 * }
 * ```
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session or invalid password)
 * - Forbidden: 403 (not admin)
 * - Bad Request: 400 (missing IDs, invalid request)
 * - Not Found: 404 (admin user not found)
 * - Internal Server Error: 500 (database errors)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * POST HANDLER
 * 
 * Handles bulk deletion of users.
 * 
 * PROCESS:
 * 1. Check authentication and admin role
 * 2. Validate request body
 * 3. Verify password for delete-all
 * 4. Filter admin accounts
 * 5. Delete users
 * 6. Return result
 * 
 * @param request - Next.js request object containing deletion parameters
 * @returns JSON response with deletion result or error
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: CHECK AUTHENTICATION
     * 
     * User must be authenticated to perform bulk delete operations.
     */
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    /**
     * STEP 2: CHECK ADMIN ROLE
     * 
     * Only admins can perform bulk delete operations.
     * This is a destructive operation that requires elevated privileges.
     */
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ 
        error: 'Access denied. Admin privileges required for bulk operations.' 
      }, { status: 403 })
    }

    /**
     * STEP 3: PARSE REQUEST BODY
     * 
     * Extracts deletion parameters from request body.
     * 
     * PARAMETERS:
     * - ids: Array of user IDs to delete (for bulk delete)
     * - password: Admin password (required for delete-all)
     * - deleteAll: Boolean flag for delete-all operation
     */
    const body = await request.json()
    const { ids, password, deleteAll } = body

    /**
     * STEP 4: VALIDATE REQUEST
     * 
     * Validates request parameters based on operation type.
     * 
     * DELETE-ALL VALIDATION:
     * - Requires password for security
     * - Prevents accidental deletion of all users
     * 
     * BULK DELETE VALIDATION:
     * - Requires non-empty array of user IDs
     * - Must specify which users to delete
     */
    if (deleteAll && !password) {
      return NextResponse.json({ 
        error: 'Password is required for delete all operation' 
      }, { status: 400 })
    }

    if (!deleteAll && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ 
        error: 'User IDs are required for bulk delete' 
      }, { status: 400 })
    }

    /**
     * STEP 5: VERIFY ADMIN PASSWORD (DELETE-ALL)
     * 
     * For delete-all operations, verifies admin password.
     * This is an additional security measure to prevent accidental deletion.
     * 
     * SECURITY:
     * - Requires password verification
     * - Uses bcrypt.compare for secure password checking
     * - Prevents unauthorized delete-all operations
     */
    if (deleteAll) {
      const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!adminUser) {
        return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
      }

      const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash)
      if (!isPasswordValid) {
        return NextResponse.json({ 
          error: 'Invalid password. Delete all operation cancelled.' 
        }, { status: 401 })
      }
    }

    /**
     * STEP 6: PERFORM DELETION
     * 
     * Executes deletion based on operation type.
     * Tracks count of deleted users.
     */
    let deletedCount = 0

    if (deleteAll) {
      /**
       * DELETE-ALL OPERATION
       * 
       * Deletes all users except:
       * - Current admin user (session.user.id)
       * - Main admin account (username 'admin')
       * 
       * SECURITY:
       * - Always preserves at least one admin account
       * - Prevents accidental lockout
       * - Uses Prisma deleteMany for efficiency
       */
      const result = await prisma.user.deleteMany({
        where: {
          id: {
            not: session.user.id // Don't delete the current admin
          },
          username: {
            not: 'admin' // Don't delete the main admin account
          }
        }
      })
      deletedCount = result.count
    } else {
      /**
       * BULK DELETE OPERATION
       * 
       * Deletes specific users by IDs.
       * 
       * STEP 6A: FILTER ADMIN ACCOUNTS
       * 
       * Removes admin accounts from deletion list.
       * Protects:
       * - Current admin user (session.user.id)
       * - Main admin account (username 'admin')
       */
      const safeIds = ids.filter(id => 
        id !== session.user.id && 
        id !== 'admin'
      )

      if (safeIds.length === 0) {
        return NextResponse.json({ 
          error: 'Cannot delete admin accounts' 
        }, { status: 400 })
      }

      /**
       * STEP 6B: VERIFY USERS EXIST
       * 
       * Verifies all user IDs exist and are not admin accounts.
       * This ensures we only delete valid, non-admin users.
       * 
       * VALIDATION:
       * - Checks user IDs exist in database
       * - Excludes admin accounts
       * - Ensures all IDs are valid before deletion
       */
      const usersToDelete = await prisma.user.findMany({
        where: {
          id: { in: safeIds },
          username: { not: 'admin' }
        },
        select: { id: true, username: true }
      })

      if (usersToDelete.length !== safeIds.length) {
        return NextResponse.json({ 
          error: 'Some users not found or cannot be deleted' 
        }, { status: 400 })
      }

      /**
       * STEP 6C: DELETE USERS
       * 
       * Performs bulk deletion of validated user IDs.
       * Uses Prisma deleteMany for efficient batch deletion.
       */
      const result = await prisma.user.deleteMany({
        where: {
          id: { in: safeIds }
        }
      })
      deletedCount = result.count
    }

    /**
     * STEP 7: RETURN SUCCESS RESPONSE
     * 
     * Returns deletion result with count and message.
     * Message includes pluralization for proper grammar.
     */
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} user${deletedCount !== 1 ? 's' : ''}`,
      deletedCount
    })

  } catch (error) {
    console.error('Bulk delete users error:', error)
    return NextResponse.json(
      { error: 'Internal server error during bulk delete operation' },
      { status: 500 }
    )
  }
}
