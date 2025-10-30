"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Check,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signupSchema, type SignupForm, passwordRequirements } from "@/lib/validations/auth"
import { auth as a } from "@/lib/styles"
import { cn } from "@/lib/utils"



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

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    formState
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      agreeToTerms: false
    }
  })

  const watchedFields = watch()

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to create account")
        return
      }

      setSuccess("Account created successfully! Please check your email to verify your account.")
      
      // Redirect to signin page after a delay
      setTimeout(() => {
        router.push("/signin?message=account_created")
      }, 3000)
      
    } catch (error) {
      setError("An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (provider: string) => {
    setSocialLoading(provider)
    // Simulate social signup
    await new Promise(resolve => setTimeout(resolve, 2500))
    setSocialLoading(null)
    console.log(`Signing up with ${provider}`)
  }

  // Single-step form now; steps removed



  return (
    <div className="w-full">
        <div className={a.card}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className={a.titleWrap}>
                  <h1 className={a.title}>Sign Up</h1>
                </motion.div>

                {/* Error Message */}
                {error && (<motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={a.error}><p>{error}</p></motion.div>)}

                {/* Success Message */}
                {success && (<motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={a.success}><p>{success}</p></motion.div>)}

                {/* Steps removed for single-step signup */}

                {/* Form */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="stepSingle"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                        {/* First Name and Last Name Fields */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                              First Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="firstName"
                                placeholder="First name"
                                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                                {...register("firstName")}
                              />
                            </div>
                            {errors.firstName && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-600 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {errors.firstName.message}
                              </motion.p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                              Last Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="lastName"
                                placeholder="Last name"
                                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                                {...register("lastName")}
                              />
                            </div>
                            {errors.lastName && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-600 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {errors.lastName.message}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-1">
                          <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                            Username
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="username"
                              placeholder="Choose a username"
                              className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                              {...register("username")}
                            />
                          </div>
                          {errors.username && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-600 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              {errors.username.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1">
                          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
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

                        {/* Password Field */}
                        <div className="space-y-1">
                          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                            Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
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
                          
                          {/* Password Requirements */}
                          {watchedFields.password && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                {passwordRequirements.map((requirement) => {
                                  const isMet = requirement.regex.test(watchedFields.password)
                                  return (
                                    <div key={requirement.id} className={`flex items-center gap-1.5 ${
                                      isMet ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                      {isMet ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <X className="h-3 w-3" />
                                      )}
                                      <span>{requirement.label}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1">
                          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
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

                        {/* Terms and Marketing */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="agreeToTerms"
                              checked={watchedFields.agreeToTerms}
                              onCheckedChange={(checked) => {
                                setValue("agreeToTerms", checked as boolean)
                                trigger("agreeToTerms")
                              }}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">
                              I agree to the{" "}
                              <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                                Privacy Policy
                              </Link>
                            </Label>
                          </div>
                          {errors.agreeToTerms && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-600 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              {errors.agreeToTerms.message}
                            </motion.p>
                          )}

                          {/* Marketing emails removed per request */}
                        </div>
                        {/* Action Button */}
                        <Button
                          type="submit"
                          disabled={!watchedFields.agreeToTerms || isLoading}
                          className={cn(
                            "w-full h-12 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed",
                            watchedFields.agreeToTerms && !isLoading
                              ? "bg-gray-900 text-white hover:bg-gray-800"
                              : "bg-gray-200 text-gray-500"
                          )}
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              Create Account
                              <CheckCircle className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                  </AnimatePresence>

                  

                  {/* Sign In Link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center pt-4"
                  >
                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Link
                        href="/signin"
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </motion.div>
                </motion.form>
            </motion.div>
        </div>
    </div>
  )
}
