/**
 * ROLES API ROUTE
 * 
 * This API route handles role management operations.
 * 
 * ENDPOINT: GET /api/roles - List roles
 * ENDPOINT: POST /api/roles - Create role
 * 
 * FLOW OVERVIEW:
 * 
 * GET (List Roles):
 * 1. Verify authentication and admin role
 * 2. Parse and validate query parameters
 * 3. Build where clause with filters
 * 4. Execute paginated query
 * 5. Return roles list with pagination metadata
 * 
 * POST (Create Role):
 * 1. Verify authentication and admin role
 * 2. Parse and validate request body
 * 3. Check for duplicate role name
 * 4. Create role in database
 * 5. Return created role data
 * 
 * SECURITY FEATURES:
 * - Requires authentication
 * - Requires Admin role
 * - Duplicate role name prevention
 * - Input validation with Zod
 * 
 * QUERY PARAMETERS (GET):
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search query (name, description)
 * - isActive: Filter by active status ('true'/'false')
 * - sortBy: Sort field (name, description, createdAt, updatedAt)
 * - sortOrder: Sort direction ('asc'/'desc')
 * 
 * REQUEST BODY (POST):
 * ```json
 * {
 *   "name": "Manager",
 *   "description": "Manager role with elevated permissions",
 *   "isActive": true
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createRoleSchema, roleQuerySchema } from '@/lib/validations/roles'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryValidation = roleQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      isActive: searchParams.get('isActive'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.errors },
        { status: 400 }
      )
    }

    const { page, limit, search, isActive, sortBy, sortOrder } = queryValidation.data
    const skip = (page - 1) * limit

    // Build where clause for roles with filters
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'description') {
      orderBy.description = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Get total count for pagination
    const total = await prisma.role.count({ where })

    // Get paginated data
    const roles = await prisma.role.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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

    // Calculate pages - ensure at least 1 page even when total is 0
    const pages = total === 0 ? 1 : Math.ceil(total / limit)
    
    const response = {
      data: roles,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      },
      filters: {
        search,
        isActive,
        sortBy,
        sortOrder
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validationResult = createRoleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, description, permissions, isActive } = validationResult.data

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        isActive: isActive !== undefined ? isActive : true,
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

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
