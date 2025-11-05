/**
 * SIGN IN PAGE COMPONENT
 * 
 * This is the user sign-in page where users log into their accounts.
 * 
 * FLOW OVERVIEW:
 * 1. User enters username/email and password
 * 2. Form validates input using Zod schema (signinSchema)
 * 3. On submit, calls NextAuth signIn() function
 * 4. NextAuth validates credentials against database
 * 5. If valid, creates session and redirects to dashboard
 * 6. If invalid, displays error message
 * 
 * KEY TECHNOLOGIES:
 * - React Hook Form: Manages form state and validation
 * - Zod: Schema validation for type-safe form validation
 * - NextAuth.js: Handles authentication logic
 * - Framer Motion: Adds smooth animations
 * 
 * SECURITY FEATURES:
 * - Password is hidden by default (toggle visibility)
 * - Credentials validated server-side via NextAuth
 * - "Remember me" option extends session duration
 * - Error messages don't reveal if email exists (prevents enumeration)
 * 
 * FORM VALIDATION:
 * - identifier: Required, can be username or email
 * - password: Required
 * - rememberMe: Optional checkbox
 * 
 * ERROR HANDLING:
 * - Network errors: Shows generic error message
 * - Invalid credentials: Shows "Invalid credentials" message
 * - Deactivated account: Shows specific message about account status
 * 
 * CLIENT-SIDE COMPONENT:
 * This component uses "use client" because it needs:
 * - useState for managing component state
 * - useEffect for mounting check
 * - Event handlers for form submission
 * - Browser APIs (router navigation)
 */

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



/**
 * ANIMATION VARIANTS
 * 
 * These define the animation states for Framer Motion.
 * - containerVariants: Controls parent container animations
 * - itemVariants: Controls individual child element animations
 * 
 * Animation Pattern:
 * - Elements start hidden (opacity: 0, moved down 20px)
 * - Animate to visible (opacity: 1, original position)
 * - Stagger children for sequential appearance
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Children appear 0.1s apart
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 }, // Start invisible, 20px down
  visible: {
    opacity: 1,
    y: 0, // End visible, at original position
    transition: {
      duration: 0.5, // Animation takes 0.5 seconds
      ease: "easeOut" // Easing function for smooth motion
    }
  }
}

export default function SignInPage() {
  /**
   * STATE MANAGEMENT
   * 
   * React useState hook manages component state:
   * - showPassword: Toggles password visibility (eye icon)
   * - isLoading: Prevents duplicate submissions and shows loading state
   * - socialLoading: Tracks which social login button is loading (if any)
   * - error: Stores error message to display to user
   * - mounted: Prevents hydration mismatch (Next.js SSR issue)
   */
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Next.js router for programmatic navigation
  const router = useRouter()

  /**
   * REACT HOOK FORM SETUP
   * 
   * useForm hook manages form state, validation, and submission:
   * - register: Registers input fields with the form
   * - handleSubmit: Wraps onSubmit function with validation
   * - formState.errors: Contains validation errors for each field
   * - setValue: Programmatically sets field values
   * - watch: Watches field values for real-time updates
   * 
   * zodResolver: Integrates Zod schema validation with React Hook Form
   * This means validation happens automatically based on signinSchema
   * 
   * IMPORTANT: All hooks must be called before any conditional returns
   * This is a React rule to ensure hooks are called in the same order every render
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SigninForm>({
    resolver: zodResolver(signinSchema), // Use Zod schema for validation
    defaultValues: {
      rememberMe: false // Default "remember me" to unchecked
    }
  })

  // Watch the rememberMe field value for real-time updates
  const rememberMe = watch("rememberMe")

  /**
   * MOUNT CHECK
   * 
   * This useEffect ensures the component is mounted before rendering.
   * WHY? Next.js uses Server-Side Rendering (SSR), which can cause hydration mismatches
   * when client-side code differs from server-rendered HTML.
   * 
   * By checking mounted state, we ensure:
   * - Server renders a loading state
   * - Client renders the full form after mount
   * - Prevents React hydration errors
   */
  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * FORM SUBMISSION HANDLER
   * 
   * This function is called when the user submits the form.
   * It handles the complete authentication flow:
   * 
   * STEP-BY-STEP FLOW:
   * 1. Prevent duplicate submissions (check isLoading)
   * 2. Set loading state to show spinner
   * 3. Clear any previous errors
   * 4. Call NextAuth signIn() function with credentials
   * 5. Handle response:
   *    - If error: Check for specific error cases (deactivated account)
   *    - If success: Redirect to dashboard
   * 6. Always reset loading state in finally block
   * 
   * @param data - Form data validated by Zod schema (SigninForm type)
   */
  const onSubmit = async (data: SigninForm) => {
    // Prevent multiple submissions while request is in progress
    if (isLoading) return
    
    // Set loading state (shows spinner, disables form)
    setIsLoading(true)
    setError(null) // Clear any previous errors
    
    try {
      /**
       * NEXTAUTH SIGN IN
       * 
       * signIn() is a NextAuth.js client-side function that:
       * 1. Sends credentials to /api/auth/[...nextauth]/route.ts
       * 2. NextAuth validates credentials against database
       * 3. If valid, creates a JWT token and session cookie
       * 4. Returns result object with ok/error status
       * 
       * Parameters:
       * - "credentials": The provider name (defined in lib/auth.ts)
       * - identifier: Username or email
       * - password: User's password
       * - redirect: false - We handle redirect manually to show errors
       */
      const result = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false, // Don't auto-redirect, we'll handle it manually
      })

      // Handle authentication errors
      if (result?.error) {
        /**
         * ERROR HANDLING
         * 
         * When signIn() returns an error, we need to determine why:
         * - Invalid credentials (wrong password)
         * - Account not verified (email verification pending)
         * - Account deactivated (admin disabled account)
         * 
         * We check for deactivated accounts specifically to show a helpful message
         */
        try {
          // Check if user exists but account is deactivated
          const checkUserResponse = await fetch('/api/auth/check-user-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: data.identifier })
          })
          
          if (checkUserResponse.ok) {
            const userData = await checkUserResponse.json()
            // If account exists but is inactive, show specific message
            if (userData.exists && !userData.isActive) {
              setError("Your account has been deactivated. Please contact your administrator.")
              return
            }
          }
        } catch (error) {
          // If status check fails, continue with generic error
          console.warn('Failed to check user status:', error)
        }
        
        // Show generic invalid credentials error
        // This prevents revealing whether email exists (security best practice)
        setError(ERROR_MESSAGES.INVALID_CREDENTIALS)
      } else if (result?.ok) {
        /**
         * SUCCESS HANDLING
         * 
         * Authentication successful! Redirect to dashboard.
         * 
         * router.replace() vs router.push():
         * - replace() replaces current history entry (can't go back to signin)
         * - push() adds new history entry (can navigate back)
         * 
         * Using replace() prevents users from going back to signin page after login
         */
        router.replace("/dashboard")
      }
    } catch (error) {
      /**
       * EXCEPTION HANDLING
       * 
       * Catch any unexpected errors (network failures, etc.)
       * handleApiError() formats errors consistently
       */
      const appError = handleApiError(error)
      setError(appError.message)
    } finally {
      // Always reset loading state, even if error occurred
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