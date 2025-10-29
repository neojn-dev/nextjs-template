"use client"

import { DashboardFilters } from "@/components/dashboard/DashboardFilters"

// Types for raw data from APIs
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

interface Teacher extends BaseStaffMember {
  subject: string
  gradeLevel: string
  certification: string
}

interface Doctor extends BaseStaffMember {
  specialization: string
  licenseNumber: string
}

interface Engineer extends BaseStaffMember {
  specialization: string
  programmingLanguages: string[]
}

interface Lawyer extends BaseStaffMember {
  specialization: string
  barNumber: string
}

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

// Dashboard data interface
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

// Cache for raw data
let dataCache: {
  teachers: Teacher[]
  doctors: Doctor[]
  engineers: Engineer[]
  lawyers: Lawyer[]
  users: User[]
  lastFetch: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes



// Fetch all raw data from APIs
async function fetchAllRawData(): Promise<typeof dataCache> {
  console.log('📊 Loading analytics data...')
  
  try {
    const [teachersRes, doctorsRes, engineersRes, lawyersRes, usersRes] = await Promise.all([
      fetch('/api/teachers?limit=10000', { credentials: 'include' }),
      fetch('/api/doctors?limit=10000', { credentials: 'include' }),
      fetch('/api/engineers?limit=10000', { credentials: 'include' }),
      fetch('/api/lawyers?limit=10000', { credentials: 'include' }),
      fetch('/api/users?limit=10000', { credentials: 'include' })
    ])

    // Check individual response status and provide specific error messages
    const responses = [
      { name: 'teachers', res: teachersRes, required: true },
      { name: 'doctors', res: doctorsRes, required: true },
      { name: 'engineers', res: engineersRes, required: true },
      { name: 'lawyers', res: lawyersRes, required: true },
      { name: 'users', res: usersRes, required: false } // Users data is optional (requires Admin role)
    ]

    // Only fail for required endpoints
    const failedRequiredResponses = responses.filter(({ res, required }) => required && !res.ok)
    if (failedRequiredResponses.length > 0) {
      const errorDetails = failedRequiredResponses.map(({ name, res }) => `${name}: ${res.status}`).join(', ')
      throw new Error(`Failed to fetch required data from: ${errorDetails}`)
    }

    // Log warnings for optional endpoints that failed
    const failedOptionalResponses = responses.filter(({ res, required }) => !required && !res.ok)
    if (failedOptionalResponses.length > 0) {
      failedOptionalResponses.forEach(({ name, res }) => {
        console.warn(`⚠️ Optional endpoint ${name} failed with status ${res.status} (continuing without this data)`)
      })
    }

    // Parse successful responses
    const [teachers, doctors, engineers, lawyers] = await Promise.all([
      teachersRes.json(),
      doctorsRes.json(),
      engineersRes.json(),
      lawyersRes.json()
    ])

    // Handle users data conditionally
    let users = { data: [] }
    if (usersRes.ok) {
      try {
        users = await usersRes.json()
      } catch (error) {
        console.warn('⚠️ Failed to parse users data, continuing without it')
      }
    }

    const result = {
      teachers: teachers.data || [],
      doctors: doctors.data || [],
      engineers: engineers.data || [],
      lawyers: lawyers.data || [],
      users: users.data || [],
      lastFetch: Date.now()
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

// Get cached data or fetch fresh data
async function getRawData(): Promise<typeof dataCache> {
  if (dataCache && (Date.now() - dataCache.lastFetch) < CACHE_DURATION) {
    console.log('📦 Using cached analytics data')
    return dataCache
  }

  dataCache = await fetchAllRawData()
  return dataCache
}

// Filter data based on dashboard filters
function filterStaffData(staff: BaseStaffMember[], filters: DashboardFilters) {
  let filtered = [...staff]

  // Filter by department
  if (filters.department) {
    filtered = filtered.filter(member => 
      member.department.toLowerCase().includes(filters.department!.toLowerCase())
    )
  }

  // Filter by status
  if (filters.status) {
    const isActive = filters.status === 'active'
    filtered = filtered.filter(member => member.isActive === isActive)
  }

  // Filter by date range (based on createdAt)
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
        cutoffDate = new Date(0) // No filter
    }

    filtered = filtered.filter(member => new Date(member.createdAt) >= cutoffDate)
  }

  return filtered
}

// Compute dashboard analytics from raw data
export async function computeDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  const startTime = performance.now()
  console.log('📈 Generating dashboard analytics...')
  
  const rawData = await getRawData()
  if (!rawData) {
    throw new Error('Failed to get raw data')
  }

  // Performance monitoring and warnings
  const totalRecords = rawData.teachers.length + rawData.doctors.length + 
                      rawData.engineers.length + rawData.lawyers.length
  
  console.log(`📊 Processing ${totalRecords.toLocaleString()} total records`)
  
  if (totalRecords > 500000) {
    console.warn('⚠️ Large dataset detected! Performance may be impacted with 500K+ records')
  } else if (totalRecords > 100000) {
    console.warn('⚠️ Medium dataset detected. Consider optimizations for 100K+ records')
  }

  // Filter all staff data
  const filteredTeachers = filterStaffData(rawData.teachers, filters)
  const filteredDoctors = filterStaffData(rawData.doctors, filters)
  const filteredEngineers = filterStaffData(rawData.engineers, filters)
  const filteredLawyers = filterStaffData(rawData.lawyers, filters)

  // Combine all staff
  const allStaff = [
    ...filteredTeachers.map(t => ({ ...t, role: 'Teachers' })),
    ...filteredDoctors.map(d => ({ ...d, role: 'Doctors' })),
    ...filteredEngineers.map(e => ({ ...e, role: 'Engineers' })),
    ...filteredLawyers.map(l => ({ ...l, role: 'Lawyers' }))
  ]

  // Compute overview statistics
  const totalStaff = allStaff.length
  const activeStaff = allStaff.filter(s => s.isActive).length
  const inactiveStaff = totalStaff - activeStaff

  // Handle Prisma Decimal conversion and filter valid salaries
  const salaries = allStaff
    .map(s => {
      // Convert Prisma Decimal to number, handle null/undefined
      const salary = s.salary
      if (salary === null || salary === undefined) return 0
      // Handle both number and Decimal types
      return typeof salary === 'number' ? salary : parseFloat(salary.toString())
    })
    .filter(s => s > 0 && !isNaN(s)) // Filter out invalid salaries
  
  const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0
  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0

  // Compute role distribution
  const roleDistribution = [
    { name: 'Teachers', value: filteredTeachers.length, color: '#3B82F6' },
    { name: 'Doctors', value: filteredDoctors.length, color: '#10B981' },
    { name: 'Engineers', value: filteredEngineers.length, color: '#8B5CF6' },
    { name: 'Lawyers', value: filteredLawyers.length, color: '#6366F1' }
  ]

  // Compute department statistics
  const departmentStats: Record<string, { total: number; active: number; roles: Record<string, number> }> = {}
  
  allStaff.forEach(staff => {
    if (!departmentStats[staff.department]) {
      departmentStats[staff.department] = { total: 0, active: 0, roles: {} }
    }
    
    departmentStats[staff.department].total++
    if (staff.isActive) {
      departmentStats[staff.department].active++
    }
    
    if (!departmentStats[staff.department].roles[staff.role]) {
      departmentStats[staff.department].roles[staff.role] = 0
    }
    departmentStats[staff.department].roles[staff.role]++
  })

  // Compute monthly trends (last 6 months)
  const monthlyTrends: Array<{
    month: string
    teachers: number
    doctors: number
    engineers: number
    lawyers: number
    total: number
  }> = []

  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    
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

  // Compute experience distribution
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

  const endTime = performance.now()
  const computationTime = endTime - startTime
  
  console.log(`✅ Dashboard analytics generated successfully in ${computationTime.toFixed(2)}ms`)
  console.log(`📊 Processed ${totalRecords.toLocaleString()} records`)
  
  // Performance warnings
  if (computationTime > 5000) {
    console.warn('⚠️ Slow computation detected! Consider server-side processing for better performance')
  }
  
  return result
}

// Clear cache (useful for testing or when data changes)
export function clearDashboardCache() {
  dataCache = null
  console.log('🗑️ Dashboard cache cleared')
}

// Force refresh dashboard data (bypasses cache completely)
export async function forceRefreshDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  console.log('🔄 Refreshing dashboard analytics...')
  dataCache = null // Clear cache first
  return await computeDashboardData(filters)
}
