import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createUserSchema, userQuerySchema } from '@/lib/validations/users'
import { generateSecurePassword, generateRandomString } from '@/lib/utils'
import { sendAdminCreatedAccountVerificationEmail, sendTemporaryPasswordEmail } from '@/lib/email'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

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
    const queryValidation = userQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      roleId: searchParams.get('roleId'),
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

    const { page, limit, search, roleId, isActive, sortBy, sortOrder } = queryValidation.data
    const skip = (page - 1) * limit

    // Build where clause for users with filters
    const where: any = {
      // Hide admin user from listing (exclude username 'admin')
      username: {
        not: 'admin'
      }
    }

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ]
    }

    if (roleId) {
      where.roleId = roleId
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'username') {
      orderBy.username = sortOrder
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder
    } else if (sortBy === 'firstName') {
      orderBy.firstName = sortOrder
    } else if (sortBy === 'lastName') {
      orderBy.lastName = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    
    // Get total count for pagination
    const total = await prisma.user.count({ where })

    // Get paginated data
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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

    
    // Calculate pages - ensure at least 1 page even when total is 0
    const pages = total === 0 ? 1 : Math.ceil(total / limit)
    
    const response = {
      data: users,
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
        roleId,
        isActive,
        sortBy,
        sortOrder
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [API ERROR] Error fetching users:', error)
    console.error('❌ [API ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
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
    
    // For admin-created users, we don't require password in the request
    // We'll generate one automatically
    const adminCreateUserSchema = z.object({
      username: z.string().min(3).max(30),
      email: z.string().email(),
      firstName: z.string().min(1).max(50),
      lastName: z.string().min(1).max(50),
      roleId: z.string().optional().nullable(),
      isActive: z.boolean().default(true),
    })
    
    // Validate the request body
    const validationResult = adminCreateUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { username, email, firstName, lastName, roleId, isActive } = validationResult.data

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Validate role exists if provided (and not null/empty)
    if (roleId && roleId !== null && roleId !== '') {
      const role = await prisma.role.findUnique({
        where: { 
          id: roleId,
          isActive: true 
        }
      })

      if (!role) {
        return NextResponse.json(
          { error: 'Invalid or inactive role ID' },
          { status: 400 }
        )
      }
    }

    // Generate secure password for admin-created user
    const generatedPassword = generateSecurePassword()
    const passwordHash = await bcrypt.hash(generatedPassword, 12)

    // Create user with admin-created flags
    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        roleId: roleId === '' ? null : roleId,
        isActive: isActive !== undefined ? isActive : true,
        passwordHash,
        mustChangePassword: true, // Force password change on first login
        createdByAdmin: true, // Mark as admin-created
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        isActive: true,
        emailVerified: true,
        mustChangePassword: true,
        createdByAdmin: true,
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

    // Create verification token
    const verificationToken = generateRandomString(32)
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send dual emails (verification + password)
    try {
      // Send verification email with admin-created account instructions
      await sendAdminCreatedAccountVerificationEmail(
        email, 
        verificationToken, 
        firstName
      )

      // Send temporary password email separately for security
      await sendTemporaryPasswordEmail(
        email, 
        generatedPassword, 
        firstName
      )
    } catch (emailError) {
      console.error('Failed to send emails:', emailError)
      // Don't fail the user creation if email fails, but log it
      // The admin can manually send the credentials if needed
    }

    return NextResponse.json({
      ...user,
      message: 'User created successfully. Verification and password emails have been sent.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
