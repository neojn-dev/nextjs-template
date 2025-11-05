/**
 * DASHBOARD DATA COMPUTATION MODULE
 * 
 * This module computes analytics data for the dashboard.
 * 
 * WHAT IT DOES:
 * - Fetches data from multiple APIs (teachers, doctors, engineers, lawyers, users)
 * - Caches data for performance (5-minute cache)
 * - Filters data based on user-selected filters
 * - Computes statistics (totals, averages, distributions)
 * - Generates chart data (role distribution, monthly trends, etc.)
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Data caching (5 minutes)
 * - Parallel API calls (Promise.all)
 * - Performance monitoring and warnings
 * - Large dataset detection
 * 
 * CLIENT-SIDE MODULE:
 * Uses "use client" because it runs in browser.
 * Makes API calls from client-side components.
 * 
 * CACHING STRATEGY:
 * - Cache duration: 5 minutes
 * - Stores raw data from APIs
 * - Prevents redundant API calls
 * - Improves dashboard load time
 * 
 * FILTERING:
 * Supports filtering by:
 * - Department
 * - Status (active/inactive)
 * - Date range (1 month, 3 months, 6 months, 1 year)
 * 
 * ANALYTICS COMPUTED:
 * - Overview stats (total, active, inactive, salary stats)
 * - Role distribution (pie chart data)
 * - Department statistics
 * - Monthly trends (line chart data)
 * - Experience distribution
 */

"use client"

import { DashboardFilters } from "@/components/dashboard/DashboardFilters"

/**
 * BASE STAFF MEMBER INTERFACE
 * 
 * Common properties shared by all staff types.
 * 
 * PROPERTIES:
 * - id: Unique identifier
 * - firstName, lastName: Name
 * - email: Email address
 * - employeeId: Employee ID
 * - department: Department name
 * - yearsOfExperience: Years of experience
 * - salary: Annual salary
 * - isActive: Active status
 * - createdAt, updatedAt: Timestamps
 */
interface BaseStaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  employeeId: string
  department: string
  yearsOfExperience: number
  salary: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * TEACHER INTERFACE
 * 
 * Extends BaseStaffMember with teacher-specific fields.
 */
interface Teacher extends BaseStaffMember {
  subject: string
  gradeLevel: string
  certification: string
}

/**
 * DOCTOR INTERFACE
 * 
 * Extends BaseStaffMember with doctor-specific fields.
 */
interface Doctor extends BaseStaffMember {
  specialization: string
  licenseNumber: string
}

/**
 * ENGINEER INTERFACE
 * 
 * Extends BaseStaffMember with engineer-specific fields.
 */
interface Engineer extends BaseStaffMember {
  specialization: string
  programmingLanguages: string[] // Array of programming languages
}

/**
 * LAWYER INTERFACE
 * 
 * Extends BaseStaffMember with lawyer-specific fields.
 */
interface Lawyer extends BaseStaffMember {
  specialization: string
  barNumber: string
}

/**
 * USER INTERFACE
 * 
 * Represents application users (not staff members).
 * Used for user management analytics.
 */
interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roleId: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  role: {
    id: string
    name: string
    description: string
  }
}

/**
 * DASHBOARD DATA INTERFACE
 * 
 * Structure of computed dashboard analytics.
 * 
 * STRUCTURE:
 * - overview: Summary statistics
 * - roleDistribution: Pie chart data
 * - departmentStats: Department breakdown
 * - monthlyTrends: Line chart data (6 months)
 * - experienceDistribution: Experience ranges
 */
export interface DashboardData {
  overview: {
    totalStaff: number
    activeStaff: number
    inactiveStaff: number
    avgSalary: number
    minSalary: number
    maxSalary: number
  }
  roleDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  departmentStats: Record<string, {
    total: number
    active: number
    roles: Record<string, number>
  }>
  monthlyTrends: Array<{
    month: string
    teachers: number
    doctors: number
    engineers: number
    lawyers: number
    total: number
  }>
  experienceDistribution: Array<{
    range: string
    count: number
  }>
}

