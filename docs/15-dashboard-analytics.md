# Dashboard & Analytics

This document explains the dashboard and analytics implementation.

## 📊 Dashboard Overview

The dashboard provides analytics and insights into the application data, displaying various charts, statistics, and KPIs.

## 🏗️ Dashboard Architecture

### Components

| Component | Purpose |
|-----------|---------|
| **Dashboard Page** | Main dashboard page |
| **Dashboard Filters** | Filter dashboard data |
| **KPI Tiles** | Display key performance indicators |
| **Charts** | Display data visualizations |
| **Analytics API** | Provides dashboard data |

## 📁 Dashboard Structure

```
app/
├── (app)/
│   └── dashboard/
│       └── page.tsx           # Dashboard page
└── api/
    └── dashboard/
        └── analytics/
            └── route.ts        # Dashboard analytics API

components/
└── dashboard/
    ├── DashboardFilters.tsx   # Dashboard filters
    └── KPITiles.tsx            # KPI tiles component

lib/
└── dashboard-data.ts          # Dashboard data computation
```

## 📊 Dashboard Features

### Features

| Feature | Description |
|---------|-------------|
| **KPI Tiles** | Display key metrics |
| **Charts** | Visualize data |
| **Filters** | Filter dashboard data |
| **Real-time Updates** | Refresh dashboard data |
| **Export** | Export dashboard data |

## 📈 Charts

### Chart Components

**Location**: `components/charts/`

| Component | Purpose |
|-----------|---------|
| **BarChart** | Bar chart visualization |
| **PieChart** | Pie chart visualization |
| **LineChart** | Line chart visualization |
| **AreaChart** | Area chart visualization |

### Chart Library

The application uses **Recharts** for chart visualization.

### Usage Example

```typescript
import { BarChart } from "@/components/charts"

<BarChart
  title="Department Analysis"
  description="Staff distribution across departments"
  data={departmentData}
  xAxisKey="department"
  dataKeys={[
    { key: 'active', name: 'Active Staff', color: '#10B981' },
    { key: 'inactive', name: 'Inactive Staff', color: '#EF4444' }
  ]}
  height={400}
/>
```

## 📋 KPI Tiles

### KPI Tiles Component

**File**: `components/dashboard/KPITiles.tsx`

```typescript
import { KPITiles } from "@/components/dashboard/KPITiles"

<KPITiles data={dashboardData.overview} />
```

### KPI Data

```typescript
interface DashboardOverview {
  totalStaff: number
  activeStaff: number
  inactiveStaff: number
  totalDepartments: number
  totalRoles: number
  averageExperience: number
}
```

## 🔍 Dashboard Filters

### Dashboard Filters Component

**File**: `components/dashboard/DashboardFilters.tsx`

```typescript
import { DashboardFilters } from "@/components/dashboard/DashboardFilters"

<DashboardFilters
  currentFilters={filters}
  onFiltersChange={handleFiltersChange}
/>
```

### Filter Options

```typescript
interface DashboardFilters {
  dateRange: '3months' | '6months' | '1year' | 'all'
  department: string | null
  status: string | null
  role: string | null
}
```

## 📊 Dashboard Data

### Dashboard Data Computation

**File**: `lib/dashboard-data.ts`

```typescript
import { computeDashboardData } from "@/lib/dashboard-data"

const dashboardData = await computeDashboardData(filters)
```

### Dashboard Data Structure

```typescript
interface DashboardData {
  overview: {
    totalStaff: number
    activeStaff: number
    inactiveStaff: number
    totalDepartments: number
    totalRoles: number
    averageExperience: number
  }
  roleDistribution: {
    role: string
    count: number
    color: string
  }[]
  departmentStats: Record<string, {
    total: number
    active: number
    inactive: number
  }>
  monthlyTrends: {
    month: string
    teachers: number
    doctors: number
    engineers: number
    lawyers: number
  }[]
  experienceDistribution: {
    range: string
    count: number
  }[]
}
```

## 🎯 Dashboard Page

### Dashboard Page Component

**File**: `app/(app)/dashboard/page.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { DashboardFilters } from "@/components/dashboard/DashboardFilters"
import { KPITiles } from "@/components/dashboard/KPITiles"
import { BarChart, PieChart, LineChart, AreaChart } from "@/components/charts"
import { computeDashboardData } from "@/lib/dashboard-data"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: '6months',
    department: null,
    status: null,
    role: null
  })

  useEffect(() => {
    computeDashboardData(filters).then(setData)
  }, [filters])

  if (!data) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <DashboardFilters
        currentFilters={filters}
        onFiltersChange={setFilters}
      />
      
      <KPITiles data={data.overview} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart
          title="Staff Distribution by Role"
          data={data.roleDistribution}
        />
        <LineChart
          title="Monthly Hiring Trends"
          data={data.monthlyTrends}
        />
      </div>
      
      <BarChart
        title="Department Analysis"
        data={departmentChartData}
      />
    </div>
  )
}
```

## 📊 Analytics API

### Analytics API Endpoint

**File**: `app/api/dashboard/analytics/route.ts`

```typescript
// GET /api/dashboard/analytics
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const filters = {
    dateRange: url.searchParams.get("dateRange") || "6months",
    department: url.searchParams.get("department") || null,
    status: url.searchParams.get("status") || null,
    role: url.searchParams.get("role") || null,
  }

  const dashboardData = await computeDashboardData(filters)

  return NextResponse.json({ data: dashboardData })
}
```

## 📝 Best Practices

### 1. Cache Dashboard Data

Cache dashboard data for better performance.

### 2. Use Server Components

Use Server Components for initial data loading.

### 3. Optimize Queries

Optimize database queries for dashboard data.

### 4. Handle Loading States

Show loading states during data fetching.

### 5. Handle Errors

Display errors gracefully.

### 6. Update Data Regularly

Update dashboard data regularly for accuracy.

## 🔗 Related Documentation

- [Components Overview](./09-components-overview.md) - Dashboard components
- [Charts](./17-animations.md) - Chart components
- [API Routes](./08-api-routes.md) - Analytics API

---

**Next**: [Styling & Theming](./16-styling-theming.md)

