# API Routes

This document explains the API routing system and how API endpoints are implemented using Next.js Route Handlers.

## 🌐 API Routes Overview

Next.js App Router uses Route Handlers to create API endpoints. API routes are defined in the `app/api` directory using `route.ts` files.

## 📁 API Route Structure

```
app/api/
├── auth/                     # Authentication endpoints
│   ├── [...nextauth]/       # NextAuth.js API route
│   ├── signup/
│   │   └── route.ts          # POST /api/auth/signup
│   ├── signin/
│   │   └── route.ts          # POST /api/auth/signin
│   ├── verify/
│   │   └── route.ts          # GET /api/auth/verify
│   └── ...
├── doctors/                  # Doctor CRUD endpoints
│   ├── route.ts              # GET, POST /api/doctors
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE /api/doctors/:id
├── users/                     # User management endpoints
├── roles/                     # Role management endpoints
├── workflows/                # Workflow endpoints
│   └── transfer-requests/
│       ├── route.ts          # GET, POST /api/workflows/transfer-requests
│       └── [id]/
│           ├── route.ts      # GET /api/workflows/transfer-requests/:id
│           ├── approve/
│           │   └── route.ts  # POST /api/workflows/transfer-requests/:id/approve
│           └── reject/
│               └── route.ts  # POST /api/workflows/transfer-requests/:id/reject
└── dashboard/                 # Dashboard analytics endpoints
```

## 🛠️ Route Handler Implementation

### Basic Route Handler

**File**: `app/api/doctors/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/doctors
export async function GET(request: NextRequest) {
  try {
    const doctors = await db.doctor.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ data: doctors })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}

// POST /api/doctors
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const doctor = await db.doctor.create({ data: body })
    
    return NextResponse.json({ data: doctor }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    )
  }
}
```

### Dynamic Route Handler

**File**: `app/api/doctors/[id]/route.ts`

```typescript
// GET /api/doctors/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await db.doctor.findUnique({
      where: { id: params.id }
    })
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ data: doctor })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    )
  }
}

// PUT /api/doctors/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const doctor = await db.doctor.update({
      where: { id: params.id },
      data: body
    })
    
    return NextResponse.json({ data: doctor })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    )
  }
}

// DELETE /api/doctors/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.doctor.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    )
  }
}
```

## 🔐 Authentication in API Routes

### Session Validation

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // Get session
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  // User is authenticated, proceed
  // ...
}
```

### Role-Based Authorization

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  // Check role
  if (session.user.role !== 'Admin') {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }
  
  // Admin-only operation
  // ...
}
```

## ✅ Validation in API Routes

### Zod Validation

```typescript
import { z } from "zod"

const createDoctorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  // ...
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const parsed = createDoctorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    // Use validated data
    const doctor = await db.doctor.create({
      data: parsed.data
    })
    
    return NextResponse.json({ data: doctor }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    )
  }
}
```

## 📊 Query Parameters

### Pagination

```typescript
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get("page") || "1")
  const limit = parseInt(url.searchParams.get("limit") || "10")
  const skip = (page - 1) * limit
  
  const [doctors, total] = await Promise.all([
    db.doctor.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    db.doctor.count()
  ])
  
  return NextResponse.json({
    data: doctors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
}
```

### Filtering

```typescript
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const department = url.searchParams.get("department")
  const isActive = url.searchParams.get("isActive")
  
  const where: any = {}
  if (department) {
    where.department = department
  }
  if (isActive !== null) {
    where.isActive = isActive === "true"
  }
  
  const doctors = await db.doctor.findMany({ where })
  
  return NextResponse.json({ data: doctors })
}
```

### Search

```typescript
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get("search")
  
  const where: any = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } }
    ]
  }
  
  const doctors = await db.doctor.findMany({ where })
  
  return NextResponse.json({ data: doctors })
}
```

## 📝 Request/Response Patterns

### Standard Response Format

```typescript
// Success response
return NextResponse.json({
  data: result,
  message: "Success message"
})

// Error response
return NextResponse.json(
  { error: "Error message" },
  { status: 400 }
)

// Pagination response
return NextResponse.json({
  data: items,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    pages: 10
  }
})
```

### Error Handling

```typescript
export async function POST(request: NextRequest) {
  try {
    // Operation
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("API Error:", error)
    
    // Handle specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Duplicate entry" },
          { status: 409 }
        )
      }
    }
    
    // Generic error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## 🔄 Common API Patterns

### CRUD Operations

| Operation | Method | Route | Handler |
|----------|--------|-------|---------|
| Create | POST | `/api/resource` | `POST(request)` |
| Read (List) | GET | `/api/resource` | `GET(request)` |
| Read (Single) | GET | `/api/resource/:id` | `GET(request, { params })` |
| Update | PUT | `/api/resource/:id` | `PUT(request, { params })` |
| Delete | DELETE | `/api/resource/:id` | `DELETE(request, { params })` |

### Bulk Operations

```typescript
// POST /api/doctors/bulk-delete
export async function POST(request: NextRequest) {
  const { ids } = await request.json()
  
  await db.doctor.deleteMany({
    where: { id: { in: ids } }
  })
  
  return NextResponse.json({ success: true })
}
```

### Nested Routes

```typescript
// POST /api/workflows/transfer-requests/:id/approve
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Approve workflow request
  // ...
}
```

## 📋 API Endpoints Reference

### Authentication APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | User registration |
| `/api/auth/signin` | POST | User login |
| `/api/auth/verify` | GET | Email verification |
| `/api/auth/forgot-password` | POST | Password reset request |
| `/api/auth/reset-password` | POST | Password reset |

### Resource APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/doctors` | GET, POST | List/create doctors |
| `/api/doctors/:id` | GET, PUT, DELETE | Get/update/delete doctor |
| `/api/users` | GET, POST | List/create users |
| `/api/users/:id` | GET, PUT, DELETE | Get/update/delete user |
| `/api/roles` | GET, POST | List/create roles |
| `/api/roles/:id` | GET, PUT, DELETE | Get/update/delete role |

### Workflow APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workflows/transfer-requests` | GET, POST | List/create requests |
| `/api/workflows/transfer-requests/:id` | GET | Get request details |
| `/api/workflows/transfer-requests/:id/approve` | POST | Approve request |
| `/api/workflows/transfer-requests/:id/reject` | POST | Reject request |
| `/api/workflows/transfer-requests/:id/request-changes` | POST | Request changes |

## 🧪 Testing API Routes

### Manual Testing

Use tools like Postman or Insomnia to test API endpoints.

### Example Request

```bash
# GET request
curl http://localhost:3000/api/doctors

# POST request
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com"}'
```

## 📝 Best Practices

### 1. Always Validate Input

Use Zod schemas to validate all inputs.

### 2. Handle Errors Gracefully

Always return appropriate error responses.

### 3. Use TypeScript

Type all request/response data.

### 4. Authenticate Requests

Check authentication in protected endpoints.

### 5. Authorize Actions

Check user roles/permissions before actions.

### 6. Use Transactions

Use database transactions for multi-step operations.

### 7. Standardize Responses

Use consistent response formats.

## 🔗 Related Documentation

- [Database](./07-database.md) - Database operations
- [Authentication](./06-authentication.md) - Auth in APIs
- [Validation](./11-forms-validation.md) - Zod schemas

---

**Next**: [Components Overview](./09-components-overview.md)