/**
 * DATA CACHE
 * 
 * In-memory cache for raw API data.
 * 
 * STRUCTURE:
 * - teachers, doctors, engineers, lawyers, users: Raw data arrays
 * - lastFetch: Timestamp of last fetch
 * 
 * CACHE DURATION:
 * 5 minutes (5 * 60 * 1000 milliseconds)
 * 
 * WHY IN-MEMORY?
 * - Fast access (no disk I/O)
 * - Shared across dashboard components
 * - Cleared on page refresh
 */
let dataCache: {
  teachers: Teacher[]
  doctors: Doctor[]
  engineers: Engineer[]
  lawyers: Lawyer[]
  users: User[]
  lastFetch: number
} | null = null

/**
 * CACHE DURATION
 * 
 * How long to keep cached data (in milliseconds).
 * 5 minutes = 300,000 milliseconds
 */
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes



/**
 * FETCH ALL RAW DATA FUNCTION
 * 
 * Fetches data from all staff APIs in parallel.
 * 
 * WHAT IT DOES:
 * 1. Makes parallel API calls to all endpoints
 * 2. Handles errors gracefully (required vs optional endpoints)
 * 3. Parses JSON responses
 * 4. Returns structured data with timestamp
 * 
 * PARALLEL EXECUTION:
 * Uses Promise.all() to fetch all APIs simultaneously.
 * Faster than sequential calls.
 * 
 * ERROR HANDLING:
 * - Required endpoints (staff): Fail if error
 * - Optional endpoints (users): Warn but continue
 * 
 * PERFORMANCE:
 * - All API calls happen in parallel
 * - Reduces total fetch time
 * - Better user experience
 * 
 * @returns Cached data structure with all staff and user data
 */
async function fetchAllRawData(): Promise<typeof dataCache> {
  console.log('📊 Loading analytics data...')
  
  try {
    /**
     * PARALLEL API CALLS
     * 
     * Fetches all endpoints simultaneously using Promise.all().
     * 
     * ENDPOINTS:
     * - /api/teachers: Teacher records
     * - /api/doctors: Doctor records
     * - /api/engineers: Engineer records
     * - /api/lawyers: Lawyer records
     * - /api/users: User records (optional, requires Admin)
     * 
     * CREDENTIALS:
     * 'include' sends cookies with request (for authentication).
     * 
     * LIMIT:
     * limit=10000 fetches up to 10,000 records per endpoint.
     */
    const [teachersRes, doctorsRes, engineersRes, lawyersRes, usersRes] = await Promise.all([
      fetch('/api/teachers?limit=10000', { credentials: 'include' }),
      fetch('/api/doctors?limit=10000', { credentials: 'include' }),
      fetch('/api/engineers?limit=10000', { credentials: 'include' }),
      fetch('/api/lawyers?limit=10000', { credentials: 'include' }),
      fetch('/api/users?limit=10000', { credentials: 'include' })
    ])

    /**
     * RESPONSE VALIDATION
     * 
     * Checks each response and categorizes as required or optional.
     * 
     * REQUIRED ENDPOINTS:
     * - Staff endpoints (teachers, doctors, engineers, lawyers)
     * - Dashboard won't work without these
     * 
     * OPTIONAL ENDPOINTS:
     * - Users endpoint (requires Admin role)
     * - Dashboard works without this data
     */
    const responses = [
      { name: 'teachers', res: teachersRes, required: true },
      { name: 'doctors', res: doctorsRes, required: true },
      { name: 'engineers', res: engineersRes, required: true },
      { name: 'lawyers', res: lawyersRes, required: true },
      { name: 'users', res: usersRes, required: false } // Users data is optional (requires Admin role)
    ]

    /**
     * CHECK REQUIRED ENDPOINTS
     * 
     * If any required endpoint fails, throw error.
     * Dashboard cannot function without staff data.
     */
    const failedRequiredResponses = responses.filter(({ res, required }) => required && !res.ok)
    if (failedRequiredResponses.length > 0) {
      const errorDetails = failedRequiredResponses.map(({ name, res }) => `${name}: ${res.status}`).join(', ')
      throw new Error(`Failed to fetch required data from: ${errorDetails}`)
    }

    /**
     * WARN FOR OPTIONAL ENDPOINT FAILURES
     * 
     * Log warnings for optional endpoints that fail.
     * Don't fail the entire operation.
     */
    const failedOptionalResponses = responses.filter(({ res, required }) => !required && !res.ok)
    if (failedOptionalResponses.length > 0) {
      failedOptionalResponses.forEach(({ name, res }) => {
        console.warn(`⚠️ Optional endpoint ${name} failed with status ${res.status} (continuing without this data)`)
      })
    }

    /**
     * PARSE JSON RESPONSES
     * 
     * Parse all successful responses in parallel.
     * Extract data array from each response.
     */
    const [teachers, doctors, engineers, lawyers] = await Promise.all([
      teachersRes.json(),
      doctorsRes.json(),
      engineersRes.json(),
      lawyersRes.json()
    ])

    /**
     * HANDLE USERS DATA CONDITIONALLY
     * 
     * Users endpoint is optional (requires Admin role).
     * Handle gracefully if it fails or returns error.
     */
    let users = { data: [] }
    if (usersRes.ok) {
      try {
        users = await usersRes.json()
      } catch (error) {
        console.warn('⚠️ Failed to parse users data, continuing without it')
      }
    }

    /**
     * BUILD RESULT OBJECT
     * 
     * Structures all data with timestamp.
     * Extracts data array from each response.
     */
    const result = {
      teachers: teachers.data || [],
      doctors: doctors.data || [],
      engineers: engineers.data || [],
      lawyers: lawyers.data || [],
      users: users.data || [],
      lastFetch: Date.now() // Timestamp for cache expiration
    }

    console.log('✅ Analytics data loaded successfully:', {
      teachers: result.teachers.length,
      doctors: result.doctors.length,
      engineers: result.engineers.length,
      lawyers: result.lawyers.length,
      users: result.users.length
    })

    return result
  } catch (error) {
    console.error('❌ Error fetching raw data:', error)
    throw error
  }
}

