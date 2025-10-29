/**
 * AUTHENTICATED APP LAYOUT - Layout for Protected Application Pages
 * 
 * This layout is used for all authenticated/protected pages in the application.
 * It provides:
 * - Beautiful collapsible sidebar navigation
 * - App header with user profile and quick navigation
 * - App footer with links and status
 * - Mobile-responsive design with hamburger menu
 * - User session management
 * - Navigation to app features (Dashboard, My Data, Roles)
 * - Website home and logout functionality
 * 
 * Used by: /dashboard, /doctors, /engineers, /teachers, /lawyers
 * Route Group: (app)
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { 
  Menu
} from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { AppHeader, AppFooter, Sidebar } from "@/components/website-components"
import { ToastContainerWrapper } from "@/components/ui/toast-container"
import { useSessionValidator } from "@/hooks/use-session-validator"
import { AppLoadingPage } from "@/components/ui/loading-spinner"
import { MobileMenu } from "@/components/ui/mobile-menu"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [checkingPassword, setCheckingPassword] = useState(true)

  // Initialize session validator with 5-minute intervals
  useSessionValidator({
    intervalMs: 5 * 60 * 1000, // 5 minutes
    validateOnFocus: true,      // Validate when user returns to tab
    validateOnMount: true,      // Validate on page refresh/load
    showNotifications: true     // Show toast notifications
  })

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user must change password
  useEffect(() => {
    const checkPasswordRequirement = async () => {
      if (session?.user?.id && mounted) {
        try {
          const response = await fetch('/api/auth/check-password-requirement')
          if (response.ok) {
            const data = await response.json()
            setMustChangePassword(data.mustChangePassword)
          }
        } catch (error) {
          console.error('Error checking password requirement:', error)
        } finally {
          setCheckingPassword(false)
        }
      } else if (mounted) {
        setCheckingPassword(false)
      }
    }

    checkPasswordRequirement()
  }, [session?.user?.id, mounted])

  // Handle mandatory password change redirect
  useEffect(() => {
    if (mounted && mustChangePassword && !checkingPassword && pathname !== '/change-password') {
      router.push('/change-password?mandatory=true')
    }
  }, [mounted, mustChangePassword, checkingPassword, pathname, router])

  // Handle authentication redirect
  useEffect(() => {
    if (mounted && status === "unauthenticated" && !isRedirecting) {
      setIsRedirecting(true)
      router.push("/signin")
    }
  }, [mounted, status, router, isRedirecting])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Memoized handlers to prevent unnecessary re-renders
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Show loading state while session is being determined or checking password requirements
  if (status === "loading" || !mounted || checkingPassword) {
    return <AppLoadingPage text="Loading..." />
  }

  // Don't render anything while redirecting
  if (status === "unauthenticated" || isRedirecting) {
    return <AppLoadingPage text="Redirecting..." />
  }

  // Don't render main app if user must change password (will redirect)
  if (mustChangePassword && pathname !== '/change-password') {
    return <AppLoadingPage text="Redirecting to password change..." />
  }

  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {/* Full Height Sidebar */}
        <div className="hidden lg:block h-full flex-shrink-0">
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleCollapse} />
        </div>

        {/* Main Content Area - Header, Content, Footer */}
        <div className="flex-1 flex flex-col h-full min-h-0">
          {/* App Header - Positioned to the right of sidebar */}
          <div className="flex-shrink-0">
            <AppHeader />
          </div>
          
          {/* Main Content - Scrollable area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
            <div key={pathname} className="p-6 min-h-full">
              {children}
            </div>
          </main>
          
          {/* App Footer - Positioned to the right of sidebar */}
          <div className="flex-shrink-0">
            <AppFooter />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
          type="button"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Mobile Menu Component */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
      </div>
      
      {/* Toast Notifications */}
      <ToastContainerWrapper />

    </ErrorBoundary>
  )
}




