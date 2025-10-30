"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Building2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getFilteredNavigationItems, type NavigationItem } from "@/lib/navigation"
import { sidebar as s } from "@/lib/styles"

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

const containerVariants = {
  expanded: { width: "17rem" },
  collapsed: { width: "4.5rem" }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    user: true,
    city: true,
    analytics: true
  })

  // Get filtered navigation items based on user role
  const filteredNavigationItems = getFilteredNavigationItems(session?.user?.role)

  return (
    <motion.div
      variants={containerVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 flex flex-col relative overflow-hidden border-r border-gray-200/60 shadow-xl shadow-gray-100/50"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)]"></div>
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Header moved to AppHeader; remove logo block to save space */}

        {/* Navigation - Perfect spacing */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {isCollapsed ? (
            // Collapsed: keep flat icon list for clarity
            filteredNavigationItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.href}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <Link href={item.href}>
                    <motion.div
                      className={cn(
                        s.rowBase,
                        "px-0 justify-center",
                        isActive ? s.rowActive : "bg-white hover:bg-gray-100 text-gray-700"
                      )}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className={cn(s.iconBoxSm)}>
                        <Icon className={cn(s.icon, isActive ? s.iconActive : s.iconInactive)} />
                      </div>
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-md border border-gray-200">
                        {item.title}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })
          ) : (
            // Expanded: show grouped, collapsible sections
            (() => {
              const groups: { key: string; title: string; items: NavigationItem[] }[] = [
                {
                  key: "analytics",
                  title: "Analytics",
                  items: filteredNavigationItems.filter(i => ["/dashboard", "/files"].includes(i.href))
                },
                {
                  key: "user",
                  title: "User Management",
                  items: filteredNavigationItems.filter(i => ["/profile", "/users", "/roles"].includes(i.href))
                },
                {
                  key: "city",
                  title: "City Data",
                  items: filteredNavigationItems.filter(i => ["/doctors", "/engineers", "/teachers", "/lawyers"].includes(i.href))
                }
              ]

              return groups
                .filter(group => group.items.length > 0)
                .map((group, gIndex) => (
                  <div key={group.key} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setOpenGroups(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                      className={s.headerButton}
                    >
                      <span>{group.title}</span>
                      <ChevronDown className={cn(s.headerCaret, openGroups[group.key] ? "rotate-0" : "-rotate-90")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openGroups[group.key] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-2 pl-1"
                        >
                          {group.items.map((item, index) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            const delay = (gIndex * 0.05) + (index * 0.06)
                            return (
                              <motion.div
                                key={item.href}
                                initial="hidden"
                                animate="visible"
                                variants={itemVariants}
                                transition={{ duration: 0.25, delay }}
                              >
                                <Link href={item.href}>
                                  <motion.div
                                    className={cn(
                                      s.rowBase,
                                      "px-3",
                                      isActive ? s.rowActive : s.rowInactive
                                    )}
                                    onMouseEnter={() => setHoveredItem(item.href)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    whileHover={{ scale: 1.01, y: -1 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    <div className={cn(s.iconBoxMd)}>
                                      <Icon className={cn(s.icon, isActive ? s.iconActive : s.iconInactive)} />
                                    </div>
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      transition={{ duration: 0.25, ease: "easeOut" }}
                                      className="ml-4 flex-1"
                                    >
                                      <span className={cn(
                                        "font-medium text-sm transition-colors duration-200 tracking-wide",
                                        isActive ? "text-white" : "text-gray-800"
                                      )}>
                                        {item.title}
                                      </span>
                                    </motion.div>
                                  </motion.div>
                                </Link>
                              </motion.div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
            })()
          )}
        </nav>

        {/* Collapse Toggle Icon - Simple and clean */}
        <div className="p-4">
          {onToggle && (
            <motion.div
              onClick={onToggle}
              className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-100/50 transition-all duration-300 cursor-pointer group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}