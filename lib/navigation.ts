/**
 * NAVIGATION CONFIGURATION MODULE
 * 
 * Provides navigation items and menu configuration for the authenticated app.
 * 
 * WHAT IT DOES:
 * - Defines all available navigation items
 * - Filters items based on user role
 * - Provides role-based access control for navigation
 * 
 * WHY ROLE-BASED NAVIGATION?
 * - Security: Users only see what they can access
 * - UX: Cleaner interface (no dead links)
 * - Clarity: Clear permission boundaries
 * 
 * CLIENT-SIDE USAGE:
 * This file runs on the client (used in sidebar component).
 * Cannot import server-only modules (like lib/config.ts).
 * Uses NEXT_PUBLIC_ environment variables instead.
 * 
 * NAVIGATION STRUCTURE:
 * Each item includes:
 * - title: Display name
 * - description: Tooltip/subtitle
 * - href: Route path
 * - icon: Lucide icon component
 * - activeColor: Gradient colors for active state
 * - activeIconBg: Background styling for active icon
 * - textColor: Text color for active state
 * - roles: Array of roles that can access (undefined = all roles)
 * 
 * USAGE:
 * ```typescript
 * import { getFilteredNavigationItems } from '@/lib/navigation'
 * 
 * const navItems = getFilteredNavigationItems(userRole)
 * ```
 */

import { 
  LayoutDashboard,
  Users,
  UserCog,
  UserCircle2,
  GraduationCap,
  Briefcase,
  HardHat,
  Scale,
  Folder
} from "lucide-react"
import { LucideIcon } from "lucide-react"

/**
 * FEATURE FLAG CHECK
 * 
 * Checks if workflows feature is enabled.
 * 
 * WHY NEXT_PUBLIC_?
 * - This file runs on client (in sidebar component)
 * - Server-only env vars (without NEXT_PUBLIC_) aren't available client-side
 * - NEXT_PUBLIC_ makes env var available to browser
 * 
 * DEFAULT: "true" (workflows enabled by default)
 * 
 * USAGE:
 * Conditionally includes workflow navigation items based on this flag.
 */
const workflowsEnabled = (process.env.NEXT_PUBLIC_ENABLE_WORKFLOWS ?? "true") === "true"

/**
 * NAVIGATION ITEM INTERFACE
 * 
 * Defines the structure of a navigation item.
 * 
 * PROPERTIES:
 * - title: Display name shown in navigation
 * - description: Tooltip or subtitle text
 * - href: Route path (e.g., "/dashboard")
 * - icon: Lucide icon component
 * - activeColor: Tailwind gradient classes for active state
 * - activeIconBg: Background styling for active icon
 * - textColor: Text color class for active state
 * - roles: Optional array of roles that can access this item
 * 
 * ROLES PROPERTY:
 * - undefined or empty array: Accessible to all roles
 * - ["Admin"]: Only Admin role can access
 * - ["Admin", "Manager"]: Admin or Manager can access
 */
export interface NavigationItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
  activeColor: string // Tailwind gradient (e.g., "from-blue-500 to-cyan-500")
  activeIconBg: string // Tailwind classes for active icon background
  textColor: string // Tailwind text color class
  roles?: string[] // If undefined, accessible to all roles
}

/**
 * ALL NAVIGATION ITEMS
 * 
 * Complete list of all navigation items in the application.
 * 
 * ITEMS INCLUDED:
 * - Dashboard: Analytics overview (all roles)
 * - Transfer Requests: Workflow system (feature flag, all roles)
 * - My Profile: User profile (all roles)
 * - File Manager: File uploads (all roles)
 * - Users: User management (Admin only)
 * - Roles: Role management (Admin only)
 * - Teachers: Teacher records (all roles)
 * - Doctors: Doctor records (all roles)
 * - Engineers: Engineer records (all roles)
 * - Lawyers: Lawyer records (all roles)
 * 
 * FEATURE FLAG USAGE:
 * Transfer Requests item is conditionally included based on workflowsEnabled flag.
 * Uses spread operator (...) to conditionally add item to array.
 * 
 * STYLING NOTES:
 * Each item has unique color scheme:
 * - activeColor: Gradient colors for active state
 * - activeIconBg: Icon background with gradient and shadow
 * - textColor: Text color matching the theme
 */
