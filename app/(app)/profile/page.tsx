"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ProfileImageUploader } from "@/components/ui/profile-image-uploader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Shield, Calendar, User, CheckCircle, Eye, EyeOff, Lock, Check, X, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { passwordRequirements } from "@/lib/validations/auth"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = session?.user
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  
  // Auto-open modal if mustChangePassword is in URL
  useEffect(() => {
    if (searchParams.get('mustChangePassword') === 'true') {
      setIsChangePasswordOpen(true)
      // Clean up URL
      router.replace('/profile', { scroll: false })
    }
  }, [searchParams, router])
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const watchedNewPassword = watch("newPassword")
  
  const handleImageUpdated = async () => {
    // Refresh the session to get updated profile image
    await updateSession()
    // Force reload to clear image cache
    router.refresh()
    window.location.reload()
  }

  const handleChangePassword = async (data: ChangePasswordForm) => {
    setIsChangingPassword(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccessMessage(true)
        
        // After 2 seconds, log out
        setTimeout(async () => {
          await signOut({ callbackUrl: "/signin?message=Password changed successfully. Please login with your new password." })
        }, 2000)
      } else {
        setErrorMessage(result.error || "Failed to change password")
        setIsChangingPassword(false)
      }
    } catch (error) {
      console.error("Password change error:", error)
      setErrorMessage("An error occurred while changing password")
      setIsChangingPassword(false)
    }
  }

  const handleCloseModal = () => {
    if (!isChangingPassword && !successMessage) {
      setIsChangePasswordOpen(false)
      reset()
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setErrorMessage(null)
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Profile Header with Gradient */}
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-8 text-white">
              <div className="text-center">
                <div className="font-semibold text-lg mb-1">{user?.name || user?.username || "User"}</div>
                <div className="text-blue-100 text-sm flex items-center justify-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div className="p-6 border-b border-gray-100">
              <ProfileImageUploader 
                initialUrl={user?.image || (user as any)?.profileImage || null} 
                onUpdated={handleImageUpdated}
              />
            </div>

            {/* Quick Stats */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  Role
                </div>
                <div className="text-sm font-semibold text-gray-900">{user?.role || "User"}</div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Status
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="pt-2">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <User className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-600 mb-1">User ID</div>
                    <div className="font-mono text-gray-700 break-all">{user?.id || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Account Details */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                  <p className="text-sm text-gray-500">Your personal account details</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
                    <User className="h-3.5 w-3.5" />
                    Username
                  </label>
                  <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 flex items-center text-gray-900 font-medium">
                    {user?.username || user?.name || "-"}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </label>
                  <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 flex items-center text-gray-900 font-medium">
                    {user?.email || "-"}
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
                    <Shield className="h-3.5 w-3.5" />
                    Role
                  </label>
                  <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user?.role || "User"}
                    </span>
                  </div>
                </div>

                {/* Registered Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
                    <Calendar className="h-3.5 w-3.5" />
                    Member Since
                  </label>
                  <div className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 flex items-center text-gray-600">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric' 
                        })
                      : '— —'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                  <p className="text-sm text-gray-500">Manage your password and security settings</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Password</div>
                    <p className="text-sm text-gray-500">Last changed: Recently</p>
                  </div>
                </div>
                <Button onClick={() => setIsChangePasswordOpen(true)} variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={isChangePasswordOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password to keep your account secure.
            </DialogDescription>
          </DialogHeader>

          {successMessage ? (
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Changed Successfully!</h3>
              <p className="text-sm text-gray-600">
                You will be logged out in a moment. Please login with your new password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}
              
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="pl-10 pr-10"
                    disabled={isChangingPassword}
                    {...register("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    disabled={isChangingPassword}
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                )}

                {/* Password Requirements */}
                {watchedNewPassword && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {passwordRequirements.map((requirement) => {
                        const isMet = requirement.regex.test(watchedNewPassword)
                        return (
                          <div
                            key={requirement.id}
                            className={`flex items-center gap-2 text-xs ${isMet ? "text-green-600" : "text-gray-500"}`}
                          >
                            {isMet ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>{requirement.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    disabled={isChangingPassword}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
