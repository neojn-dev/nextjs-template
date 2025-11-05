# File Interactions Quick Reference

This is a quick reference guide showing exactly which files interact with each other and when.

## 🔗 Direct File Relationships

### Pages → Components → Libraries

| Page File | Imports Components | Uses Libraries | Calls APIs |
|-----------|-------------------|----------------|------------|
| `app/(app)/doctors/page.tsx` | `data-table`, `ui/*`, `forms/*` | `next-auth/react` | `/api/doctors` |
| `app/(app)/dashboard/page.tsx` | `dashboard/*`, `charts/*` | `next-auth/react` | `/api/dashboard` |
| `app/(app)/users/page.tsx` | `data-table`, `ui/*` | `next-auth/react` | `/api/users` |
| `app/(auth)/signin/page.tsx` | `ui/*`, `forms/password-input` | `next-auth/react` | NextAuth API |
| `app/(auth)/signup/page.tsx` | `ui/*`, `forms/*` | None | `/api/auth/signup` |

### API Routes → Libraries → Database

| API Route | Imports Libraries | Uses Database | Validates With |
|-----------|------------------|---------------|----------------|
| `app/api/doctors/route.ts` | `lib/auth.ts`, `lib/db.ts` | `prisma.doctor.*` | Manual validation |
| `app/api/users/route.ts` | `lib/auth.ts`, `lib/db.ts` | `prisma.user.*` | `lib/validations/users.ts` |
| `app/api/auth/signup/route.ts` | `lib/auth.ts`, `lib/db.ts`, `lib/email.ts` | `prisma.user.*` | `lib/validations/auth.ts` |
| `app/api/dashboard/route.ts` | `lib/auth.ts`, `lib/db.ts`, `lib/dashboard-data.ts` | Multiple models | None |

### Components → Other Components

| Component | Imports From | Used By |
|-----------|-------------|---------|
| `components/data-table/data-table.tsx` | `components/ui/*` | All page components |
| `components/dashboard/KPITiles.tsx` | `components/ui/card.tsx` | `dashboard/page.tsx` |
| `components/website-components/sidebar.tsx` | `lib/navigation.ts` | `app/(app)/layout.tsx` |
| `components/website-components/app-header.tsx` | `next-auth/react` | `app/(app)/layout.tsx` |

## 📍 File Location Guide

### "Where do I find...?"

| What You Need | Location | Example |
|---------------|----------|---------|
| **Page component** | `app/(app)/[feature]/page.tsx` | `app/(app)/doctors/page.tsx` |
| **API endpoint** | `app/api/[feature]/route.ts` | `app/api/doctors/route.ts` |
| **Table columns** | `app/(app)/[feature]/columns.tsx` | `app/(app)/doctors/columns.tsx` |
| **UI component** | `components/ui/[component].tsx` | `components/ui/button.tsx` |
| **Form component** | `components/forms/[component].tsx` | `components/forms/password-input.tsx` |
| **Database model** | `prisma/schema.prisma` | Model Doctor { ... } |
| **Validation schema** | `lib/validations/[feature].ts` | `lib/validations/auth.ts` |
| **Database client** | `lib/db.ts` | `import { db } from "@/lib/db"` |
| **Auth config** | `lib/auth.ts` | `import { authOptions } from "@/lib/auth"` |
| **Navigation config** | `lib/navigation.ts` | Menu items array |
| **Custom hook** | `hooks/[hook-name].ts` | `hooks/use-session-validator.ts` |
| **Type definition** | `types/[name].d.ts` | `types/next-auth.d.ts` |

## 🎯 When Files Are Loaded

### Application Startup (Server Start)
1. `next.config.js` - Read by Next.js
2. `tsconfig.json` - Read by TypeScript compiler
3. `tailwind.config.ts` - Read by Tailwind
4. `.env` - Loaded into `process.env`

### Every Request (Runtime)
1. `middleware.ts` - Runs FIRST
2. `app/layout.tsx` - Wraps response
3. Route-specific layout (if exists)
4. Page component or API route handler

### Page Load Only
- `app/(app)/*/page.tsx` - When route matches
- `app/(auth)/*/page.tsx` - When route matches
- `components/*` - When imported by page

