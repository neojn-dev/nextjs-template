"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ProfileImageUploader } from "@/components/ui/profile-image-uploader"

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const user = session?.user
  
  const handleImageUpdated = async () => {
    // Refresh the session to get updated profile image
    await updateSession()
    // Force reload to clear image cache
    router.refresh()
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="h-9">
            <Link href="/change-password">Update Password</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">{user?.name || user?.username || "User"}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </div>
          <div className="mt-6">
            <ProfileImageUploader 
              initialUrl={user?.image || (user as any)?.profileImage || null} 
              onUpdated={handleImageUpdated}
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="text-gray-500">Role</div>
            <div className="text-gray-800 font-medium">{user?.role || "User"}</div>
            <div className="text-gray-500">Status</div>
            <div className="text-gray-800 font-medium">Active</div>
            <div className="text-gray-500">User ID</div>
            <div className="text-gray-800 font-mono">{user?.id || "-"}</div>
          </div>
        </div>

        {/* Account information */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Username</div>
              <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-gray-800">{user?.username || user?.name || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-gray-800">{user?.email || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Role</div>
              <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-gray-800">{user?.role || "User"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Registered</div>
              <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-gray-800">—</div>
            </div>
          </div>

          <div className="mt-6">
            <Button asChild className="h-10">
              <Link href="/change-password">Change Password</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


