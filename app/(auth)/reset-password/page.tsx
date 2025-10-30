"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  AlertCircle
} from "lucide-react"
import { resetPasswordSchema, type ResetPasswordForm, passwordRequirements } from "@/lib/validations/auth"
import { auth as a } from "@/lib/styles"



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

function ResetPasswordPageContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const watchedPassword = watch("password")

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please use the link from your email.")
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError("No reset token provided")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to reset password")
      }
    } catch (error) {
      console.error('Network error:', error)
      setError("Network error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setValue("password", value)
  }

  const getRequirementStatus = (regex: RegExp) => {
    return regex.test(password)
  }

  if (isSubmitted) {
    return (
      <div className="w-full">
          <div className={a.card}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Password Reset Successfully!
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                  Your password has been updated and you can now sign in with your new credentials.
                </p>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  For security reasons, you've been logged out of all devices. Please sign in again with your new password.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-3"
              >
                <Button
                  asChild
                  className="w-full h-11 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Link href="/signin">
                    Sign In Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    asChild
                    className="h-11 border-gray-300 hover:bg-gray-50 rounded-lg"
                  >
                    <Link href="/">
                      Go to Homepage
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    asChild
                    className="h-11 border-gray-300 hover:bg-gray-50 rounded-lg"
                  >
                    <Link href="/signup">
                      Create New Account
                    </Link>
                  </Button>
                </div>
              </motion.div>


            </motion.div>
          </div>
        </div>
    )
  }

  return (
    <div className="w-full"><div className={a.card}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mb-6 text-center"
                >
                  <h1 className="text-2xl font-semibold text-gray-900">
                    New Password
                  </h1>
                </motion.div>

                {/* Token Validation */}
                {!token && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-red-800">Invalid Reset Link</h3>
                        <p className="text-red-700 text-sm">
                          This password reset link is invalid or has expired. Please request a new password reset.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        asChild
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Link href="/forgot-password">
                          Request New Reset Link
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Form */}
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                  style={{ opacity: !token ? 0.5 : 1 }}
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative"
                      role="alert"
                    >
                      <strong className="font-bold">Error!</strong>
                      <span className="block sm:inline"> {error}</span>
                      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <AlertCircle className="h-5 w-5" />
                      </span>
                    </motion.div>
                  )}
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                        {...register("password")}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {errors.password.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Requirements - match signup behavior: hidden until typing */}
                  {watchedPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {passwordRequirements.map((requirement) => {
                          const isMet = getRequirementStatus(requirement.regex)
                          return (
                            <div key={requirement.id} className={`${isMet ? 'text-green-600' : 'text-gray-500'} flex items-center gap-1.5`}>
                              {isMet ? <CheckCircle className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full bg-gray-300 inline-block" />}
                              <span>{requirement.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full h-11 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Reset Password
                        <CheckCircle className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  {/* Back to Sign In */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center pt-4"
                  >
                    <Link
                      href="/signin"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Back to Sign In
                    </Link>
                  </motion.div>
                </motion.form>
            </motion.div>
        </div></div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}