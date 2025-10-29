"use client"

import { useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  BarChart3,
  LogOut,
  Globe,
  X
} from "lucide-react"
import { getFilteredNavigationItems, type NavigationItem } from "@/lib/navigation"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }, [])

  const goToWebsite = useCallback(() => {
    window.location.href = "/"
  }, [])

  if (!isOpen) return null

  return (
    <>
      {/* Mobile Menu Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 shadow-2xl lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Application</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {getFilteredNavigationItems(session?.user?.role).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 hover:shadow-sm",
                    isActive && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500 group-hover:text-blue-600">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </nav>

        {/* Mobile Footer Actions */}
        <div className="p-3 border-t border-gray-200 space-y-2">
          <button
            onClick={() => {
              goToWebsite()
              onClose()
            }}
            className="group w-full flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 hover:shadow-sm"
            type="button"
          >
            <div className="flex items-center justify-center w-8 h-8 mr-3">
              <Globe className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Website Home</div>
              <div className="text-xs text-gray-500 group-hover:text-green-600">
                Back to landing page
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              handleSignOut()
              onClose()
            }}
            className="group w-full flex items-center px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 hover:shadow-sm"
            type="button"
          >
            <div className="flex items-center justify-center w-8 h-8 mr-3">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Sign Out</div>
              <div className="text-xs text-gray-500 group-hover:text-red-600">
                {session?.user?.username || 'User'}
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}
