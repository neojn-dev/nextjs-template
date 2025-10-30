"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { fadeInUp, hoverScale } from "@/lib/animations"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle
} from "lucide-react"
import { forgotPasswordSchema, type ForgotPasswordForm } from "@/lib/validations/auth"
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

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const errorData = await response.json()
        console.error('Forgot password error:', errorData)
        // Still show success to prevent email enumeration
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Network error:', error)
      // Still show success to prevent email enumeration
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: getValues("email") }),
      })

      if (response.ok) {
        // Show success message or toast
        console.log('Password reset email resent successfully')
      } else {
        console.error('Failed to resend email')
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setIsLoading(false)
    }
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
                  Check Your Email
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-blue-600">{getValues("email")}</span>
                </p>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Click the link in your email to reset your password. The link will expire in 24 hours.
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
                  onClick={handleResendEmail}
                  disabled={isLoading}
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
                      Resend Email
                      <Mail className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    asChild
                    className="h-11 border-gray-300 hover:bg-gray-50 rounded-lg"
                  >
                    <Link href="/signin">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Sign In
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
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className={a.titleWrap}>
                  <h1 className={a.title}>Reset Password</h1>
                </motion.div>

                {/* Form */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
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
                        Send Reset Link
                        <Mail className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  {/* Back to Sign In */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-center pt-4"
                  >
                    <Link
                      href="/signin"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </motion.div>
                </motion.form>
            </motion.div>
        </div></div>
  )
}
