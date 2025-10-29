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
  Building2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getFilteredNavigationItems, type NavigationItem } from "@/lib/navigation"

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
        {/* Logo Section - Perfect proportions */}
        <div className="px-6 py-8 border-b border-gray-200/60">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center space-x-4"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl opacity-20 blur-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 leading-tight tracking-tight">Data Panel</span>
                  <span className="text-xs text-gray-500 leading-tight font-medium">Management System</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl opacity-20 blur-sm"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation - Perfect spacing */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {filteredNavigationItems.map((item, index) => {
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
                      "group relative flex items-center rounded-2xl transition-all duration-300 cursor-pointer",
                      isCollapsed ? "p-2 justify-center" : "px-4 py-3",
                      isActive 
                        ? `bg-gradient-to-r ${item.activeColor} border border-white/60 shadow-lg shadow-gray-200/50` 
                        : "bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-md hover:shadow-gray-200/30"
                    )}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >

                    {/* Icon container - perfect aspect ratio */}
                    <div className={cn(
                      "relative flex items-center justify-center rounded-xl transition-all duration-300 flex-shrink-0",
                      isCollapsed ? "w-7 h-7" : "w-9 h-9",
                      isActive 
                        ? item.activeIconBg 
                        : "bg-white border border-gray-200 group-hover:scale-110 group-hover:border-gray-300"
                    )}>
                      <Icon className={cn(
                        "transition-all duration-300",
                        isCollapsed ? "h-4 w-4" : "h-4 w-4",
                        isActive ? item.textColor : "text-gray-600 group-hover:text-gray-700"
                      )} />
                    </div>

                    {/* Text with perfect spacing */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="ml-4 flex-1"
                        >
                          <span className={cn(
                            "font-semibold text-sm transition-all duration-300 tracking-wide",
                            isActive ? item.textColor : "text-gray-600 group-hover:text-gray-700"
                          )}>
                            {item.title}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state - hypermodern */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-200 shadow-lg shadow-gray-200/50">
                        {item.title}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
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