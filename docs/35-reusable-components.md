# Reusable Components Guide

## Table of Contents
1. [Overview](#overview)
2. [Components Folder Structure](#components-folder-structure)
3. [Lib Folder Structure](#lib-folder-structure)
4. [UI Components](#ui-components)
5. [Form Components](#form-components)
6. [Chart Components](#chart-components)
7. [Data Table Components](#data-table-components)
8. [Dashboard Components](#dashboard-components)
9. [Website Components](#website-components)
10. [Provider Components](#provider-components)
11. [Utility Functions (lib/utils.ts)](#utility-functions-libutilsts)
12. [Style Tokens (lib/styles.ts)](#style-tokens-libstylests)
13. [Animation Utilities (lib/animations.ts)](#animation-utilities-libanimationsts)
14. [Navigation Utilities (lib/navigation.ts)](#navigation-utilities-libnavigationts)
15. [Import Patterns and Best Practices](#import-patterns-and-best-practices)
16. [Creating New Reusable Components](#creating-new-reusable-components)
17. [Component Composition Patterns](#component-composition-patterns)

---

## Overview

This Next.js application follows a **component-driven architecture** with extensive reuse of UI components, utilities, and shared logic. The codebase is organized into two main directories for reusable code:

- **`/components`**: React components (UI, forms, charts, etc.)
- **`/lib`**: Utility functions, style tokens, animations, and configuration

### Key Principles

1. **DRY (Don't Repeat Yourself)**: Common code is extracted into reusable components and utilities
2. **Separation of Concerns**: UI components are separated from business logic
3. **Type Safety**: All components use TypeScript for type safety
4. **Consistency**: Shared style tokens ensure visual consistency
5. **Accessibility**: Components follow accessibility best practices
6. **Performance**: Lightweight utilities replace heavy libraries where possible

---

## Components Folder Structure

```
components/
├── ui/                    # Base UI components (buttons, inputs, dialogs, etc.)
├── forms/                 # Form-specific components
├── charts/                # Chart components (recharts wrappers)
├── data-table/            # Data table components
├── dashboard/             # Dashboard-specific components
├── website-components/    # Layout components (sidebar, header, footer)
├── providers/             # Context providers
└── error-boundary.tsx     # Error boundary component
```

### Component Categories

#### 1. **UI Components** (`/components/ui`)
Base building blocks for the entire application. These are primitive components that can be composed into more complex components.

**Examples**: `Button`, `Input`, `Card`, `Dialog`, `Select`, `Badge`, etc.

#### 2. **Form Components** (`/components/forms`)
Specialized form components that build on top of UI components.

**Examples**: `PasswordInput`, `FileInput`, `MasterDataForm`

#### 3. **Chart Components** (`/components/charts`)
Recharts wrapper components for consistent chart styling.

**Examples**: `BarChart`, `LineChart`, `PieChart`, `AreaChart`

#### 4. **Data Table Components** (`/components/data-table`)
Powerful data table implementation with sorting, filtering, pagination.

**Examples**: `DataTable`, `SelectionColumn`

#### 5. **Dashboard Components** (`/components/dashboard`)
Dashboard-specific components.

**Examples**: `KPITiles`, `DashboardFilters`

#### 6. **Website Components** (`/components/website-components`)
Layout and navigation components.

**Examples**: `Sidebar`, `AppHeader`, `AppFooter`, `AuthGraphic`

#### 7. **Provider Components** (`/components/providers`)
React Context providers for global state.

**Examples**: `SessionProviderWrapper`

---

## Lib Folder Structure

```
lib/
├── utils.ts              # General utility functions
├── styles.ts              # Style tokens (Tailwind class strings)
├── animations.ts          # Animation utility classes
├── navigation.ts          # Navigation configuration
├── auth.ts                # Authentication utilities
├── db.ts                  # Database utilities
├── email.ts               # Email utilities
├── config.ts              # Configuration
├── i18n.ts                # Internationalization
├── error-handling.ts      # Error handling utilities
├── file-manager.ts        # File management utilities
├── dashboard-data.ts      # Dashboard data utilities
├── validations/           # Validation schemas
│   ├── auth.ts
│   ├── roles.ts
│   ├── users.ts
│   └── transfer-requests.ts
└── workflows/             # Workflow utilities
    └── transfer.ts
```

---

## UI Components

Location: `/components/ui/`

### Overview

UI components are primitive, reusable React components built on top of Radix UI primitives and styled with Tailwind CSS. They follow a consistent pattern:

1. **Built on Radix UI**: Accessible, unstyled primitives
2. **Styled with Tailwind**: Consistent design system
3. **TypeScript**: Full type safety
4. **Forward Refs**: Support for ref forwarding
5. **Composable**: Can be combined to build complex UIs

### Key UI Components

#### Button (`button.tsx`)

**What it is**: A customizable button component with variants and sizes.

**How it works**:
- Uses `class-variance-authority` (CVA) for variant management
- Supports multiple variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Supports multiple sizes: `default`, `sm`, `lg`, `icon`
- Uses Radix UI `Slot` for `asChild` prop (polymorphic component)

**Import**:
```typescript
import { Button } from "@/components/ui/button"
```

**Usage**:
```typescript
<Button variant="default" size="lg">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline" asChild>
  <a href="/link">Link Button</a>
</Button>
```

**Props**:
- `variant`: `"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"`
- `size`: `"default" | "sm" | "lg" | "icon"`
- `asChild`: `boolean` - Render as child component (polymorphic)
- All standard HTML button props

**Internal Details**:
- Uses `cn()` utility from `lib/utils.ts` for className merging
- `buttonVariants` function from CVA generates className strings
- `React.forwardRef` enables ref forwarding

---

#### Input (`input.tsx`)

**What it is**: A styled input field component.

**How it works**:
- Wraps native HTML input element
- Applies consistent styling via Tailwind classes
- Supports all standard input types and props
- Includes focus states and disabled states

**Import**:
```typescript
import { Input } from "@/components/ui/input"
```

**Usage**:
```typescript
<Input type="text" placeholder="Enter name..." />
<Input type="email" disabled />
<Input className="w-full" />
```

**Props**:
- All standard HTML input props (`type`, `placeholder`, `value`, `onChange`, etc.)
- `className`: Additional CSS classes

**Internal Details**:
- Uses `React.forwardRef` for ref forwarding
- Styled with Tailwind classes: `h-10`, `rounded-md`, `border`, `px-3`, `py-2`
- Includes focus ring: `focus-visible:ring-2 focus-visible:ring-ring`

---

#### Card (`card.tsx`)

**What it is**: A container component for grouping related content.

**How it works**:
- Composed of multiple sub-components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Each sub-component has specific styling for its purpose
- Provides semantic structure for card layouts

**Import**:
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
```

**Usage**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Components**:
- `Card`: Outer container (rounded border, shadow, background)
- `CardHeader`: Header section (padding, flex column layout)
- `CardTitle`: Title text (large, semibold)
- `CardDescription`: Description text (small, muted)
- `CardContent`: Main content area (padding)
- `CardFooter`: Footer section (padding, flex layout)

**Internal Details**:
- All components use `React.forwardRef`
- Consistent spacing: `p-6` for padding
- Border and shadow: `rounded-lg border bg-card text-card-foreground shadow-sm`

---

#### Dialog (`dialog.tsx`)

**What it is**: A modal dialog component built on Radix UI Dialog.

**How it works**:
- Uses Radix UI Dialog primitives for accessibility
- Includes overlay, content, header, footer, title, description
- Animated open/close transitions
- Accessible (keyboard navigation, focus management, ARIA attributes)

**Import**:
```typescript
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"
```

**Usage**:
```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Components**:
- `Dialog`: Root component (controls open/close state)
- `DialogTrigger`: Button/element that opens dialog
- `DialogContent`: Main dialog container (centered, animated)
- `DialogOverlay`: Backdrop overlay (blurred background)
- `DialogHeader`: Header section (title and description)
- `DialogTitle`: Dialog title (accessible heading)
- `DialogDescription`: Dialog description (accessible text)
- `DialogFooter`: Footer section (action buttons)

**Internal Details**:
- Uses Radix UI `DialogPrimitive` components
- Animated with Tailwind: `animate-in`, `animate-out`, `fade-in`, `zoom-in`
- Portal rendering (renders outside DOM hierarchy)
- Close button included in `DialogContent`

---

#### Select (`select.tsx`)

**What it is**: A customizable select/dropdown component built on Radix UI Select.

**How it works**:
- Uses Radix UI Select primitives
- Composed of multiple sub-components
- Supports keyboard navigation
- Accessible (ARIA attributes, focus management)

**Import**:
```typescript
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select"
```

**Usage**:
```typescript
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

**Components**:
- `Select`: Root component (controls value state)
- `SelectTrigger`: Clickable trigger button
- `SelectValue`: Displays selected value or placeholder
- `SelectContent`: Dropdown content container
- `SelectItem`: Individual option item
- `SelectLabel`: Section label (optional)
- `SelectSeparator`: Visual separator (optional)

**Internal Details**:
- Portal rendering for dropdown content
- Animated open/close transitions
- Scroll support for long lists
- Checkmark indicator for selected item

---

#### Table (`table.tsx`)

**What it is**: A styled table component for displaying tabular data.

**How it works**:
- Provides semantic table structure
- Styled with Tailwind classes
- Works with DataTable component for advanced features

**Import**:
```typescript
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table"
```

**Usage**:
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Components**:
- `Table`: Outer table container
- `TableHeader`: Header section
- `TableBody`: Body section
- `TableRow`: Table row
- `TableHead`: Header cell
- `TableCell`: Data cell

---

### Other UI Components

#### Badge (`badge.tsx`)
- Display labels, tags, or status indicators
- Variants: `default`, `secondary`, `destructive`, `outline`

#### Avatar (`avatar.tsx`)
- Display user avatars or images
- Fallback support for missing images

#### Checkbox (`checkbox.tsx`)
- Checkbox input with label support
- Built on Radix UI Checkbox

#### Switch (`switch.tsx`)
- Toggle switch component
- Built on Radix UI Switch

#### Tabs (`tabs.tsx`)
- Tab navigation component
- Built on Radix UI Tabs

#### Dropdown Menu (`dropdown-menu.tsx`)
- Context menu component
- Built on Radix UI Dropdown Menu

#### Popover (`popover.tsx`)
- Popover/floating panel component
- Built on Radix UI Popover

#### Toast Container (`toast-container.tsx`)
- Toast notification system
- Global toast state management

#### Loading Spinner (`loading-spinner.tsx`)
- Loading indicator component
- Animated spinner

#### Progress (`progress.tsx`)
- Progress bar component
- Animated progress indicator

#### Advanced Filters (`advanced-filters.tsx`)
- Complex filter component
- Supports multiple filter types (text, number, date, boolean)

#### Confirmation Dialog (`confirmation-dialog.tsx`)
- Confirmation dialog wrapper
- Password verification for sensitive actions

#### Bulk Delete Dialog (`bulk-delete-dialog.tsx`)
- Bulk delete confirmation dialog
- Password verification required

#### Export Button (`export-button.tsx`)
- Export functionality button
- Supports CSV and Excel export

---

## Form Components

Location: `/components/forms/`

### PasswordInput (`password-input.tsx`)

**What it is**: A password input field with show/hide toggle functionality.

**How it works**:
- Wraps the base `Input` component
- Adds eye icon button to toggle password visibility
- Manages internal state for show/hide

**Import**:
```typescript
import { PasswordInput } from "@/components/forms/password-input"
```

**Usage**:
```typescript
<PasswordInput 
  placeholder="Enter password..." 
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

**Props**:
- All standard `Input` props (`placeholder`, `value`, `onChange`, etc.)
- `className`: Additional CSS classes

**Internal Details**:
- Uses `useState` for show/hide state
- Uses `Eye` and `EyeOff` icons from lucide-react
- Button positioned absolutely within relative container
- Toggles input `type` between `"password"` and `"text"`

---

### FileInput (`file-input.tsx`)

**What it is**: A file upload component with drag-and-drop support.

**How it works**:
- Drag-and-drop file upload
- File validation (size, type)
- Upload progress tracking
- File preview and management
- Integration with `/api/upload` endpoint

**Import**:
```typescript
import { FileInput } from "@/components/forms/file-input"
```

**Usage**:
```typescript
<FileInput 
  value={filePath}
  onChange={(path, fileId) => {
    setFilePath(path)
    setFileId(fileId)
  }}
  accept=".jpg,.jpeg,.png,.pdf"
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

**Props**:
- `value`: Current file path (string)
- `onChange`: Callback with `(filePath: string, fileId: string) => void`
- `accept`: Accepted file types (string, e.g., `".jpg,.png,.pdf"`)
- `maxSize`: Maximum file size in bytes (number)
- `className`: Additional CSS classes
- `disabled`: Disable upload functionality

**Features**:
- Drag-and-drop support
- File type validation
- File size validation
- Upload progress indicator
- File preview after upload
- Download file button
- Remove file button
- Error handling and display

**Internal Details**:
- Uses `Card` component for drag-and-drop area
- Uses `Progress` component for upload progress
- Uses `toast` for notifications
- Uses `formatFileSize` utility from `lib/utils.ts`
- Handles FormData for file upload
- Calls `/api/upload` endpoint

---

### MasterDataForm (`master-data-form.tsx`)

**What it is**: A reusable form component for master data (generic CRUD forms).

**How it works**:
- Generic form component that accepts field configurations
- Handles form state management
- Provides validation
- Supports create and edit modes

**Import**:
```typescript
import { MasterDataForm } from "@/components/forms/master-data-form"
```

**Usage**:
```typescript
<MasterDataForm
  fields={[
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Role', type: 'select', options: roles }
  ]}
  onSubmit={handleSubmit}
  initialData={editingData}
/>
```

---

## Chart Components

Location: `/components/charts/`

### Overview

Chart components are wrappers around Recharts library components, providing consistent styling and easier API.

**Export Pattern**: All charts are exported from `index.ts`:

```typescript
export { BarChart } from './BarChart'
export { PieChart } from './PieChart'
export { LineChart } from './LineChart'
export { AreaChart } from './AreaChart'
```

### BarChart (`BarChart.tsx`)

**What it is**: A bar chart component with consistent styling.

**How it works**:
- Wraps Recharts `BarChart` component
- Provides consistent card styling
- Configurable data keys and colors
- Responsive container

**Import**:
```typescript
import { BarChart } from "@/components/charts"
```

**Usage**:
```typescript
<BarChart
  title="Sales by Month"
  description="Monthly sales data"
  data={[
    { month: 'Jan', sales: 1000, revenue: 5000 },
    { month: 'Feb', sales: 1200, revenue: 6000 }
  ]}
  dataKeys={[
    { key: 'sales', name: 'Sales', color: '#3b82f6' },
    { key: 'revenue', name: 'Revenue', color: '#10b981' }
  ]}
  xAxisKey="month"
  height={300}
/>
```

**Props**:
- `title`: Chart title (string)
- `description`: Chart description (string, optional)
- `data`: Chart data array (any[])
- `dataKeys`: Array of data key configurations
  - `key`: Data key name (string)
  - `name`: Display name (string)
  - `color`: Bar color (string)
- `xAxisKey`: X-axis data key (string)
- `height`: Chart height in pixels (number, default: 300)
- `className`: Additional CSS classes

**Internal Details**:
- Uses `Card` component for container
- Uses `ResponsiveContainer` from Recharts
- Includes `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- Consistent styling with Tailwind classes

---

### Other Chart Components

#### LineChart (`LineChart.tsx`)
- Line chart component
- Similar API to BarChart
- Uses Recharts `LineChart` and `Line` components

#### PieChart (`PieChart.tsx`)
- Pie chart component
- Uses Recharts `PieChart` and `Pie` components
- Supports labels and tooltips

#### AreaChart (`AreaChart.tsx`)
- Area chart component
- Uses Recharts `AreaChart` and `Area` components
- Filled area under line

---

## Data Table Components

Location: `/components/data-table/`

### DataTable (`data-table.tsx`)

**What it is**: A powerful, feature-rich data table component built on TanStack Table (React Table).

**How it works**:
- Uses TanStack Table for core functionality
- Provides sorting, filtering, pagination, column visibility
- Supports server-side and client-side pagination
- Includes search, export, bulk actions
- Row selection support

**Import**:
```typescript
import { DataTable } from "@/components/data-table/data-table"
```

**Usage**:
```typescript
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
]

<DataTable
  columns={columns}
  data={users}
  searchKey="name"
  pagination={{
    pageIndex: 0,
    pageSize: 10,
    pageCount: 10,
    total: 100
  }}
  onPaginationChange={(pagination) => {
    setPagination(pagination)
  }}
  onEdit={(id) => handleEdit(id)}
  onDelete={(id) => handleDelete(id)}
  onBulkDelete={(ids, password) => handleBulkDelete(ids, password)}
  enableBulkActions={true}
  entityName="Users"
/>
```

**Props**:
- `columns`: Column definitions (ColumnDef<TData, TValue>[])
- `data`: Table data array (TData[])
- `searchKey`: Key to search in (string, optional)
- `onRefresh`: Refresh callback (() => void, optional)
- `onExport`: Export callback ((format: 'csv' | 'excel') => void, optional)
- `isLoading`: Loading state (boolean, default: false)
- `pagination`: Pagination state (object, optional)
  - `pageIndex`: Current page index (number)
  - `pageSize`: Items per page (number)
  - `pageCount`: Total pages (number)
  - `total`: Total items (number)
- `onPaginationChange`: Pagination change callback ((pagination) => void, optional)
- `onEdit`: Edit callback ((id: string) => void, optional)
- `onDelete`: Delete callback ((id: string) => Promise<void>, optional)
- `onBulkDelete`: Bulk delete callback ((ids: string[], password?: string) => Promise<void>, optional)
- `onDeleteAll`: Delete all callback ((password: string) => Promise<void>, optional)
- `searchPlaceholder`: Search placeholder text (string, optional)
- `enableBulkActions`: Enable bulk actions (boolean, default: false)
- `entityName`: Entity name for dialogs (string, default: "Records")

**Features**:
- Global search across all columns
- Column-specific filtering
- Sorting (ascending/descending)
- Column visibility toggle
- Pagination (client-side or server-side)
- Row selection (checkboxes)
- Bulk delete actions
- Export to CSV/Excel
- Refresh functionality
- Density control (comfortable/normal/compact)
- Loading states
- Empty states

**Internal Details**:
- Uses `useReactTable` hook from TanStack Table
- Manages sorting, filtering, pagination state
- Integrates with UI components (`Button`, `Input`, `Select`, `Dialog`, etc.)
- Uses `BulkDeleteDialog` for confirmation
- Safe error handling for table methods
- Supports server-side pagination via `manualPagination` prop

---

### SelectionColumn (`selection-column.tsx`)

**What it is**: A helper function to create a selection column for DataTable.

**How it works**:
- Returns a column definition for row selection
- Adds checkbox column to table
- Integrates with TanStack Table row selection

**Import**:
```typescript
import { createSelectionColumn } from "@/components/data-table/selection-column"
```

**Usage**:
```typescript
const columns = [
  createSelectionColumn(),
  // ... other columns
]
```

---

## Dashboard Components

Location: `/components/dashboard/`

### KPITiles (`KPITiles.tsx`)

**What it is**: A component that displays Key Performance Indicators (KPIs) as tiles.

**How it works**:
- Receives dashboard data as props
- Renders multiple KPI tiles in a grid
- Each tile shows metric, value, trend, and icon
- Supports color variants and animations

**Import**:
```typescript
import { KPITiles } from "@/components/dashboard/KPITiles"
```

**Usage**:
```typescript
<KPITiles
  data={{
    totalStaff: 150,
    activeStaff: 120,
    inactiveStaff: 30,
    avgSalary: 75000,
    minSalary: 40000,
    maxSalary: 120000
  }}
/>
```

**Props**:
- `data`: Dashboard data object
  - `totalStaff`: Total number of staff (number)
  - `activeStaff`: Active staff count (number)
  - `inactiveStaff`: Inactive staff count (number)
  - `avgSalary`: Average salary (number)
  - `minSalary`: Minimum salary (number)
  - `maxSalary`: Maximum salary (number)
- `className`: Additional CSS classes

**Internal Details**:
- Uses `Card` component for each tile
- Color variants: `blue`, `green`, `red`, `yellow`, `purple`, `indigo`
- Trend indicators with up/down arrows
- Staggered animations for tiles
- Responsive grid layout

---

### DashboardFilters (`DashboardFilters.tsx`)

**What it is**: Filter component for dashboard data.

**How it works**:
- Provides date range filtering
- Department filtering
- Role filtering
- Other dashboard-specific filters

**Import**:
```typescript
import { DashboardFilters } from "@/components/dashboard/DashboardFilters"
```

---

## Website Components

Location: `/components/website-components/`

### Overview

Website components are layout and navigation components used throughout the application.

**Export Pattern**: Exported from `index.ts`:

```typescript
export { Sidebar } from './sidebar'
export { AppHeader } from './app-header'
export { AppFooter } from './app-footer'
export { AuthGraphic } from './auth-graphic'
```

### Sidebar (`sidebar.tsx`)

**What it is**: Application sidebar navigation component.

**How it works**:
- Displays navigation items based on user role
- Highlights active route
- Supports collapsible sections
- Uses `getFilteredNavigationItems` from `lib/navigation.ts`

**Import**:
```typescript
import { Sidebar } from "@/components/website-components"
```

**Usage**:
```typescript
<Sidebar userRole={session?.user?.role} />
```

**Features**:
- Role-based navigation filtering
- Active route highlighting
- Icon support
- Collapsible sections
- Responsive design

---

### AppHeader (`app-header.tsx`)

**What it is**: Application header component.

**How it works**:
- Displays logo/brand
- User menu dropdown
- Notification indicators
- Search functionality (optional)

**Import**:
```typescript
import { AppHeader } from "@/components/website-components"
```

---

### AppFooter (`app-footer.tsx`)

**What it is**: Application footer component.

**How it works**:
- Displays footer links
- Copyright information
- Social media links (optional)

**Import**:
```typescript
import { AppFooter } from "@/components/website-components"
```

---

### AuthGraphic (`auth-graphic.tsx`)

**What it is**: Graphic component for authentication pages.

**How it works**:
- Displays illustration/graphic on auth pages
- Provides visual interest
- Used in signin/signup layouts

**Import**:
```typescript
import { AuthGraphic } from "@/components/website-components"
```

---

## Provider Components

Location: `/components/providers/`

### SessionProviderWrapper (`session-provider.tsx`)

**What it is**: Wrapper component for NextAuth SessionProvider.

**How it works**:
- Wraps application with NextAuth SessionProvider
- Makes session data available via `useSession()` hook
- Automatically refreshes session
- Configures session refresh interval

**Import**:
```typescript
import { SessionProviderWrapper } from "@/components/providers/session-provider"
```

**Usage**:
```typescript
// In app/layout.tsx
<SessionProviderWrapper>
  {children}
</SessionProviderWrapper>
```

**Configuration**:
- `refetchInterval`: 5 minutes (300 seconds)
- `refetchOnWindowFocus`: true
- `basePath`: "/api/auth"

**Internal Details**:
- Uses NextAuth `SessionProvider` component
- Provides React Context for session access
- Client component (`"use client"`)

---

## Utility Functions (lib/utils.ts)

Location: `/lib/utils.ts`

### Overview

General-purpose utility functions used throughout the application.

### cn() Function

**What it is**: Utility function for combining and merging Tailwind CSS classes.

**How it works**:
- Combines `clsx` (conditional class joining) and `tailwind-merge` (conflict resolution)
- Handles conditional classes
- Resolves Tailwind class conflicts (e.g., `p-4 p-6` → `p-6`)

**Import**:
```typescript
import { cn } from "@/lib/utils"
```

**Usage**:
```typescript
<div className={cn("text-red-500", isActive && "bg-blue-500")} />
<div className={cn("p-4", "p-6")} /> // Resolves to "p-6"
<div className={cn("text-red-500 bg-blue-500", "text-blue-500")} />
// Resolves to "bg-blue-500 text-blue-500"
```

**Why Both?**
- `clsx`: Handles conditional classes (true/false, null, undefined)
- `tailwind-merge`: Resolves Tailwind class conflicts intelligently

---

### formatDate() Function

**What it is**: Formats a date into a human-readable string.

**How it works**:
- Handles null/undefined dates gracefully
- Converts string dates to Date objects
- Uses `Intl.DateTimeFormat` for locale-aware formatting

**Import**:
```typescript
import { formatDate } from "@/lib/utils"
```

**Usage**:
```typescript
formatDate(new Date()) // "Jan 15, 2024"
formatDate("2024-01-15") // "Jan 15, 2024"
formatDate(null) // "N/A"
```

**Format**: "Jan 15, 2024"

---

### formatDateTime() Function

**What it is**: Formats a date and time into a human-readable string.

**How it works**:
- Same as `formatDate` but includes time
- Uses 12-hour format with AM/PM

**Import**:
```typescript
import { formatDateTime } from "@/lib/utils"
```

**Usage**:
```typescript
formatDateTime(new Date()) // "Jan 15, 2024, 02:30 PM"
formatDateTime("2024-01-15T14:30:00") // "Jan 15, 2024, 02:30 PM"
formatDateTime(null) // "N/A"
```

**Format**: "Jan 15, 2024, 02:30 PM"

---

### formatFileSize() Function

**What it is**: Converts bytes to human-readable file size.

**How it works**:
- Calculates appropriate unit (Bytes, KB, MB, GB)
- Divides bytes by power of 1024
- Rounds to 2 decimal places

**Import**:
```typescript
import { formatFileSize } from "@/lib/utils"
```

**Usage**:
```typescript
formatFileSize(0) // "0 Bytes"
formatFileSize(1024) // "1 KB"
formatFileSize(1048576) // "1 MB"
formatFileSize(1536) // "1.5 KB"
```

---

### generateRandomString() Function

**What it is**: Generates a cryptographically random string.

**How it works**:
- Uses alphanumeric characters (A-Z, a-z, 0-9)
- Generates string of specified length
- Uses `Math.random()` (not cryptographically secure for security-critical use)

**Import**:
```typescript
import { generateRandomString } from "@/lib/utils"
```

**Usage**:
```typescript
generateRandomString(32) // "aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z"
generateRandomString(16) // "aB3dE5fG7hI9jK1"
```

**Use Cases**:
- Verification tokens
- Password reset tokens
- Unique identifiers
- Session IDs

**Security Note**: For security-critical tokens, use `crypto.randomBytes()` instead.

---

### generateSecurePassword() Function

**What it is**: Generates a secure password meeting all requirements.

**How it works**:
- Ensures at least one character from each category (lowercase, uppercase, number, symbol)
- Fills remaining length with random characters
- Shuffles characters to avoid predictable patterns

**Import**:
```typescript
import { generateSecurePassword } from "@/lib/utils"
```

**Usage**:
```typescript
generateSecurePassword() // "K#mP9vL2@xR!"
```

**Requirements**:
- Minimum 12 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

**Use Case**: When admin creates a user account, generates temporary password that user must change on first login.

---

### sleep() Function

**What it is**: Creates a delay/pause in async code execution.

**How it works**:
- Creates a Promise that resolves after specified milliseconds
- Use with `await` to pause execution

**Import**:
```typescript
import { sleep } from "@/lib/utils"
```

**Usage**:
```typescript
await sleep(1000) // Wait 1 second
await sleep(500) // Wait 0.5 seconds
```

**Use Cases**:
- Rate limiting API calls
- Adding delays in animations
- Testing async behavior
- Simulating network latency

---

## Style Tokens (lib/styles.ts)

Location: `/lib/styles.ts`

### Overview

Centralized Tailwind CSS class names for consistent styling across the application.

**Why This Approach?**
- DRY: Define styles once, reuse everywhere
- Consistency: Same styles used across components
- Maintainability: Change styles in one place
- Type safety: TypeScript ensures correct usage

**How It Works**:
Objects contain Tailwind class strings organized by component. Import and use: `className={sidebar.rowBase}`

---

### Sidebar Styles (`sidebar`)

**Usage**:
```typescript
import { sidebar } from "@/lib/styles"

<div className={sidebar.rowBase}>
  <div className={sidebar.iconBoxSm}>...</div>
</div>
```

**Available Styles**:
- `rowBase`: Base row style (group, flex, rounded, transition)
- `rowActive`: Active row variant (dark background, white text)
- `rowInactive`: Inactive row variant (white background, hover effect)
- `iconBoxSm`: Small icon container (7x7)
- `iconBoxMd`: Medium icon container (8x8)
- `icon`: Base icon style
- `iconActive`: White icon for active state
- `iconInactive`: Gray icon for inactive state
- `headerButton`: Section header button
- `headerCaret`: Caret icon for expand/collapse

---

### Layout Styles (`layout`)

**Usage**:
```typescript
import { layout } from "@/lib/styles"

<div className={layout.container}>...</div>
```

**Available Styles**:
- `container`: Responsive container with padding

---

### Header Styles (`header`)

**Usage**:
```typescript
import { header } from "@/lib/styles"

<div className={header.shell}>
  <div className={header.bar}>...</div>
</div>
```

**Available Styles**:
- `shell`: Outer container (background, shadow, border)
- `bar`: Inner flex container
- `brandTitle`: Logo/brand title text
- `brandSubtitle`: Logo/brand subtitle text
- `brandIconBox`: Logo icon container
- `userText`: User menu text

---

### Footer Styles (`footer`)

**Usage**:
```typescript
import { footer } from "@/lib/styles"

<div className={footer.shell}>
  <div className={footer.bar}>...</div>
</div>
```

**Available Styles**:
- `shell`: Outer container
- `bar`: Inner flex container (responsive)
- `left`: Left section
- `center`: Center section
- `right`: Right section
- `link`: Link hover styles
- `smallMuted`: Small muted text

---

### Auth Styles (`auth`)

**Usage**:
```typescript
import { auth } from "@/lib/styles"

<div className={auth.page}>
  <div className={auth.card}>...</div>
</div>
```

**Available Styles**:
- `page`: Full page container
- `main`: Main content area
- `card`: Form card container
- `titleWrap`: Title section wrapper
- `title`: Heading styles
- `error`: Error message alert
- `success`: Success message alert
- `dividerWrap`: Divider wrapper
- `dividerLine`: Divider line
- `dividerHr`: Horizontal rule
- `dividerTextWrap`: Divider text wrapper
- `dividerText`: Divider text
- `split`: Two-column layout
- `graphicPane`: Left column (graphic)
- `formPane`: Right column (form)
- `formCenter`: Form centering
- `formMax`: Form max width

---

## Animation Utilities (lib/animations.ts)

Location: `/lib/animations.ts`

### Overview

Lightweight animation utilities using Tailwind CSS classes. These replace heavy framer-motion usage for simple animations.

**Why This Approach?**
- Lighter than framer-motion (no JavaScript runtime)
- Better performance (CSS animations)
- Smaller bundle size
- Works well for simple animations

**When to Use**:
- Simple fade/slide animations
- Hover effects
- Form field animations
- Loading states

**When NOT to Use**:
- Complex animations requiring orchestration
- Animations with JavaScript logic
- Animations needing precise timing control
- Use framer-motion for these cases

---

### fadeInUp

**What it is**: Animates element fading in and sliding up from bottom.

**Usage**:
```typescript
import { fadeInUp } from "@/lib/animations"

<div className={fadeInUp}>Content</div>
```

**Effects**:
- Fades in (opacity 0 → 1)
- Slides up from bottom (translateY)
- Duration: 500ms

**Use Case**: Page content, cards, modals appearing

---

### fadeIn

**What it is**: Simple fade in effect (opacity only).

**Usage**:
```typescript
import { fadeIn } from "@/lib/animations"

<div className={fadeIn}>Content</div>
```

**Effects**:
- Fades in (opacity 0 → 1)
- Duration: 500ms

**Use Case**: Text appearing, images loading

---

### slideInLeft

**What it is**: Animates element sliding in from left side.

**Usage**:
```typescript
import { slideInLeft } from "@/lib/animations"

<div className={slideInLeft}>Content</div>
```

**Effects**:
- Fades in
- Slides in from left (translateX)
- Duration: 500ms

**Use Case**: Sidebars, navigation menus, panels

---

### slideInRight

**What it is**: Animates element sliding in from right side.

**Usage**:
```typescript
import { slideInRight } from "@/lib/animations"

<div className={slideInRight}>Content</div>
```

**Effects**:
- Fades in
- Slides in from right (translateX)
- Duration: 500ms

**Use Case**: Sidebars, navigation menus, panels

---

### staggerDelay

**What it is**: Provides delay classes for staggered animations.

**Usage**:
```typescript
import { fadeInUp, staggerDelay } from "@/lib/animations"

<div className={fadeInUp}>
  <div className={staggerDelay[1]}>First item</div>
  <div className={staggerDelay[2]}>Second item</div>
  <div className={staggerDelay[3]}>Third item</div>
</div>
```

**Available Delays**:
- `staggerDelay[1]`: 100ms delay
- `staggerDelay[2]`: 200ms delay
- `staggerDelay[3]`: 300ms delay
- `staggerDelay[4]`: 400ms delay
- `staggerDelay[5]`: 500ms delay

**Effect**: Items animate in sequence with increasing delays

---

### spinAnimation

**What it is**: CSS-based spinning animation (infinite rotation).

**Usage**:
```typescript
import { spinAnimation } from "@/lib/animations"

<div className={spinAnimation}>Loading...</div>
```

**Use Case**: Loading spinners, loading indicators

**Effect**: Continuous 360-degree rotation

---

### scaleIn

**What it is**: Animates element scaling in (growing).

**Usage**:
```typescript
import { scaleIn } from "@/lib/animations"

<div className={scaleIn}>Content</div>
```

**Effects**:
- Scales from 95% to 100%
- Fades in
- Duration: 300ms

**Use Case**: Buttons, modals, popovers appearing

---

### scaleOut

**What it is**: Animates element scaling out (shrinking).

**Usage**:
```typescript
import { scaleOut } from "@/lib/animations"

<div className={scaleOut}>Content</div>
```

**Effects**:
- Scales from 100% to 95%
- Fades out
- Duration: 200ms

**Use Case**: Buttons, modals, popovers disappearing

---

### hoverScale

**What it is**: Scales element slightly on hover.

**Usage**:
```typescript
import { hoverScale } from "@/lib/animations"

<button className={hoverScale}>Hover me</button>
```

**Effects**:
- Scales to 102% on hover
- Smooth transition
- Duration: 200ms

**Use Case**: Buttons, cards, interactive elements

---

### hoverLift

**What it is**: Lifts element up with shadow on hover.

**Usage**:
```typescript
import { hoverLift } from "@/lib/animations"

<card className={hoverLift}>Card content</card>
```

**Effects**:
- Moves up (translateY -4px)
- Adds shadow on hover
- Smooth transition
- Duration: 200ms

**Use Case**: Cards, buttons, interactive elements

---

### fieldError

**What it is**: Animates error message appearing.

**Usage**:
```typescript
import { fieldError } from "@/lib/animations"

<div className={fieldError}>Error message</div>
```

**Effects**:
- Slides in from top
- Fades in
- Duration: 200ms

**Use Case**: Form validation error messages

---

### fieldSuccess

**What it is**: Animates success message appearing.

**Usage**:
```typescript
import { fieldSuccess } from "@/lib/animations"

<div className={fieldSuccess}>Success message</div>
```

**Effects**:
- Slides in from bottom
- Fades in
- Duration: 200ms

**Use Case**: Form validation success messages

---

## Navigation Utilities (lib/navigation.ts)

Location: `/lib/navigation.ts`

### Overview

Provides navigation items and menu configuration for the authenticated app.

**What It Does**:
- Defines all available navigation items
- Filters items based on user role
- Provides role-based access control for navigation

**Why Role-Based Navigation?**
- Security: Users only see what they can access
- UX: Cleaner interface (no dead links)
- Clarity: Clear permission boundaries

---

### NavigationItem Interface

```typescript
interface NavigationItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
  activeColor: string // Tailwind gradient classes
  activeIconBg: string // Tailwind classes for active icon background
  textColor: string // Tailwind text color class
  roles?: string[] // If undefined, accessible to all roles
}
```

---

### getFilteredNavigationItems() Function

**What it is**: Returns navigation items filtered by user role.

**How it works**:
1. If no role provided: Returns items accessible to all (no roles restriction)
2. If role provided: Returns items accessible to that role

**Filtering Logic**:
- Items without roles array: Accessible to everyone (always included)
- Items with roles array: Only included if userRole is in the array

**Import**:
```typescript
import { getFilteredNavigationItems } from "@/lib/navigation"
```

**Usage**:
```typescript
const navItems = getFilteredNavigationItems(userRole)

// Admin user
getFilteredNavigationItems("Admin")
// Returns: Dashboard, Profile, Files, Users, Roles, Teachers, Doctors, etc.

// Regular user
getFilteredNavigationItems("User")
// Returns: Dashboard, Profile, Files, Teachers, Doctors, etc.
// (No Users, Roles - those require Admin)
```

**Use Case**: Used in sidebar component to show appropriate navigation items

---

### getAllNavigationItems() Function

**What it is**: Returns all navigation items without filtering.

**Use Case**:
- Admin/debug purposes
- Testing
- Development tools

**Note**: Does NOT filter by role. Returns everything. Use `getFilteredNavigationItems()` for production.

**Import**:
```typescript
import { getAllNavigationItems } from "@/lib/navigation"
```

---

## Import Patterns and Best Practices

### Import Path Conventions

#### Components
```typescript
// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Form Components
import { PasswordInput } from "@/components/forms/password-input"
import { FileInput } from "@/components/forms/file-input"

// Chart Components (from index.ts)
import { BarChart, LineChart } from "@/components/charts"

// Website Components (from index.ts)
import { Sidebar, AppHeader } from "@/components/website-components"

// Data Table
import { DataTable } from "@/components/data-table/data-table"
```

#### Utilities
```typescript
// Utility Functions
import { cn, formatDate, formatFileSize } from "@/lib/utils"

// Style Tokens
import { sidebar, header, footer, auth } from "@/lib/styles"

// Animation Utilities
import { fadeInUp, hoverScale } from "@/lib/animations"

// Navigation
import { getFilteredNavigationItems } from "@/lib/navigation"
```

### Best Practices

#### 1. Use Named Exports

**Good**:
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
```

**Avoid**:
```typescript
import Button from "@/components/ui/button" // Default export
```

#### 2. Group Imports

**Good**:
```typescript
// External libraries
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// Utilities
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
```

#### 3. Use Index Files for Barrel Exports

**Good**:
```typescript
// Chart components export from index.ts
import { BarChart, LineChart } from "@/components/charts"
```

**Avoid**:
```typescript
import { BarChart } from "@/components/charts/BarChart"
import { LineChart } from "@/components/charts/LineChart"
```

#### 4. Use cn() for Conditional Classes

**Good**:
```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class", className)} />
```

**Avoid**:
```typescript
<div className={`base-class ${isActive ? "active-class" : ""} ${className}`} />
```

#### 5. Use Style Tokens for Consistency

**Good**:
```typescript
import { sidebar } from "@/lib/styles"

<div className={sidebar.rowBase}>
  <div className={sidebar.iconBoxSm}>...</div>
</div>
```

**Avoid**:
```typescript
<div className="group relative flex items-center rounded-lg transition-colors duration-200 cursor-pointer h-10">
  <div className="flex items-center justify-center flex-shrink-0 w-7 h-7">...</div>
</div>
```

#### 6. Use Animation Utilities

**Good**:
```typescript
import { fadeInUp, staggerDelay } from "@/lib/animations"

<div className={fadeInUp}>
  <div className={staggerDelay[1]}>Item 1</div>
  <div className={staggerDelay[2]}>Item 2</div>
</div>
```

**Avoid**:
```typescript
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
  <div className="animation-delay-100">Item 1</div>
  <div className="animation-delay-200">Item 2</div>
</div>
```

---

## Creating New Reusable Components

### Component Structure Template

```typescript
"use client" // If component uses hooks or client-side features

import * as React from "react"
import { cn } from "@/lib/utils"
// Import other dependencies

/**
 * COMPONENT NAME
 * 
 * Brief description of what the component does.
 * 
 * WHAT IT IS:
 * - Description of component purpose
 * 
 * HOW IT WORKS:
 * - Explanation of component behavior
 * 
 * USAGE:
 * ```typescript
 * <ComponentName prop1="value" />
 * ```
 */

export interface ComponentNameProps {
  // Props interface
  className?: string
  // ... other props
}

export const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("base-classes", className)}
        {...props}
      >
        {/* Component content */}
      </div>
    )
  }
)

ComponentName.displayName = "ComponentName"

export { ComponentName }
```

### Guidelines

1. **Use TypeScript**: Always define prop interfaces
2. **Forward Refs**: Use `React.forwardRef` for ref support
3. **Set displayName**: Helps with debugging
4. **Use cn()**: For className merging
5. **Add Comments**: Document component purpose and usage
6. **Export Properly**: Use named exports
7. **Client vs Server**: Add `"use client"` only when needed

### Example: Creating a New UI Component

```typescript
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ALERT COMPONENT
 * 
 * Displays alert messages with different variants.
 */

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning"
}

const alertVariants = {
  default: "bg-gray-100 text-gray-900",
  success: "bg-green-100 text-green-900",
  error: "bg-red-100 text-red-900",
  warning: "bg-yellow-100 text-yellow-900",
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md p-4",
          alertVariants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Alert.displayName = "Alert"

export { Alert }
```

---

## Component Composition Patterns

### Pattern 1: Building Complex Forms

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/forms/password-input"
import { cn } from "@/lib/utils"

function UserForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" />
            </div>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Pattern 2: Using DataTable with Custom Actions

```typescript
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { columns } from "./columns"

function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        onEdit={(id) => {
          // Handle edit
        }}
        onDelete={(id) => {
          // Handle delete
        }}
        enableBulkActions={true}
        entityName="Users"
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {/* Dialog content */}
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### Pattern 3: Using Style Tokens

```typescript
import { sidebar } from "@/lib/styles"
import { cn } from "@/lib/utils"

function SidebarItem({ isActive }: { isActive: boolean }) {
  return (
    <div className={cn(sidebar.rowBase, isActive ? sidebar.rowActive : sidebar.rowInactive)}>
      <div className={sidebar.iconBoxSm}>
        <Icon className={cn(sidebar.icon, isActive ? sidebar.iconActive : sidebar.iconInactive)} />
      </div>
      <span>Item</span>
    </div>
  )
}
```

### Pattern 4: Using Animation Utilities

```typescript
import { fadeInUp, staggerDelay } from "@/lib/animations"

function ItemList({ items }: { items: string[] }) {
  return (
    <div className={fadeInUp}>
      {items.map((item, index) => (
        <div key={item} className={staggerDelay[index + 1]}>
          {item}
        </div>
      ))}
    </div>
  )
}
```

---

## Summary

This codebase follows a **component-driven architecture** with extensive reuse of:

1. **UI Components** (`/components/ui`): Base building blocks (Button, Input, Card, Dialog, etc.)
2. **Form Components** (`/components/forms`): Specialized form components (PasswordInput, FileInput)
3. **Chart Components** (`/components/charts`): Recharts wrappers (BarChart, LineChart, etc.)
4. **Data Table** (`/components/data-table`): Powerful table component with sorting, filtering, pagination
5. **Utilities** (`/lib/utils.ts`): General-purpose functions (cn, formatDate, formatFileSize, etc.)
6. **Style Tokens** (`/lib/styles.ts`): Centralized Tailwind class strings
7. **Animation Utilities** (`/lib/animations.ts`): Lightweight animation classes
8. **Navigation Utilities** (`/lib/navigation.ts`): Role-based navigation configuration

### Key Takeaways

- **Consistency**: Use shared components and utilities for consistent behavior
- **Type Safety**: All components use TypeScript for type safety
- **Accessibility**: Components built on Radix UI primitives are accessible
- **Performance**: Lightweight utilities replace heavy libraries where possible
- **Maintainability**: Centralized styles and utilities make updates easier
- **Reusability**: Components are designed to be composed into complex UIs

By following these patterns and best practices, you can build consistent, maintainable, and performant React applications with this codebase.

