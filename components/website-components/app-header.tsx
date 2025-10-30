"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  LogOut,
  Building2
} from "lucide-react"

export function AppHeader() {
  const { data: session, status } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Brand / Home link */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-gray-900 group-hover:underline">Data Panel</span>
              <span className="text-xs text-gray-500">Management System</span>
            </div>
          </Link>

          {/* Right Side - User Info and Actions */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : session?.user ? (
              <>

                {/* User Name */}
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {session?.user?.username || 'User'}
                </span>

                {/* Logout Button */}
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/signin" className="flex items-center space-x-2">
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}