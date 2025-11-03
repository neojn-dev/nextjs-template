# Forms & Validation

This document explains form handling and validation using React Hook Form and Zod.

## 📝 Forms Overview

The application uses **React Hook Form** for form management and **Zod** for schema validation.

## 🏗️ Form Architecture

### Form Libraries

| Library | Purpose |
|--------|---------|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **@hookform/resolvers** | Zod integration with React Hook Form |

## 📦 Form Components

### Form Setup

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Define schema
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
})

type FormData = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 18,
    }
  })

  const onSubmit = async (data: FormData) => {
    // Handle form submission
    const response = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register("firstName")} />
      {form.formState.errors.firstName && (
        <p>{form.formState.errors.firstName.message}</p>
      )}
      
      <Input {...form.register("email")} />
      {form.formState.errors.email && (
        <p>{form.formState.errors.email.message}</p>
      )}
      
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## ✅ Validation Schemas

### Zod Schema Examples

**User Schema** (`lib/validations/users.ts`):
```typescript
import { z } from "zod"

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleId: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
```

**Doctor Schema**:
```typescript
export const createDoctorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  specialization: z.string().min(1, "Specialization is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  yearsOfExperience: z.number().optional(),
  salary: z.number().optional(),
  isActive: z.boolean().default(true),
})
```

### Validation Rules

**Common Rules**:

```typescript
// Required string
z.string().min(1, "Required")

// Email
z.string().email("Invalid email")

// Password
z.string().min(8, "Must be at least 8 characters")

// Number range
z.number().min(0).max(100)

// Optional field
z.string().optional()

// Default value
z.boolean().default(true)

// Enum
z.enum(["option1", "option2", "option3"])

// Date
z.date()

// Array
z.array(z.string())
```

## 📋 Form Components

### Input Component

**Usage**:
```typescript
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"

const { register, formState: { errors } } = useForm()

<Input
  {...register("firstName")}
  placeholder="First name"
/>
{errors.firstName && (
  <p className="text-red-600">{errors.firstName.message}</p>
)}
```

### Password Input

**File**: `components/forms/password-input.tsx`

**Usage**:
```typescript
import { PasswordInput } from "@/components/forms/password-input"

<PasswordInput
  {...register("password")}
  placeholder="Password"
/>
```

**Features**:
- Show/hide password toggle
- Password strength indicator (optional)

### Select Component

**Usage**:
```typescript
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"

<Select {...register("department")}>
  <SelectTrigger>
    <SelectValue placeholder="Select department" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="cardiology">Cardiology</SelectItem>
    <SelectItem value="neurology">Neurology</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox Component

**Usage**:
```typescript
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox
  checked={form.watch("isActive")}
  onCheckedChange={(checked) => form.setValue("isActive", !!checked)}
/>
```

### File Input

**File**: `components/forms/file-input.tsx`

**Usage**:
```typescript
import { FileInput } from "@/components/forms/file-input"

<FileInput
  onFileSelect={(file) => {
    // Handle file selection
  }}
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

**Features**:
- File type validation
- File size validation
- Drag & drop support

## 🔄 Form Handling Patterns

### Controlled Form

```typescript
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
})

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  })
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // Submit form
}
```

### Uncontrolled Form with React Hook Form

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})

<form onSubmit={handleSubmit(onSubmit)}>
  <Input {...register("firstName")} />
</form>
```

## ✅ Validation Patterns

### Client-Side Validation

Validate on the client before submission:

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: "onChange", // Validate on change
})

// Validation errors shown immediately
```

### Server-Side Validation

Validate on the server in API routes:

```typescript
// app/api/doctors/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = createDoctorSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  
  // Use validated data
  const doctor = await db.doctor.create({ data: parsed.data })
}
```

## 🎨 Form Layout Patterns

### Simple Form

```typescript
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  <div>
    <Label>First Name</Label>
    <Input {...register("firstName")} />
    {errors.firstName && <Error>{errors.firstName.message}</Error>}
  </div>
  
  <Button type="submit">Submit</Button>
</form>
```

### Multi-Column Form

```typescript
<form onSubmit={handleSubmit(onSubmit)}>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label>First Name</Label>
      <Input {...register("firstName")} />
    </div>
    <div>
      <Label>Last Name</Label>
      <Input {...register("lastName")} />
    </div>
  </div>
</form>
```

### Form with Sections

```typescript
<form onSubmit={handleSubmit(onSubmit)}>
  <section className="space-y-4">
    <h3>Personal Information</h3>
    <Input {...register("firstName")} />
    <Input {...register("lastName")} />
  </section>
  
  <section className="space-y-4">
    <h3>Contact Information</h3>
    <Input {...register("email")} />
    <Input {...register("phone")} />
  </section>
</form>
```

## 📝 Best Practices

### 1. Always Validate

Validate both client-side and server-side.

### 2. Use Zod Schemas

Define validation schemas with Zod.

### 3. Show Clear Errors

Display validation errors clearly to users.

### 4. Handle Loading States

Show loading state during form submission.

### 5. Reset After Submit

Reset form after successful submission.

### 6. Use TypeScript

Type all form data and validation schemas.

## 🔗 Related Documentation

- [Components Overview](./09-components-overview.md) - Component architecture
- [UI Components](./10-ui-components.md) - UI components
- [API Routes](./08-api-routes.md) - Server-side validation

---

**Next**: [Data Tables](./12-data-tables.md)

