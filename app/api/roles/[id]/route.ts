/**
 * ROLE BY ID API ROUTE
 * 
 * This API route handles individual role operations by ID.
 * 
 * ENDPOINT: GET /api/roles/[id] - Get role by ID
 * ENDPOINT: PUT /api/roles/[id] - Update role by ID
 * ENDPOINT: DELETE /api/roles/[id] - Delete role by ID
 * 
 * FLOW OVERVIEW:
 * 
 * GET (Get Role by ID):
 * 1. Verify authentication and admin role
 * 2. Validate role ID parameter
 * 3. Fetch role from database with user count
 * 4. Return role data
 * 
 * PUT (Update Role):
 * 1. Verify authentication and admin role
 * 2. Validate role ID and request body
 * 3. Check if role exists
 * 4. Validate role name uniqueness (if changed)
 * 5. Update role in database
 * 6. Return updated role data
 * 
 * DELETE (Delete Role):
 * 1. Verify authentication and admin role
 * 2. Validate role ID parameter
 * 3. Check if role exists
 * 4. Check if role has assigned users
 * 5. Delete role (only if no users assigned)
 * 6. Return success message
 * 
 * SECURITY FEATURES:
 * - Requires authentication
 * - Requires Admin role for all operations
 * - Prevents deletion of roles with assigned users
 * - Duplicate role name prevention
 * - Input validation with Zod
 * 
 * DELETE PROTECTION:
 * - Cannot delete role if it has assigned users
 * - Prevents breaking user-role relationships
 * - Requires reassigning users before deletion
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - Forbidden: 403 (not admin)
 * - Not Found: 404 (role doesn't exist)
 * - Bad Request: 400 (validation errors, duplicate name, has users)
 * - Internal Server Error: 500 (database errors)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateRoleSchema, roleIdSchema } from '@/lib/validations/roles'

/**
 * GET HANDLER
 * 
 * Retrieves a single role by ID.
 * 
 * PROCESS:
 * 1. Check authentication and admin role
 * 2. Validate role ID parameter
 * 3. Fetch role from database
 * 4. Return role data
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing role ID
 * @returns JSON response with role data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  /**
   * STEP 1: RESOLVE PARAMS
   * 
   * Next.js 15+ requires params to be awaited.
   * Extracts role ID from route parameters.
   */
  const resolvedParams = await params
  try {
    /**
     * STEP 2: CHECK AUTHENTICATION
     * 
     * User must be authenticated to access role data.
     */
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    /**
     * STEP 3: CHECK ADMIN ROLE
     * 
     * Only admins can view individual role details.
     */
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    /**
     * STEP 4: VALIDATE ROLE ID
     * 
     * Validates that the role ID parameter is valid.
     * Uses Zod schema for validation.
     */
    const { id } = await params
    const validationResult = roleIdSchema.safeParse({ id })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }

    /**
     * STEP 5: FETCH ROLE FROM DATABASE
     * 
     * Retrieves role data with user count.
     * 
     * WHAT'S INCLUDED:
     * - id: Role ID
     * - name: Role name
     * - description: Role description
     * - permissions: Role permissions (JSON)
     * - isActive: Active status
     * - createdAt: Creation timestamp
     * - updatedAt: Update timestamp
     * - _count.users: Number of users assigned to this role
     */
    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      }
    })

    /**
     * STEP 6: CHECK IF ROLE EXISTS
     * 
     * If role not found, return 404 error.
     */
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    /**
     * STEP 7: RETURN ROLE DATA
     * 
     * Returns role information including user count.
     */
    return NextResponse.json(role)
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT HANDLER
 * 
 * Updates an existing role by ID.
 * 
 * PROCESS:
 * 1. Check authentication and admin role
 * 2. Validate role ID and request body
 * 3. Check role existence
 * 4. Validate role name uniqueness
 * 5. Update role data
 * 6. Return updated role
 * 
 * @param request - Next.js request object containing update data
 * @param params - Route parameters containing role ID
 * @returns JSON response with updated role data or error
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
     * User must be authenticated to update roles.
     */
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    /**
     * STEP 3: CHECK ADMIN ROLE
     * 
     * Only admins can update roles.
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
     * Validates role ID and request body against schema.
     * Combines route params with body data for validation.
     */
    const { id } = await params
    const validationResult = updateRoleSchema.safeParse({ ...body, id })
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
    const { name, description, permissions, isActive } = validationResult.data

    /**
     * STEP 7: CHECK IF ROLE EXISTS
     * 
     * Verifies role exists before attempting update.
     */
    const existingRole = await prisma.role.findUnique({
      where: { id }
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    /**
     * STEP 8: VALIDATE ROLE NAME UNIQUENESS
     * 
     * If role name is being changed, check if new name is available.
     * Skip check if name is unchanged.
     * 
     * SECURITY: Prevents duplicate role names.
     */
    if (name && name !== existingRole.name) {
      const roleWithSameName = await prisma.role.findUnique({
        where: { name }
      })

      if (roleWithSameName) {
        return NextResponse.json(
          { error: 'Role name already exists' },
          { status: 400 }
        )
      }
    }

    /**
     * STEP 9: UPDATE ROLE IN DATABASE
     * 
     * Performs the actual database update.
     * Only includes fields that are provided (partial update).
     * 
     * FIELDS THAT CAN BE UPDATED:
     * - name: Role name
     * - description: Role description
     * - permissions: Role permissions (JSON)
     * - isActive: Active status
     */
    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions !== undefined && { permissions }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE HANDLER
 * 
 * Deletes a role by ID (only if no users assigned).
 * 
 * PROCESS:
 * 1. Check authentication and admin role
 * 2. Validate role ID parameter
 * 3. Check role exists
 * 4. Check if role has assigned users
 * 5. Delete role (only if no users)
 * 6. Return success message
 * 
 * DELETE PROTECTION:
 * - Cannot delete role if users are assigned
 * - Prevents breaking user-role relationships
 * - Requires reassigning users before deletion
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing role ID
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
     * User must be authenticated to delete roles.
     */
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    /**
     * STEP 3: CHECK ADMIN ROLE
     * 
     * Only admins can delete roles.
     */
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    /**
     * STEP 4: VALIDATE ROLE ID
     * 
     * Validates that the role ID parameter is valid.
     */
    const { id } = await params
    const validationResult = roleIdSchema.safeParse({ id })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }

    /**
     * STEP 5: CHECK IF ROLE EXISTS
     * 
     * Verifies role exists and gets user count.
     * Includes user count to check for assigned users.
     */
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      }
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    /**
     * STEP 6: CHECK IF ROLE HAS ASSIGNED USERS
     * 
     * SECURITY FEATURE:
     * Prevents deletion of roles that have users assigned.
     * 
     * WHY THIS CHECK?
     * - Prevents breaking user-role relationships
     * - Maintains data integrity
     * - Requires explicit user reassignment before deletion
     * - Prevents orphaned users (users without roles)
     */
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users. Please reassign users first.' },
        { status: 400 }
      )
    }

    /**
     * STEP 7: DELETE ROLE
     * 
     * Deletes role from database.
     * Only executed if no users are assigned.
     */
    await prisma.role.delete({
      where: { id }
    })

    /**
     * STEP 8: RETURN SUCCESS RESPONSE
     * 
     * Returns success message after successful deletion.
     */
    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
