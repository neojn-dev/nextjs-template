import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // Cap at 100 for performance
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const subject = searchParams.get('subject') || ''
    const isActive = searchParams.get('isActive') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause for all teachers with filters (global data)
    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ]
    }

    if (department) {
      if (department.startsWith('!')) {
        // Handle "not equals" filter
        const value = department.substring(1)
        where.department = { not: { equals: value } }
      } else {
        where.department = { contains: department }
      }
    }

    if (subject) {
      if (subject.startsWith('!')) {
        // Handle "not equals" filter
        const value = subject.substring(1)
        where.subject = { not: { equals: value } }
      } else {
        where.subject = { contains: subject }
      }
    }

    if (isActive !== '') {
      where.isActive = isActive === 'true'
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.firstName = sortOrder
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder
    } else if (sortBy === 'department') {
      orderBy.department = sortOrder
    } else if (sortBy === 'subject') {
      orderBy.subject = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    
    // Get total count for pagination
    const total = await prisma.teacher.count({ where })

    // Get paginated data
    const teachers = await prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        department: true,
        subject: true,
        yearsOfExperience: true,
        salary: true,
        hireDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    
    // Calculate pages - ensure at least 1 page even when total is 0
    const pages = total === 0 ? 1 : Math.ceil(total / limit)
    
    const response = {
      data: teachers,
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
        department,
        subject,
        isActive,
        sortBy,
        sortOrder
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [API ERROR] Error fetching teachers:', error)
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

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      employeeId,
      department,
      subject,
      yearsOfExperience,
      salary,
      hireDate,
      isActive
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !employeeId || !department || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.teacher.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Check if employee ID already exists
    const existingEmployeeId = await prisma.teacher.findUnique({
      where: { employeeId }
    })

    if (existingEmployeeId) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    // Log session information for debugging
    
    // Try to get user ID from session or fallback to email lookup
    let userId = session.user.id
    
    if (!userId && session.user.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        })
        if (user) {
          userId = user.id
        } else {
          console.error('❌ [API ERROR] No user found with email:', session.user.email)
        }
      } catch (error) {
        console.error('❌ [API ERROR] Error looking up user by email:', error)
      }
    }
    
    if (!userId) {
      console.error('❌ [API ERROR] No user ID available from session or email lookup')
      console.error('❌ [API ERROR] Available session data:', {
        hasUser: !!session.user,
        userKeys: Object.keys(session.user || {}),
        userEmail: session.user?.email,
        sessionKeys: Object.keys(session)
      })
      return NextResponse.json(
        { error: 'User ID not found in session', debug: { sessionKeys: Object.keys(session), userKeys: Object.keys(session.user || {}) } },
        { status: 400 }
      )
    }

    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email,
        employeeId,
        department,
        subject,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        salary: salary ? parseFloat(salary) : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        isActive: isActive !== undefined ? isActive : true,

      }
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
