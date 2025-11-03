# Data Tables

This document explains the data table implementation using TanStack Table (React Table).

## 📊 Data Tables Overview

The application uses **TanStack Table v8** (formerly React Table) for building powerful, flexible data tables with features like:
- Sorting
- Filtering
- Pagination
- Column visibility
- Row selection
- Export functionality

## 🏗️ Data Table Architecture

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **DataTable** | `components/data-table/data-table.tsx` | Main table component |
| **SelectionColumn** | `components/data-table/selection-column.tsx` | Row selection column |

## 📋 DataTable Component

### Basic Usage

```typescript
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"

// Define columns
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
]

// Use table
<DataTable
  data={doctors}
  columns={columns}
  pagination={{
    pageIndex: 0,
    pageSize: 10,
    total: 100,
    pageCount: 10
  }}
  onPaginationChange={(pagination) => {
    // Handle pagination change
  }}
/>
```

### Advanced Usage

```typescript
<DataTable
  data={doctors}
  columns={columns}
  searchKey="firstName" // Global search key
  searchPlaceholder="Search doctors..."
  pagination={{
    pageIndex: 0,
    pageSize: 10,
    total: 100,
    pageCount: 10
  }}
  onPaginationChange={handlePaginationChange}
  onEdit={(id) => handleEdit(id)}
  onDelete={(id) => handleDelete(id)}
  onRefresh={fetchDoctors}
  onExport={(format) => handleExport(format)}
  enableBulkActions={true}
  onBulkDelete={(ids) => handleBulkDelete(ids)}
  entityName="Doctors"
/>
```

## 🎯 Column Definitions

### Simple Column

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
]
```

### Custom Cell Renderer

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.firstName}</div>
    },
  },
]
```

### Formatted Cell

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ row }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(row.original.salary || 0)
    },
  },
]
```

### Badge Cell

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
]
```

### Action Column

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.original.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
```

## 🔄 Pagination

### Client-Side Pagination

```typescript
<DataTable
  data={doctors}
  columns={columns}
  // No pagination prop = client-side pagination
/>
```

### Server-Side Pagination

```typescript
<DataTable
  data={doctors}
  columns={columns}
  pagination={{
    pageIndex: currentPage,
    pageSize: pageSize,
    total: totalCount,
    pageCount: totalPages
  }}
  onPaginationChange={(pagination) => {
    // Fetch new page from server
    fetchDoctors(pagination.pageIndex, pagination.pageSize)
  }}
/>
```

## 🔍 Search & Filtering

### Global Search

```typescript
<DataTable
  data={doctors}
  columns={columns}
  searchKey="firstName" // Search in firstName column
  searchPlaceholder="Search doctors..."
/>
```

### Column Filtering

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "department",
    header: "Department",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
```

## ✅ Row Selection

### Enable Row Selection

```typescript
import { createSelectionColumn } from "@/components/data-table/selection-column"

const columns: ColumnDef<Doctor>[] = [
  createSelectionColumn<Doctor>(), // Add selection column
  // ... other columns
]

<DataTable
  data={doctors}
  columns={columns}
  enableBulkActions={true}
  onBulkDelete={(ids) => handleBulkDelete(ids)}
/>
```

### Selection Column

**File**: `components/data-table/selection-column.tsx`

```typescript
import { createSelectionColumn } from "@/components/data-table/selection-column"

const columns: ColumnDef<Doctor>[] = [
  createSelectionColumn<Doctor>(),
  // ... other columns
]
```

## 📤 Export Functionality

### Export Data

```typescript
<DataTable
  data={doctors}
  columns={columns}
  onExport={(format) => {
    if (format === 'csv') {
      exportToCSV(doctors, 'doctors.csv')
    } else if (format === 'excel') {
      exportToExcel(doctors, 'doctors.xlsx')
    }
  }}
/>
```

### Export Button

**File**: `components/ui/export-button.tsx`

```typescript
import { ExportButton } from "@/components/ui/export-button"

<ExportButton
  data={doctors}
  filename="doctors-export"
/>
```

## 🔄 Sorting

### Sortable Columns

Columns are sortable by default. Sorting is handled automatically by TanStack Table.

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    enableSorting: true, // Default
  },
]
```

### Custom Sorting

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    sortingFn: (rowA, rowB) => {
      const nameA = `${rowA.original.firstName} ${rowA.original.lastName}`
      const nameB = `${rowB.original.firstName} ${rowB.original.lastName}`
      return nameA.localeCompare(nameB)
    },
  },
]
```

## 👁️ Column Visibility

Column visibility is handled automatically by TanStack Table. Users can toggle column visibility via the table settings.

## 🎨 Styling

### Custom Styling

```typescript
<DataTable
  data={doctors}
  columns={columns}
  className="custom-table-class"
/>
```

### Cell Styling

```typescript
const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={row.original.isActive ? "bg-green-500" : "bg-red-500"}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
]
```

## 📋 Complete Example

```typescript
"use client"
import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  isActive: boolean
}

const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
]

export function DoctorsTable() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    total: 0,
    pageCount: 0
  })

  useEffect(() => {
    fetchDoctors()
  }, [pagination.pageIndex, pagination.pageSize])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/doctors?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`
      )
      const result = await response.json()
      setDoctors(result.data)
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        pageCount: result.pagination.pages
      }))
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaginationChange = (newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }))
  }

  return (
    <DataTable
      data={doctors}
      columns={columns}
      isLoading={loading}
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      searchPlaceholder="Search doctors..."
    />
  )
}
```

## 📝 Best Practices

### 1. Use Server-Side Pagination for Large Datasets

Use server-side pagination when dealing with large datasets (1000+ rows).

### 2. Define Columns Properly

Define columns with proper types and accessors.

### 3. Handle Loading States

Show loading states during data fetching.

### 4. Handle Errors

Display errors clearly to users.

### 5. Use TypeScript

Type all table data and columns.

### 6. Memoize Columns

Memoize column definitions for performance.

## 🔗 Related Documentation

- [Components Overview](./09-components-overview.md) - Component architecture
- [UI Components](./10-ui-components.md) - UI components
- [API Routes](./08-api-routes.md) - Data fetching

---

**Next**: [Workflows](./13-workflows.md) | [File Management](./14-file-management.md)