/**
 * GET RAW DATA FUNCTION
 * 
 * Returns cached data if available, otherwise fetches fresh data.
 * 
 * CACHING LOGIC:
 * 1. Check if cache exists
 * 2. Check if cache is still valid (within CACHE_DURATION)
 * 3. Return cache if valid
 * 4. Fetch fresh data if cache expired or missing
 * 
 * BENEFITS:
 * - Faster dashboard loads (uses cache)
 * - Reduced API calls
 * - Better user experience
 * 
 * @returns Cached or fresh raw data
 */
async function getRawData(): Promise<typeof dataCache> {
  /**
   * CHECK CACHE VALIDITY
   * 
   * Cache is valid if:
   * - Cache exists (not null)
   * - Cache age < CACHE_DURATION (5 minutes)
   */
  if (dataCache && (Date.now() - dataCache.lastFetch) < CACHE_DURATION) {
    console.log('📦 Using cached analytics data')
    return dataCache
  }

  /**
   * FETCH FRESH DATA
   * 
   * Cache expired or doesn't exist.
   * Fetch fresh data and update cache.
   */
  dataCache = await fetchAllRawData()
  return dataCache
}

/**
 * FILTER STAFF DATA FUNCTION
 * 
 * Filters staff data based on dashboard filters.
 * 
 * FILTERS SUPPORTED:
 * - Department: Filter by department name (case-insensitive)
 * - Status: Filter by active/inactive status
 * - Date Range: Filter by creation date (1 month, 3 months, 6 months, 1 year)
 * 
 * HOW IT WORKS:
 * 1. Start with all staff
 * 2. Apply each filter sequentially
 * 3. Return filtered array
 * 
 * FILTERING LOGIC:
 * - Multiple filters are combined with AND logic
 * - All conditions must be met for a record to pass
 * 
 * @param staff - Array of staff members to filter
 * @param filters - Dashboard filter configuration
 * @returns Filtered array of staff members
 */
