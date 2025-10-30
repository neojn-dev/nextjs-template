"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Eye, 
  EyeOff, 
  Lock,
  User, 
  ArrowRight, 
  Github, 
  Chrome,
  AlertCircle
} from "lucide-react"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AuthLoadingPage } from "@/components/ui/loading-spinner"
import { signinSchema, type SigninForm } from "@/lib/validations/auth"
import { auth as a } from "@/lib/styles"
import { handleApiError, getErrorMessage, ERROR_MESSAGES } from "@/lib/error-handling"



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

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // All hooks must be called before any conditional returns
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      rememberMe: false
    }
  })

  const rememberMe = watch("rememberMe")

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (data: SigninForm) => {
    if (isLoading) return // Prevent multiple submissions
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        // Check if the user exists but is deactivated
        try {
          const checkUserResponse = await fetch('/api/auth/check-user-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: data.identifier })
          })
          
          if (checkUserResponse.ok) {
            const userData = await checkUserResponse.json()
            if (userData.exists && !userData.isActive) {
              setError("Your account has been deactivated. Please contact your administrator.")
              return
            }
          }
        } catch (error) {
          console.warn('Failed to check user status:', error)
        }
        
        setError(ERROR_MESSAGES.INVALID_CREDENTIALS)
      } else if (result?.ok) {
        // Use replace instead of push to prevent back navigation issues
        router.replace("/dashboard")
      }
    } catch (error) {
      const appError = handleApiError(error)
      setError(appError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider)
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSocialLoading(null)
    console.log(`Signing in with ${provider}`)
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <AuthLoadingPage />
  }

  return (
    <div className="w-full" suppressHydrationWarning>
        <div className={a.card}>
            {/* Form */}
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
                  className={a.titleWrap}
                >
                  <h1 className={a.title}>Sign In</h1>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div key={error} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={a.error}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Form */}
                <motion.form
                  key="signin-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Username/Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-sm font-semibold text-gray-700">
                      Username or Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="Enter your username"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                        disabled={isLoading}
                        {...register("identifier")}
                      />
                    </div>
                    {errors.identifier && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {errors.identifier.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                        disabled={isLoading}
                        {...register("password")}
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

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className={a.dividerWrap}>
                    <div className={a.dividerLine}>
                      <div className={a.dividerHr} />
                    </div>
                    <div className={a.dividerTextWrap}>
                      <span className={a.dividerText}>Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("github")}
                      disabled={socialLoading !== null}
                      className="h-12 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-200"
                    >
                      {socialLoading === "github" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Github className="mr-2 h-5 w-5" />
                          GitHub
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("google")}
                      disabled={socialLoading !== null}
                      className="h-12 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-200"
                    >
                      {socialLoading === "google" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Chrome className="mr-2 h-5 w-5" />
                          Google
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Sign Up Link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center pt-4"
                  >
                    <p className="text-gray-600">
                      Don't have an account?{" "}
                      <Link
                        href="/signup"
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        Sign up for free
                      </Link>
                    </p>
                  </motion.div>
                </motion.form>
            </motion.div>
        </div>
    </div>
  )
}