### API Call Only
- `app/api/*/route.ts` - When API endpoint called
- `lib/db.ts` - When database access needed
- `lib/auth.ts` - When authentication check needed

## 🔄 Common Interaction Patterns

### Pattern 1: User Action → Page → API → Database

```
User clicks button
  ↓
Page component handler (onClick)
  ↓
fetch('/api/endpoint', { method: 'POST', body: ... })
  ↓
API route handler (POST function)
  ↓
lib/auth.ts (getServerSession)
  ↓
lib/db.ts (prisma.*.create())
  ↓
MySQL Database
  ↓
Response back to page
  ↓
Page updates state
  ↓
Component re-renders
```

### Pattern 2: Page Load → Fetch Data → Display

```
User visits /doctors
  ↓
doctors/page.tsx mounts
  ↓
useEffect runs
  ↓
fetch('/api/doctors')
  ↓
API route queries database
  ↓
Returns data
  ↓
setDoctors(data)
  ↓
DataTable renders with data
```

### Pattern 3: Authentication Check Flow

```
Request arrives
  ↓
middleware.ts checks path
  ↓
Calls getServerSession(authOptions)
  ↓
lib/auth.ts validates token
  ↓
If valid: Allow request
If invalid: Redirect to /signin
```

## 📊 File Import Frequency

### Most Imported Files

| File | Imported By | Count |
|------|------------|-------|
| `lib/db.ts` | All API routes | ~15+ files |
| `components/ui/button.tsx` | Many pages/components | ~20+ files |
| `lib/auth.ts` | API routes, middleware | ~10+ files |
| `components/ui/input.tsx` | Forms, pages | ~15+ files |
| `components/data-table/data-table.tsx` | All table pages | ~8+ files |

### Least Imported Files (Specific Use)

| File | Used By | Count |
|------|---------|-------|
| `lib/dashboard-data.ts` | `app/api/dashboard/route.ts` only | 1 file |
| `lib/workflows/transfer.ts` | Workflow API routes only | ~3 files |
| `hooks/use-session-validator.ts` | `app/(app)/layout.tsx` only | 1 file |
| `lib/navigation.ts` | `components/website-components/sidebar.tsx` only | 1 file |

## 🎯 Finding File Dependencies

### "What does this file depend on?"
```bash
# Check imports in a file
grep "^import" app/(app)/doctors/page.tsx

# Find what imports a specific file
grep -r "from.*lib/db" .
grep -r "import.*lib/db" .
```

### "What files use this component?"
```bash
# Find usages of Button component
grep -r "from.*components/ui/button" .
grep -r "import.*Button" .
```

### "What APIs does this page call?"
```bash
# Search for fetch calls
grep -r "fetch(" app/(app)/doctors/page.tsx
```

## 🔍 File Interaction Checklist

### Creating a New Feature? Check These Files:

- [ ] **Database**: `prisma/schema.prisma` - Add model?
- [ ] **API**: `app/api/[feature]/route.ts` - Create endpoint?
- [ ] **Page**: `app/(app)/[feature]/page.tsx` - Create page?
- [ ] **Columns**: `app/(app)/[feature]/columns.tsx` - Table columns?
- [ ] **Validation**: `lib/validations/[feature].ts` - Validation schema?
- [ ] **Navigation**: `lib/navigation.ts` - Add menu item?
- [ ] **Middleware**: `middleware.ts` - Protect route?

### Files That Automatically Work Together:

- `app/(app)/layout.tsx` + `components/website-components/sidebar.tsx` + `lib/navigation.ts`
- `app/api/*/route.ts` + `lib/auth.ts` + `lib/db.ts`
- `app/(app)/*/page.tsx` + `components/data-table/data-table.tsx` + `./columns.tsx`
- `middleware.ts` + `lib/auth.ts` + NextAuth

## 📝 Quick Commands Reference

```bash
# Find where a file is imported
grep -r "lib/db" --include="*.ts" --include="*.tsx"

# Find all API calls from a page
grep -r "fetch(" app/(app)/doctors/page.tsx

# Find component usage
grep -r "DataTable" app/

# Find database queries
grep -r "prisma\." app/api/

# Find authentication checks
grep -r "getServerSession" app/api/
```

---

**Use this guide to quickly find files and understand their relationships!**