function filterStaffData(staff: BaseStaffMember[], filters: DashboardFilters) {
  let filtered = [...staff] // Create copy to avoid mutating original

  /**
   * DEPARTMENT FILTER
   * 
   * Filters by department name.
   * Case-insensitive partial match.
   */
  if (filters.department) {
    filtered = filtered.filter(member => 
      member.department.toLowerCase().includes(filters.department!.toLowerCase())
    )
  }

  /**
   * STATUS FILTER
   * 
   * Filters by active/inactive status.
   * 
   * VALUES:
   * - 'active': Only active staff
   * - 'inactive': Only inactive staff
   */
  if (filters.status) {
    const isActive = filters.status === 'active'
    filtered = filtered.filter(member => member.isActive === isActive)
  }

  /**
   * DATE RANGE FILTER
   * 
   * Filters by creation date (createdAt).
   * 
   * DATE RANGES:
   * - '1month': Last 1 month
   * - '3months': Last 3 months
   * - '6months': Last 6 months
   * - '1year': Last 1 year
   * 
   * HOW IT WORKS:
   * - Calculates cutoff date based on range
   * - Filters records created after cutoff date
   */
  if (filters.dateRange) {
    const now = new Date()
    let cutoffDate: Date

    switch (filters.dateRange) {
      case '1month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '3months':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6months':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        cutoffDate = new Date(0) // No filter (beginning of time)
    }

    filtered = filtered.filter(member => new Date(member.createdAt) >= cutoffDate)
  }

  return filtered
}

/**
 * COMPUTE DASHBOARD DATA FUNCTION
 * 
 * Main function that computes all dashboard analytics.
 * 
 * PROCESS:
 * 1. Get raw data (cached or fresh)
 * 2. Apply filters
 * 3. Compute statistics
 * 4. Generate chart data
 * 5. Return structured dashboard data
 * 
 * PERFORMANCE MONITORING:
 * - Tracks computation time
 * - Warns if computation is slow
 * - Warns if dataset is large
 * 
 * @param filters - Dashboard filter configuration
 * @returns Computed dashboard analytics data
 */
