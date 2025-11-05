/**
 * EMAIL VERIFICATION PAGE COMPONENT
 * 
 * This page verifies a user's email address after registration.
 * 
 * FLOW OVERVIEW:
 * 1. User clicks verification link in email
 * 2. Link contains token as query parameter (?token=abc123)
 * 3. Page loads and extracts token from URL
 * 4. Sends token to /api/auth/verify endpoint
 * 5. API validates token and marks email as verified
 * 6. Shows success message and redirects to signin
 * 
 * STATES:
 * - Loading: Verifying token (shows spinner)
 * - Success: Email verified successfully (shows success message)
 * - Error: Token invalid/expired (shows error message)
 * 
 * SECURITY FEATURES:
 * - Token is single-use (deleted after verification)
 * - Token expires after 24 hours
 * - Token validation happens server-side
 * - Prevents multiple verification attempts (useRef guard)
 * 
 * SUSPENSE WRAPPER:
 * Uses Suspense to handle async searchParams reading.
 * Next.js 13+ requires Suspense for useSearchParams in some cases.
 * 
 * CLIENT-SIDE COMPONENT:
 * Uses "use client" because it needs:
 * - useState for component state
 * - useEffect for side effects
 * - useSearchParams for URL parameters
 * - Router for navigation
 */

"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  ArrowRight, 
  AlertCircle,
  Loader2
} from "lucide-react"

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

/**
 * VERIFY PAGE CONTENT COMPONENT
 * 
 * Main component that handles email verification logic.
 * Separated from wrapper to use Suspense properly.
 */
function VerifyPageContent() {
  /**
   * STATE MANAGEMENT
   * 
   * - isLoading: True while verifying token (shows loading spinner)
   * - isVerified: True when verification succeeds (shows success message)
   * - error: Error message if verification fails (shows error message)
   */
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  /**
   * PREVENT DUPLICATE VERIFICATION ATTEMPTS
   * 
   * useRef stores a value that persists across renders but doesn't trigger re-renders.
   * Used here to prevent multiple verification API calls if component re-renders.
   * 
   * WHY useRef INSTEAD OF useState?
   * - Doesn't trigger re-render when changed
   * - Persists across renders
   * - Perfect for "did we already do this?" checks
   */
  const hasAttemptedVerification = useRef(false)
  
  // Get token from URL query parameters
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") // Extract token from ?token=abc123

  /**
   * EMAIL VERIFICATION EFFECT
   * 
   * Runs once when component mounts (or when token changes).
   * 
   * STEP-BY-STEP FLOW:
   * 1. Check if token exists in URL
   * 2. Prevent duplicate attempts (useRef guard)
   * 3. Call verification API endpoint
   * 4. Handle response:
   *    - Success: Set isVerified to true
   *    - Error: Set error message
   * 5. Set loading to false
   * 
   * WHY useEffect?
   * - Runs after component mounts
   * - Can perform async operations
   * - Runs automatically (no user action needed)
   */
  useEffect(() => {
    const verifyEmail = async () => {
      // Validate token exists
      if (!token) {
        setError("No verification token provided")
        setIsLoading(false)
        return
      }

      /**
       * PREVENT DUPLICATE REQUESTS
       * 
       * Check if we've already attempted verification.
       * Prevents double API calls if component re-renders.
       */
      if (hasAttemptedVerification.current) {
        return // Already verifying, don't do it again
      }

      // Mark as attempted
      hasAttemptedVerification.current = true

      try {
        /**
         * VERIFICATION API CALL
         * 
         * Send token to server for validation.
         * Server checks:
         * - Token exists in database
         * - Token hasn't expired (24 hours)
         * - Token hasn't been used already
         * 
         * If valid:
         * - Marks user email as verified
         * - Deletes verification token
         * - Activates user account
         */
        const response = await fetch(`/api/auth/verify?token=${token}`, {
          method: 'GET',
        })

        if (response.ok) {
          // Verification successful!
          const data = await response.json()
          setError(null) // Clear any previous errors
          setIsVerified(true) // Show success state
        } else {
          // Verification failed
          const errorData = await response.json()
          setError(errorData.error || "Verification failed")
        }
      } catch (err) {
        // Network error or unexpected error
        console.error("Verification fetch error:", err)
        setError("Network error occurred during verification")
      } finally {
        // Always set loading to false, regardless of success/failure
        setIsLoading(false)
      }
    }

    // Run verification when component mounts
    verifyEmail()
  }, [token]) // Re-run if token changes (shouldn't happen, but defensive)


  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 py-6"><div className="w-full">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Verifying Your Email
              </h1>
              <p className="text-xl text-gray-600">
                Please wait while we verify your email address...
              </p>
            </motion.div>
          </div>
        </div></div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 py-6"><div className="w-full">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              {/* Error Icon */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <AlertCircle className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Verification Failed
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {error}
                </p>
                <p className="text-gray-500 max-w-md mx-auto">
                  The verification link may be invalid, expired, or already used.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <Button
                  asChild
                  className="w-full md:w-auto h-12 bg-gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  <Link href="/signin">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    asChild
                    className="h-12 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-200"
                  >
                    <Link href="/signup">
                      Create New Account
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    asChild
                    className="h-12 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-200"
                  >
                    <Link href="/">
                      Go to Homepage
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div></div>
    )
  }

  if (isVerified) {
    return (
      <div className="flex items-center justify-center p-4 py-6"><div className="w-full">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Email Verified Successfully!
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Your email address has been verified and your account is now active.
                </p>
                <p className="text-gray-500 max-w-md mx-auto">
                  You can now sign in to your account.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <Button
                  asChild
                  className="w-full md:w-auto h-12 bg-gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
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
                    className="h-12 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-200"
                  >
                    <Link href="/">
                      Go to Homepage
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    asChild
                    className="h-12 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-200"
                  >
                    <Link href="/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                </div>
              </motion.div>


            </motion.div>
          </div>
        </div></div>
    )
  }

  // This should never be reached, but just in case
  return null
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-4 py-6"><div className="w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            </div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div></div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