const allNavigationItems: NavigationItem[] = [
  /**
   * DASHBOARD ITEM
   * 
   * Overview and analytics page.
   * Accessible to all authenticated users.
   */
  {
    title: "Dashboard",
    description: "Overview & analytics",
    href: "/dashboard",
    icon: LayoutDashboard,
    activeColor: "from-blue-500 to-cyan-500",
    activeIconBg: "bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-300 shadow-lg shadow-blue-200/50",
    textColor: "text-blue-700"
  },
  
  /**
   * TRANSFER REQUESTS ITEM (CONDITIONAL)
   * 
   * Workflow system for transfer requests.
   * Only included if workflows feature is enabled.
   * 
   * CONDITIONAL RENDERING:
   * Uses spread operator with ternary:
   * - If workflowsEnabled: Adds item to array
   * - If not: Adds empty array (nothing added)
   */
  ...(workflowsEnabled ? [{
    title: "Transfer Requests",
    description: "Workflows",
    href: "/workflows/transfer-requests",
    icon: Folder,
    activeColor: "from-teal-500 to-emerald-500",
    activeIconBg: "bg-gradient-to-br from-teal-500 to-emerald-500 border-teal-300 shadow-lg shadow-teal-200/50",
    textColor: "text-teal-700"
  }] : []),
  
  /**
   * MY PROFILE ITEM
   * 
   * User's own profile page.
   * Accessible to all authenticated users.
   */
  {
    title: "My Profile",
    description: "Your account",
    href: "/profile",
    icon: UserCircle2,
    activeColor: "from-gray-600 to-gray-900",
    activeIconBg: "bg-gradient-to-br from-gray-600 to-gray-900 border-gray-300 shadow-lg shadow-gray-200/50",
    textColor: "text-gray-800"
  },
  
  /**
   * FILE MANAGER ITEM
   * 
   * File upload and management system.
   * Accessible to all authenticated users.
   */
  {
    title: "File Manager",
    description: "Documents & uploads",
    href: "/files",
    icon: Folder,
    activeColor: "from-green-500 to-emerald-500",
    activeIconBg: "bg-gradient-to-br from-green-500 to-emerald-500 border-green-300 shadow-lg shadow-green-200/50",
    textColor: "text-green-700"
  },
  
  /**
   * USERS ITEM (ADMIN ONLY)
   * 
   * User management page.
   * Only accessible to Admin role.
   * 
   * ROLE RESTRICTION:
   * roles: ["Admin"] means only Admin users see this item.
   */
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
  
  /**
   * ROLES ITEM (ADMIN ONLY)
   * 
   * Role management page.
   * Only accessible to Admin role.
   */
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
  
  /**
   * TEACHERS ITEM
   * 
   * Teacher records management.
   * Accessible to all authenticated users.
   */
  {
    title: "Teachers",
    description: "Teacher records",
    href: "/teachers",
    icon: GraduationCap,
    activeColor: "from-orange-500 to-red-500",
    activeIconBg: "bg-gradient-to-br from-orange-500 to-red-500 border-orange-300 shadow-lg shadow-orange-200/50",
    textColor: "text-orange-700"
  },
  
  /**
   * DOCTORS ITEM
   * 
   * Doctor records management.
   * Accessible to all authenticated users.
   */
  {
    title: "Doctors",
    description: "Doctor records",
    href: "/doctors",
    icon: Briefcase,
    activeColor: "from-teal-500 to-cyan-500",
    activeIconBg: "bg-gradient-to-br from-teal-500 to-cyan-500 border-teal-300 shadow-lg shadow-teal-200/50",
    textColor: "text-teal-700"
  },
  
  /**
   * ENGINEERS ITEM
   * 
   * Engineer records management.
   * Accessible to all authenticated users.
   */
  {
    title: "Engineers",
    description: "Engineer records",
    href: "/engineers",
    icon: HardHat,
    activeColor: "from-amber-500 to-yellow-500",
    activeIconBg: "bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-300 shadow-lg shadow-amber-200/50",
    textColor: "text-amber-700"
  },
  
  /**
   * LAWYERS ITEM
   * 
   * Lawyer records management.
   * Accessible to all authenticated users.
   */
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
 * GET FILTERED NAVIGATION ITEMS FUNCTION
 * 
 * Returns navigation items filtered by user role.
 * 
 * HOW IT WORKS:
 * 1. If no role provided: Returns items accessible to all (no roles restriction)
 * 2. If role provided: Returns items accessible to that role
 * 
 * FILTERING LOGIC:
 * - Items without roles array: Accessible to everyone (always included)
 * - Items with roles array: Only included if userRole is in the array
 * 
 * EXAMPLES:
 * ```typescript
 * // Admin user
 * getFilteredNavigationItems("Admin")
 * // Returns: Dashboard, Profile, Files, Users, Roles, Teachers, Doctors, etc.
 * 
 * // Regular user
 * getFilteredNavigationItems("User")
 * // Returns: Dashboard, Profile, Files, Teachers, Doctors, etc.
 * // (No Users, Roles - those require Admin)
 * 
 * // No role (not logged in)
 * getFilteredNavigationItems()
 * // Returns: Only items without role restrictions
 * ```
 * 
 * USE CASE:
 * Used in sidebar component to show appropriate navigation items.
 * 
 * @param userRole - The user's role (e.g., "Admin", "Manager", "User")
 * @returns Array of navigation items filtered by role
 */
export function getFilteredNavigationItems(userRole?: string): NavigationItem[] {
  /**
   * NO ROLE CASE
   * 
   * If user has no role (not logged in, or role not set):
   * Return only items that don't require specific roles.
   * This prevents showing Admin-only items to unauthenticated users.
   */
  if (!userRole) {
    // Filter: Only items without roles array (accessible to all)
    return allNavigationItems.filter(item => !item.roles || item.roles.length === 0)
  }

  /**
   * ROLE-BASED FILTERING
   * 
   * Filter items based on role:
   * - Items without roles array: Always included (accessible to all)
   * - Items with roles array: Only included if userRole matches
   */
  return allNavigationItems.filter(item => {
    // If item has no roles restriction, it's accessible to everyone
    if (!item.roles || item.roles.length === 0) {
      return true // Accessible to all
    }
    // Check if user's role is in the allowed roles array
    return item.roles.includes(userRole)
  })
}

/**
 * GET ALL NAVIGATION ITEMS FUNCTION
 * 
 * Returns all navigation items without filtering.
 * 
 * USE CASE:
 * - Admin/debug purposes
 * - Testing
 * - Development tools
 * 
 * NOTE:
 * Does NOT filter by role. Returns everything.
 * Use getFilteredNavigationItems() for production.
 * 
 * @returns Array of all navigation items (unfiltered)
 */
export function getAllNavigationItems(): NavigationItem[] {
  return allNavigationItems
}