export async function computeDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  /**
   * PERFORMANCE TRACKING
   * 
   * Start timer to measure computation time.
   * Used for performance monitoring and warnings.
   */
  const startTime = performance.now()
  console.log('📈 Generating dashboard analytics...')
  
  /**
   * STEP 1: GET RAW DATA
   * 
   * Fetches or retrieves cached data.
   * Includes all staff types and users.
   */
  const rawData = await getRawData()
  if (!rawData) {
    throw new Error('Failed to get raw data')
  }

  /**
   * PERFORMANCE MONITORING
   * 
   * Calculates total record count.
   * Warns if dataset is very large.
   */
  const totalRecords = rawData.teachers.length + rawData.doctors.length + 
                      rawData.engineers.length + rawData.lawyers.length
  
  console.log(`📊 Processing ${totalRecords.toLocaleString()} total records`)
  
  /**
   * DATASET SIZE WARNINGS
   * 
   * Warns if dataset is large and may impact performance.
   * Helps identify performance issues early.
   */
  if (totalRecords > 500000) {
    console.warn('⚠️ Large dataset detected! Performance may be impacted with 500K+ records')
  } else if (totalRecords > 100000) {
    console.warn('⚠️ Medium dataset detected. Consider optimizations for 100K+ records')
  }

  /**
   * STEP 2: FILTER DATA
   * 
   * Applies filters to each staff type.
   * Filters are applied independently to each dataset.
   */
  const filteredTeachers = filterStaffData(rawData.teachers, filters)
  const filteredDoctors = filterStaffData(rawData.doctors, filters)
  const filteredEngineers = filterStaffData(rawData.engineers, filters)
  const filteredLawyers = filterStaffData(rawData.lawyers, filters)

  /**
   * STEP 3: COMBINE ALL STAFF
   * 
   * Combines all filtered staff into single array.
   * Adds role property to each staff member.
   */
  const allStaff = [
    ...filteredTeachers.map(t => ({ ...t, role: 'Teachers' })),
    ...filteredDoctors.map(d => ({ ...d, role: 'Doctors' })),
    ...filteredEngineers.map(e => ({ ...e, role: 'Engineers' })),
    ...filteredLawyers.map(l => ({ ...l, role: 'Lawyers' }))
  ]

  /**
   * STEP 4: COMPUTE OVERVIEW STATISTICS
   * 
   * Calculates basic statistics:
   * - Total staff count
   * - Active/inactive counts
   * - Salary statistics (average, min, max)
   */
  const totalStaff = allStaff.length
  const activeStaff = allStaff.filter(s => s.isActive).length
  const inactiveStaff = totalStaff - activeStaff

  /**
   * SALARY PROCESSING
   * 
   * Handles Prisma Decimal type conversion.
   * Filters out invalid salaries (null, undefined, 0, NaN).
   * 
   * WHY THIS HANDLING?
   * Prisma returns Decimal type for numeric fields.
   * Need to convert to number for calculations.
   */
  const salaries = allStaff
    .map(s => {
      const salary = s.salary
      if (salary === null || salary === undefined) return 0
      // Handle both number and Decimal types
      return typeof salary === 'number' ? salary : parseFloat(salary.toString())
    })
    .filter(s => s > 0 && !isNaN(s)) // Filter out invalid salaries
  
  const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0
  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0

  /**
   * STEP 5: COMPUTE ROLE DISTRIBUTION
   * 
   * Counts staff by role.
   * Used for pie chart display.
   * 
   * COLORS:
   * - Teachers: Blue (#3B82F6)
   * - Doctors: Green (#10B981)
   * - Engineers: Purple (#8B5CF6)
   * - Lawyers: Indigo (#6366F1)
   */
  const roleDistribution = [
    { name: 'Teachers', value: filteredTeachers.length, color: '#3B82F6' },
    { name: 'Doctors', value: filteredDoctors.length, color: '#10B981' },
    { name: 'Engineers', value: filteredEngineers.length, color: '#8B5CF6' },
    { name: 'Lawyers', value: filteredLawyers.length, color: '#6366F1' }
  ]

  /**
   * STEP 6: COMPUTE DEPARTMENT STATISTICS
   * 
   * Groups staff by department.
   * Calculates totals, active counts, and role breakdown per department.
   * 
   * STRUCTURE:
   * {
   *   "Department Name": {
   *     total: number,
   *     active: number,
   *     roles: { "Teachers": 5, "Doctors": 3, ... }
   *   }
   * }
   */
  const departmentStats: Record<string, { total: number; active: number; roles: Record<string, number> }> = {}
  
  allStaff.forEach(staff => {
    // Initialize department if doesn't exist
    if (!departmentStats[staff.department]) {
      departmentStats[staff.department] = { total: 0, active: 0, roles: {} }
    }
    
    // Increment counters
    departmentStats[staff.department].total++
    if (staff.isActive) {
      departmentStats[staff.department].active++
    }
    
    // Count by role
    if (!departmentStats[staff.department].roles[staff.role]) {
      departmentStats[staff.department].roles[staff.role] = 0
    }
    departmentStats[staff.department].roles[staff.role]++
  })

  /**
   * STEP 7: COMPUTE MONTHLY TRENDS
   * 
   * Calculates staff additions per month for last 6 months.
   * Used for line chart display.
   * 
   * PROCESS:
   * 1. Iterate through last 6 months
   * 2. Count staff created in each month
   * 3. Group by role type
   */
  const monthlyTrends: Array<{
    month: string
    teachers: number
    doctors: number
    engineers: number
    lawyers: number
    total: number
  }> = []

  const now = new Date()
  // Loop through last 6 months (from 5 months ago to current month)
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    
    // Format month name (e.g., "Jan 24")
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    
    // Count staff created in this month for each role
    const teachersInMonth = filteredTeachers.filter(t => {
      const createdAt = new Date(t.createdAt)
      return createdAt >= monthStart && createdAt <= monthEnd
    }).length
    
    const doctorsInMonth = filteredDoctors.filter(d => {
      const createdAt = new Date(d.createdAt)
      return createdAt >= monthStart && createdAt <= monthEnd
    }).length
    
    const engineersInMonth = filteredEngineers.filter(e => {
      const createdAt = new Date(e.createdAt)
      return createdAt >= monthStart && createdAt <= monthEnd
    }).length
    
    const lawyersInMonth = filteredLawyers.filter(l => {
      const createdAt = new Date(l.createdAt)
      return createdAt >= monthStart && createdAt <= monthEnd
    }).length

    monthlyTrends.push({
      month: monthName,
      teachers: teachersInMonth,
      doctors: doctorsInMonth,
      engineers: engineersInMonth,
      lawyers: lawyersInMonth,
      total: teachersInMonth + doctorsInMonth + engineersInMonth + lawyersInMonth
    })
  }

  /**
   * STEP 8: COMPUTE EXPERIENCE DISTRIBUTION
   * 
   * Groups staff by years of experience ranges.
   * Used for bar chart display.
   * 
   * RANGES:
   * - 0-2 years
   * - 3-5 years
   * - 6-10 years
   * - 11-15 years
   * - 16+ years
   */
  const experienceRanges = [
    { range: '0-2 years', min: 0, max: 2 },
    { range: '3-5 years', min: 3, max: 5 },
    { range: '6-10 years', min: 6, max: 10 },
    { range: '11-15 years', min: 11, max: 15 },
    { range: '16+ years', min: 16, max: Infinity }
  ]

  const experienceDistribution = experienceRanges.map(range => ({
    range: range.range,
    count: allStaff.filter(s => 
      s.yearsOfExperience >= range.min && s.yearsOfExperience <= range.max
    ).length
  }))

  /**
   * STEP 9: BUILD RESULT OBJECT
   * 
   * Structures all computed data into DashboardData format.
   */
  const result: DashboardData = {
    overview: {
      totalStaff,
      activeStaff,
      inactiveStaff,
      avgSalary: Math.round(avgSalary),
      minSalary: Math.round(minSalary),
      maxSalary: Math.round(maxSalary)
    },
    roleDistribution,
    departmentStats,
    monthlyTrends,
    experienceDistribution
  }

  /**
   * PERFORMANCE REPORTING
   * 
   * Calculates computation time and logs performance metrics.
   */
  const endTime = performance.now()
  const computationTime = endTime - startTime
  
  console.log(`✅ Dashboard analytics generated successfully in ${computationTime.toFixed(2)}ms`)
  console.log(`📊 Processed ${totalRecords.toLocaleString()} records`)
  
  /**
   * PERFORMANCE WARNINGS
   * 
   * Warns if computation takes too long.
   * Suggests server-side processing for better performance.
   */
  if (computationTime > 5000) {
    console.warn('⚠️ Slow computation detected! Consider server-side processing for better performance')
  }
  
  return result
}

/**
 * CLEAR DASHBOARD CACHE FUNCTION
 * 
 * Clears the in-memory data cache.
 * 
 * USE CASES:
 * - Testing
 * - Force refresh after data changes
 * - Memory management
 * 
 * EFFECT:
 * Next call to getRawData() will fetch fresh data.
 */
export function clearDashboardCache() {
  dataCache = null
  console.log('🗑️ Dashboard cache cleared')
}

/**
 * FORCE REFRESH DASHBOARD DATA FUNCTION
 * 
 * Bypasses cache and fetches fresh data.
 * 
 * USE CASES:
 * - User clicks "Refresh" button
 * - Data was updated externally
 * - Need latest data immediately
 * 
 * PROCESS:
 * 1. Clear cache
 * 2. Compute dashboard data (which fetches fresh data)
 * 
 * @param filters - Dashboard filter configuration
 * @returns Fresh dashboard analytics data
 */
export async function forceRefreshDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  console.log('🔄 Refreshing dashboard analytics...')
  dataCache = null // Clear cache first
  return await computeDashboardData(filters)
}
