/**
 * Navigation configuration for the authenticated app
 * Provides navigation items filtered by user role
 */

import { 
  LayoutDashboard,
  Users,
  UserCog,
  Database,
  GraduationCap,
  Briefcase,
  HardHat,
  Scale
} from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface NavigationItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
  activeColor: string
  activeIconBg: string
  textColor: string
  roles?: string[] // If undefined, accessible to all roles
}

// Define all available navigation items
const allNavigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    description: "Overview & analytics",
    href: "/dashboard",
    icon: LayoutDashboard,
    activeColor: "from-blue-500 to-cyan-500",
    activeIconBg: "bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-300 shadow-lg shadow-blue-200/50",
    textColor: "text-blue-700"
  },
  {
    title: "Users",
    description: "User management",
    href: "/users",
    icon: Users,
    activeColor: "from-purple-500 to-pink-500",
    activeIconBg: "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-300 shadow-lg shadow-purple-200/50",
    textColor: "text-purple-700",
    roles: ["Admin"] // Only admin can access
  },
  {
    title: "Roles",
    description: "Role management",
    href: "/roles",
    icon: UserCog,
    activeColor: "from-indigo-500 to-purple-500",
    activeIconBg: "bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-300 shadow-lg shadow-indigo-200/50",
    textColor: "text-indigo-700",
    roles: ["Admin"] // Only admin can access
  },
  {
    title: "Master Data",
    description: "Master data management",
    href: "/master-data",
    icon: Database,
    activeColor: "from-green-500 to-emerald-500",
    activeIconBg: "bg-gradient-to-br from-green-500 to-emerald-500 border-green-300 shadow-lg shadow-green-200/50",
    textColor: "text-green-700"
  },
  {
    title: "Teachers",
    description: "Teacher records",
    href: "/teachers",
    icon: GraduationCap,
    activeColor: "from-orange-500 to-red-500",
    activeIconBg: "bg-gradient-to-br from-orange-500 to-red-500 border-orange-300 shadow-lg shadow-orange-200/50",
    textColor: "text-orange-700"
  },
  {
    title: "Doctors",
    description: "Doctor records",
    href: "/doctors",
    icon: Briefcase,
    activeColor: "from-teal-500 to-cyan-500",
    activeIconBg: "bg-gradient-to-br from-teal-500 to-cyan-500 border-teal-300 shadow-lg shadow-teal-200/50",
    textColor: "text-teal-700"
  },
  {
    title: "Engineers",
    description: "Engineer records",
    href: "/engineers",
    icon: HardHat,
    activeColor: "from-amber-500 to-yellow-500",
    activeIconBg: "bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-300 shadow-lg shadow-amber-200/50",
    textColor: "text-amber-700"
  },
  {
    title: "Lawyers",
    description: "Lawyer records",
    href: "/lawyers",
    icon: Scale,
    activeColor: "from-violet-500 to-purple-500",
    activeIconBg: "bg-gradient-to-br from-violet-500 to-purple-500 border-violet-300 shadow-lg shadow-violet-200/50",
    textColor: "text-violet-700"
  }
]

/**
 * Get filtered navigation items based on user role
 * @param userRole - The user's role (e.g., "Admin", "Manager", "User")
 * @returns Array of navigation items filtered by role
 */
export function getFilteredNavigationItems(userRole?: string): NavigationItem[] {
  if (!userRole) {
    // If no role, return items that don't require specific roles
    return allNavigationItems.filter(item => !item.roles || item.roles.length === 0)
  }

  // Filter items based on role
  // Items without roles array are accessible to everyone
  // Items with roles array are only accessible to specified roles
  return allNavigationItems.filter(item => {
    if (!item.roles || item.roles.length === 0) {
      return true // Accessible to all
    }
    return item.roles.includes(userRole)
  })
}

/**
 * Get all navigation items (for admin/debug purposes)
 */
export function getAllNavigationItems(): NavigationItem[] {
  return allNavigationItems
}

