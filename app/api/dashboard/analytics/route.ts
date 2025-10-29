import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '6months'
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (dateRange) {
      case '1month':
        startDate = startOfMonth(subMonths(now, 1))
        break
      case '3months':
        startDate = startOfMonth(subMonths(now, 3))
        break
      case '6months':
        startDate = startOfMonth(subMonths(now, 6))
        break
      case '1year':
        startDate = startOfMonth(subMonths(now, 12))
        break
      default:
        startDate = startOfMonth(subMonths(now, 6))
    }

    // Build where conditions
    const whereConditions = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    }

    // Get aggregated data efficiently for 5M+ records
    const [
      teacherStats,
      doctorStats,
      engineerStats,
      lawyerStats,
      departmentGroups,
      monthlyTrends,
      experienceGroups,
      salaryStats
    ] = await Promise.all([
      // Teacher aggregations
      db.teacher.aggregate({
        where: {
          ...whereConditions,
          ...(department && { department: { contains: department } }),
          ...(status !== null && { isActive: status === 'active' })
        },
        _count: { id: true },
        _avg: { salary: true, yearsOfExperience: true },
        _min: { salary: true },
        _max: { salary: true }
      }),
      // Doctor aggregations
      db.doctor.aggregate({
        where: {
          ...whereConditions,
          ...(department && { department: { contains: department } }),
          ...(status !== null && { isActive: status === 'active' })
        },
        _count: { id: true },
        _avg: { salary: true, yearsOfExperience: true },
        _min: { salary: true },
        _max: { salary: true }
      }),
      // Engineer aggregations
      db.engineer.aggregate({
        where: {
          ...whereConditions,
          ...(department && { department: { contains: department } }),
          ...(status !== null && { isActive: status === 'active' })
        },
        _count: { id: true },
        _avg: { salary: true, yearsOfExperience: true },
        _min: { salary: true },
        _max: { salary: true }
      }),
      // Lawyer aggregations
      db.lawyer.aggregate({
        where: {
          ...whereConditions,
          ...(department && { department: { contains: department } }),
          ...(status !== null && { isActive: status === 'active' })
        },
        _count: { id: true },
        _avg: { salary: true, yearsOfExperience: true },
        _min: { salary: true },
        _max: { salary: true }
      }),
      // Department distribution using individual queries (safer approach)
      Promise.all([
        db.teacher.groupBy({
          by: ['department'],
          where: {
            ...whereConditions,
            ...(department && { department: { contains: department } }),
            ...(status !== null && { isActive: status === 'active' })
          },
          _count: { id: true }
        }),
        db.doctor.groupBy({
          by: ['department'],
          where: {
            ...whereConditions,
            ...(department && { department: { contains: department } }),
            ...(status !== null && { isActive: status === 'active' })
          },
          _count: { id: true }
        }),
        db.engineer.groupBy({
          by: ['department'],
          where: {
            ...whereConditions,
            ...(department && { department: { contains: department } }),
            ...(status !== null && { isActive: status === 'active' })
          },
          _count: { id: true }
        }),
        db.lawyer.groupBy({
          by: ['department'],
          where: {
            ...whereConditions,
            ...(department && { department: { contains: department } }),
            ...(status !== null && { isActive: status === 'active' })
          },
          _count: { id: true }
        })
      ]).then(async ([teachers, doctors, engineers, lawyers]) => {
        const combined: Array<{ department: string; role: string; total: number; active: number }> = []
        
        // Get actual active counts for each department
        for (const t of teachers) {
          const activeCount = await db.teacher.count({
            where: {
              department: t.department,
              isActive: true,
              ...whereConditions
            }
          })
          combined.push({ department: t.department, role: 'Teacher', total: t._count.id, active: activeCount })
        }
        
        for (const d of doctors) {
          const activeCount = await db.doctor.count({
            where: {
              department: d.department,
              isActive: true,
              ...whereConditions
            }
          })
          combined.push({ department: d.department, role: 'Doctor', total: d._count.id, active: activeCount })
        }
        
        for (const e of engineers) {
          const activeCount = await db.engineer.count({
            where: {
              department: e.department,
              isActive: true,
              ...whereConditions
            }
          })
          combined.push({ department: e.department, role: 'Engineer', total: e._count.id, active: activeCount })
        }
        
        for (const l of lawyers) {
          const activeCount = await db.lawyer.count({
            where: {
              department: l.department,
              isActive: true,
              ...whereConditions
            }
          })
          combined.push({ department: l.department, role: 'Lawyer', total: l._count.id, active: activeCount })
        }
        
        return combined
      }),
      // Monthly trends - calculate from actual data
      (async () => {
        const now = new Date()
        const trends: Array<{ month: string; role: string; count: number }> = []
        
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
          const monthStr = format(monthDate, 'yyyy-MM')
          
          const [teachers, doctors, engineers, lawyers] = await Promise.all([
            db.teacher.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd },
                ...(department && { department: { contains: department } }),
                ...(status !== null && { isActive: status === 'active' })
              }
            }),
            db.doctor.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd },
                ...(department && { department: { contains: department } }),
                ...(status !== null && { isActive: status === 'active' })
              }
            }),
            db.engineer.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd },
                ...(department && { department: { contains: department } }),
                ...(status !== null && { isActive: status === 'active' })
              }
            }),
            db.lawyer.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd },
                ...(department && { department: { contains: department } }),
                ...(status !== null && { isActive: status === 'active' })
              }
            })
          ])
          
          trends.push(
            { month: monthStr, role: 'Teacher', count: teachers },
            { month: monthStr, role: 'Doctor', count: doctors },
            { month: monthStr, role: 'Engineer', count: engineers },
            { month: monthStr, role: 'Lawyer', count: lawyers }
          )
        }
        
        return trends
      })(),
      // Experience distribution - calculate from actual data
      (async () => {
        const experienceRanges = [
          { range: '0-2 years', min: 0, max: 2 },
          { range: '3-5 years', min: 3, max: 5 },
          { range: '6-10 years', min: 6, max: 10 },
          { range: '11-15 years', min: 11, max: 15 },
          { range: '16+ years', min: 16, max: Infinity }
        ]
        
        const distribution = []
        
        for (const expRange of experienceRanges) {
          const baseWhere = {
            ...whereConditions,
            ...(department && { department: { contains: department } }),
            ...(status !== null && { isActive: status === 'active' }),
            yearsOfExperience: {
              gte: expRange.min,
              ...(expRange.max !== Infinity && { lte: expRange.max })
            }
          }
          
          const [teachers, doctors, engineers, lawyers] = await Promise.all([
            db.teacher.count({ where: baseWhere }),
            db.doctor.count({ where: baseWhere }),
            db.engineer.count({ where: baseWhere }),
            db.lawyer.count({ where: baseWhere })
          ])
          
          distribution.push({
            experience_range: expRange.range,
            count: teachers + doctors + engineers + lawyers
          })
        }
        
        return distribution
      })(),
      // Salary statistics will be calculated from individual aggregations
      Promise.resolve([])
    ])

    // Calculate analytics from aggregated data
    const totalStaff = (teacherStats._count.id || 0) + (doctorStats._count.id || 0) + 
                      (engineerStats._count.id || 0) + (lawyerStats._count.id || 0)
    
    // Calculate actual active staff count
    const [activeTeachers, activeDoctors, activeEngineers, activeLawyers] = await Promise.all([
      db.teacher.count({
        where: {
          ...whereConditions,
          isActive: true,
          ...(department && { department: { contains: department } })
        }
      }),
      db.doctor.count({
        where: {
          ...whereConditions,
          isActive: true,
          ...(department && { department: { contains: department } })
        }
      }),
      db.engineer.count({
        where: {
          ...whereConditions,
          isActive: true,
          ...(department && { department: { contains: department } })
        }
      }),
      db.lawyer.count({
        where: {
          ...whereConditions,
          isActive: true,
          ...(department && { department: { contains: department } })
        }
      })
    ])
    
    const activeStaff = activeTeachers + activeDoctors + activeEngineers + activeLawyers

    // Calculate salary statistics from individual aggregations
    const salaries = [
      teacherStats._avg.salary ? Number(teacherStats._avg.salary) : null,
      doctorStats._avg.salary ? Number(doctorStats._avg.salary) : null,
      engineerStats._avg.salary ? Number(engineerStats._avg.salary) : null,
      lawyerStats._avg.salary ? Number(lawyerStats._avg.salary) : null
    ].filter(Boolean) as number[]
    
    const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0
    const minSalaryArray = [
      teacherStats._min.salary ? Number(teacherStats._min.salary) : null,
      doctorStats._min.salary ? Number(doctorStats._min.salary) : null,
      engineerStats._min.salary ? Number(engineerStats._min.salary) : null,
      lawyerStats._min.salary ? Number(lawyerStats._min.salary) : null
    ].filter((s): s is number => s !== null)
    const minSalary = minSalaryArray.length > 0 ? Math.min(...minSalaryArray) : 0
    
    const maxSalaryArray = [
      teacherStats._max.salary ? Number(teacherStats._max.salary) : null,
      doctorStats._max.salary ? Number(doctorStats._max.salary) : null,
      engineerStats._max.salary ? Number(engineerStats._max.salary) : null,
      lawyerStats._max.salary ? Number(lawyerStats._max.salary) : null
    ].filter((s): s is number => s !== null)
    const maxSalary = maxSalaryArray.length > 0 ? Math.max(...maxSalaryArray) : 0

    // Process department distribution from raw query results
    const departmentStatsMap: Record<string, { total: number; active: number; roles: Record<string, number> }> = {}
    if (Array.isArray(departmentGroups)) {
      departmentGroups.forEach((dept: any) => {
        const deptName = dept.department
        if (!departmentStatsMap[deptName]) {
          departmentStatsMap[deptName] = { total: 0, active: 0, roles: {} }
        }
        departmentStatsMap[deptName].total += Number(dept.total)
        departmentStatsMap[deptName].active += Number(dept.active)
        
        if (!departmentStatsMap[deptName].roles[dept.role]) {
          departmentStatsMap[deptName].roles[dept.role] = 0
        }
        departmentStatsMap[deptName].roles[dept.role] += Number(dept.total)
      })
    }

    // Process monthly trends from raw query results
    const monthlyTrendsMap: Record<string, { teachers: number; doctors: number; engineers: number; lawyers: number; total: number }> = {}
    if (Array.isArray(monthlyTrends)) {
      monthlyTrends.forEach((trend: any) => {
        const month = format(new Date(trend.month + '-01'), 'MMM yyyy')
        if (!monthlyTrendsMap[month]) {
          monthlyTrendsMap[month] = { teachers: 0, doctors: 0, engineers: 0, lawyers: 0, total: 0 }
        }
        const role = trend.role.toLowerCase() + 's'
        if (role === 'teachers') monthlyTrendsMap[month].teachers = Number(trend.count)
        else if (role === 'doctors') monthlyTrendsMap[month].doctors = Number(trend.count)
        else if (role === 'engineers') monthlyTrendsMap[month].engineers = Number(trend.count)
        else if (role === 'lawyers') monthlyTrendsMap[month].lawyers = Number(trend.count)
        monthlyTrendsMap[month].total += Number(trend.count)
      })
    }

    // Convert monthly trends to array format
    const monthlyData = Object.entries(monthlyTrendsMap)
      .map(([month, data]) => ({ month, ...data }))
      .slice(0, 6) // Last 6 months

    // Process experience distribution from raw query results
    const experienceDistribution = Array.isArray(experienceGroups) 
      ? experienceGroups.map((exp: any) => ({
          range: exp.experience_range,
          count: Number(exp.count)
        }))
      : []

    // Salary statistics are already calculated above

    // Role distribution for pie chart
    const roleDistribution = [
      { name: 'Teachers', value: teacherStats._count.id || 0, color: '#3B82F6' },
      { name: 'Doctors', value: doctorStats._count.id || 0, color: '#10B981' },
      { name: 'Engineers', value: engineerStats._count.id || 0, color: '#8B5CF6' },
      { name: 'Lawyers', value: lawyerStats._count.id || 0, color: '#6366F1' }
    ]

    return NextResponse.json({
      overview: {
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        avgSalary: Math.round(avgSalary),
        minSalary: Math.round(minSalary),
        maxSalary: Math.round(maxSalary)
      },
      roleDistribution,
      departmentStats: departmentStatsMap,
      monthlyTrends: monthlyData,
      experienceDistribution,
      filters: {
        dateRange,
        department,
        status
      }
    })

  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
