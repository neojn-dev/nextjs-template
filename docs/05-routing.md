# Routing System

This document explains the Next.js App Router routing system used in this project.

## 🗺️ Routing Overview

Next.js 15 uses the App Router, which uses the file system as the router. Routes are created by placing files in the `app` directory.

## 📁 Route Structure

### File-Based Routing

Routes are created by files in the `app` directory:

```
app/
├── page.tsx                 # / (homepage)
├── layout.tsx                # Root layout
├── (app)/                    # Route group: protected routes
│   ├── dashboard/
│   │   └── page.tsx         # /dashboard
│   ├── doctors/
│   │   └── page.tsx         # /doctors
│   └── layout.tsx           # App layout
├── (auth)/                   # Route group: auth routes
│   ├── signin/
│   │   └── page.tsx         # /signin
│   └── signup/
│       └── page.tsx         # /signup
└── api/                      # API routes
    └── doctors/
        └── route.ts         # /api/doctors
```

## 🎯 Route Groups

Route groups (folders with parentheses) organize routes without affecting URLs.

### Protected Routes (`(app)`)

```
app/(app)/
├── dashboard/page.tsx        # /dashboard (not /(app)/dashboard)
├── doctors/page.tsx          # /doctors
└── layout.tsx                # Shared layout for all app routes
```

**Benefits**:
- Shared layout (sidebar, header)
- Authentication protection
- Organized file structure

### Auth Routes (`(auth)`)

```
app/(auth)/
├── signin/page.tsx          # /signin
├── signup/page.tsx           # /signup
└── layout.tsx                # Shared layout for auth pages
```

**Benefits**:
- Shared auth layout
- Public access (no auth required)
- Organized file structure

## 📄 Route Files

### `page.tsx` - Route Component

Creates a route at the URL path.

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <div>Dashboard</div>
}
```

**URL**: `/dashboard`

### `layout.tsx` - Layout Component

Wraps child routes with shared UI.

```typescript
// app/(app)/layout.tsx
export default function AppLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

**Applies to**: All routes in `(app)` group

### `route.ts` - API Route Handler

Creates an API endpoint.

```typescript
// app/api/doctors/route.ts
export async function GET() {
  return NextResponse.json({ doctors: [] })
}

export async function POST(request: Request) {
  const data = await request.json()
  return NextResponse.json({ success: true })
}
```

**URL**: `/api/doctors`

## 🔗 Dynamic Routes

### Single Dynamic Segment

```
app/doctors/[id]/
  └── page.tsx                 # /doctors/:id
```

**Usage**:
```typescript
// app/doctors/[id]/page.tsx
export default async function DoctorPage({ params }) {
  const { id } = params
  const doctor = await db.doctor.findUnique({ where: { id } })
  return <div>{doctor.name}</div>
}
```

### Multiple Dynamic Segments

```
app/docs/[category]/[slug]/
  └── page.tsx                 # /docs/:category/:slug
```

### Catch-All Routes

```
app/docs/[...slug]/
  └── page.tsx                 # /docs/* (catches all paths)
```

## 🔒 Route Protection

### Middleware Protection

Routes are protected via `middleware.ts`:

```typescript
// middleware.ts
export default withAuth(
  function middleware(req) {
    // Protected routes logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check authentication
      }
    }
  }
)
```

### Route Groups

| Group | Protection | Purpose |
|-------|-----------|---------|
| `(app)` | ✅ Protected | Authenticated pages |
| `(auth)` | ❌ Public | Authentication pages |
| `api` | 🔐 API Auth | API endpoints |

## 🌐 Route Examples

### Page Routes

| File Path | URL | Description |
|-----------|-----|-------------|
| `app/page.tsx` | `/` | Homepage |
| `app/(app)/dashboard/page.tsx` | `/dashboard` | Dashboard (protected) |
| `app/(app)/doctors/page.tsx` | `/doctors` | Doctors list (protected) |
| `app/(auth)/signin/page.tsx` | `/signin` | Login page (public) |

### API Routes

| File Path | URL | Method |
|-----------|-----|--------|
| `app/api/doctors/route.ts` | `/api/doctors` | GET, POST |
| `app/api/doctors/[id]/route.ts` | `/api/doctors/:id` | GET, PUT, DELETE |

## 🧭 Navigation

### Client-Side Navigation

Use Next.js `Link` component:

```typescript
import Link from 'next/link'

<Link href="/dashboard">Dashboard</Link>
```

### Programmatic Navigation

Use Next.js router:

```typescript
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/dashboard')
```

### Server-Side Redirect

Use Next.js redirect:

```typescript
import { redirect } from 'next/navigation'

export default async function Page() {
  if (!session) {
    redirect('/signin')
  }
  return <div>Protected Content</div>
}
```

## 📋 Route Configuration

### Middleware Configuration

Routes to protect in `middleware.ts`:

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/doctors/:path*",
    "/signin",
    "/signup"
  ]
}
```

### Navigation Configuration

Routes defined in `lib/navigation.ts`:

```typescript
export const navigationItems = [
  { href: '/dashboard', title: 'Dashboard', icon: Home },
  { href: '/doctors', title: 'Doctors', icon: Users },
  // ...
]
```

## 🔄 Route Loading States

### Loading UI

Create `loading.tsx` for loading states:

```
app/dashboard/
├── page.tsx
└── loading.tsx               # Loading UI for /dashboard
```

### Error UI

Create `error.tsx` for error states:

```
app/dashboard/
├── page.tsx
└── error.tsx                  # Error UI for /dashboard
```

## 📝 Best Practices

### 1. Use Route Groups

Organize related routes with route groups.

### 2. Shared Layouts

Use `layout.tsx` for shared UI across routes.

### 3. API Routes

Keep API routes in `app/api/` directory.

### 4. Dynamic Routes

Use dynamic segments for parameterized routes.

### 5. Protected Routes

Use middleware for route protection.

## 🔗 Related Documentation

- [Project Structure](./04-project-structure.md) - File organization
- [Authentication](./06-authentication.md) - Route protection
- [API Routes](./08-api-routes.md) - API routing

---

**Next**: [Authentication](./06-authentication.md)

