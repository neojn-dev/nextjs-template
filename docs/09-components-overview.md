# Components Overview

This document provides an overview of the React component architecture and organization.

## 🧩 Component Architecture

Components are organized by purpose and reusability:

```
components/
├── ui/                      # Base UI components (shadcn/ui)
├── forms/                   # Form components
├── charts/                  # Chart components
├── data-table/              # Data table components
├── dashboard/               # Dashboard components
├── website-components/       # Site-wide components
└── providers/               # Context providers
```

## 📦 Component Types

### 1. UI Components (`components/ui/`)

Base UI components from shadcn/ui library.

**Purpose**: Fundamental building blocks for UI

**Examples**:
- `Button` - Button component
- `Input` - Text input component
- `Dialog` - Modal dialog component
- `Card` - Card container component
- `Table` - Table component

**Usage**:
```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

<Button>Click me</Button>
<Input placeholder="Enter text..." />
```

### 2. Form Components (`components/forms/`)

Form-specific components.

**Purpose**: Reusable form components with validation

**Examples**:
- `PasswordInput` - Password input with show/hide toggle
- `FileInput` - File upload input with validation
- `MasterDataForm` - Master data form component

**Usage**:
```typescript
import { PasswordInput } from "@/components/forms/password-input"

<PasswordInput
  value={password}
  onChange={setPassword}
  required
/>
```

### 3. Chart Components (`components/charts/`)

Data visualization components.

**Purpose**: Display data in chart formats

**Examples**:
- `BarChart` - Bar chart component
- `PieChart` - Pie chart component
- `LineChart` - Line chart component
- `AreaChart` - Area chart component

**Usage**:
```typescript
import { BarChart } from "@/components/charts"

<BarChart
  data={chartData}
  xAxisKey="month"
  dataKeys={[{ key: 'sales', name: 'Sales' }]}
/>
```

### 4. Data Table Components (`components/data-table/`)

Data table functionality.

**Purpose**: Display and manage tabular data

**Examples**:
- `DataTable` - Main data table component
- `SelectionColumn` - Row selection column

**Usage**:
```typescript
import { DataTable } from "@/components/data-table/data-table"

<DataTable
  data={doctors}
  columns={doctorColumns}
  pagination={{ pageIndex: 0, pageSize: 10 }}
/>
```

### 5. Dashboard Components (`components/dashboard/`)

Dashboard-specific components.

**Purpose**: Dashboard analytics and filters

**Examples**:
- `DashboardFilters` - Dashboard filter component
- `KPITiles` - KPI tiles component

**Usage**:
```typescript
import { DashboardFilters } from "@/components/dashboard/DashboardFilters"

<DashboardFilters
  currentFilters={filters}
  onFiltersChange={handleFiltersChange}
/>
```

### 6. Website Components (`components/website-components/`)

Site-wide layout components.

**Purpose**: Layout and navigation components

**Examples**:
- `Sidebar` - Sidebar navigation
- `AppHeader` - Application header
- `AppFooter` - Application footer
- `AuthGraphic` - Authentication page graphics

**Usage**:
```typescript
import { Sidebar } from "@/components/website-components"

<Sidebar isCollapsed={isCollapsed} onToggle={toggleCollapse} />
```

### 7. Provider Components (`components/providers/`)

Context providers.

**Purpose**: Provide context to components

**Examples**:
- `SessionProvider` - NextAuth session provider wrapper

**Usage**:
```typescript
import { SessionProviderWrapper } from "@/components/providers/session-provider"

<SessionProviderWrapper>
  {children}
</SessionProviderWrapper>
```

## 🏗️ Component Composition

### Component Hierarchy

Components are composed hierarchically:

```
Page Component
    ↓
Layout Component
    ↓
Feature Components
    ↓
UI Components (shadcn/ui)
    ↓
HTML Elements
```

### Example Composition

```typescript
// Page component
export default function DoctorsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctors</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={doctors}
          columns={columns}
        />
      </CardContent>
    </Card>
  )
}
```

## 📋 Component Patterns

### 1. Server Components

Default in Next.js App Router. No `"use client"` directive.

```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await db.doctor.findMany()
  return <Dashboard data={data} />
}
```

### 2. Client Components

Marked with `"use client"` directive.

```typescript
"use client"
import { useState } from "react"

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 3. Compound Components

Components composed of multiple sub-components.

```typescript
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogBody>Content</DialogBody>
  </DialogContent>
</Dialog>
```

### 4. Controlled Components

Components controlled by parent via props.

```typescript
function ControlledInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
```

### 5. Uncontrolled Components

Components manage their own state.

```typescript
function UncontrolledInput() {
  const [value, setValue] = useState("")
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
```

## 🎨 Styling Components

### TailwindCSS Classes

Components use TailwindCSS for styling:

```typescript
<div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
  <Button className="bg-blue-600 hover:bg-blue-700">
    Click me
  </Button>
</div>
```

### Component Variants

Components use variants for different styles:

```typescript
<Button variant="primary" size="lg">
  Primary Button
</Button>

<Button variant="secondary" size="sm">
  Secondary Button
</Button>
```

## 🔄 Component Lifecycle

### React Hooks

Components use React hooks for lifecycle and state:

```typescript
"use client"
import { useState, useEffect } from "react"

export function Component() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Fetch data on mount
    fetchData().then(setData)
  }, [])
  
  return <div>{data ? <DataDisplay data={data} /> : <Loading />}</div>
}
```

## 📚 Component Reusability

### Reusable Components

Components are designed for reusability:

- Generic props for flexibility
- Consistent interfaces
- Well-documented usage

### Component Props

Props are typed with TypeScript:

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  children: React.ReactNode
}

export function Button({ variant, size, onClick, children }: ButtonProps) {
  // Component implementation
}
```

## 🔗 Component Relationships

### Component Dependencies

Components depend on other components:

```
Page Component
    ↓ depends on
Feature Components
    ↓ depends on
UI Components
    ↓ depends on
HTML Elements
```

### Import Patterns

```typescript
// Import from UI components
import { Button } from "@/components/ui/button"

// Import from forms
import { PasswordInput } from "@/components/forms/password-input"

// Import from charts
import { BarChart } from "@/components/charts"

// Import from data-table
import { DataTable } from "@/components/data-table/data-table"
```

## 📝 Best Practices

### 1. Use Server Components by Default

Only use Client Components when necessary (interactivity, hooks, browser APIs).

### 2. Keep Components Small

Focus each component on a single responsibility.

### 3. Use TypeScript

Type all component props and state.

### 4. Reuse Components

Use existing components instead of creating duplicates.

### 5. Document Components

Add comments explaining component purpose and usage.

### 6. Test Components

Test component functionality and edge cases.

## 🔗 Related Documentation

- [UI Components](./10-ui-components.md) - Detailed UI component guide
- [Forms & Validation](./11-forms-validation.md) - Form components
- [Data Tables](./12-data-tables.md) - Data table components
- [Styling](./16-styling-theming.md) - Styling guide

---

**Next**: [UI Components](./10-ui-components.md) | [Forms & Validation](./11-forms-validation.md)

