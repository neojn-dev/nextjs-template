/**
 * ERROR BOUNDARY COMPONENT
 * 
 * React Error Boundary component that catches JavaScript errors in child components.
 * 
 * WHAT IT DOES:
 * - Catches errors in component tree
 * - Prevents entire app from crashing
 * - Displays fallback UI when error occurs
 * - Logs errors for debugging (development only)
 * - Provides recovery mechanism (Try Again button)
 * 
 * ERROR BOUNDARY CONCEPT:
 * Error boundaries catch errors during rendering, in lifecycle methods,
 * and in constructors of the whole tree below them.
 * 
 * WHAT IT CATCHES:
 * - Errors in render methods
 * - Errors in lifecycle methods
 * - Errors in constructors
 * 
 * WHAT IT DOESN'T CATCH:
 * - Errors in event handlers (use try/catch)
 * - Errors in async code (use try/catch)
 * - Errors during server-side rendering
 * - Errors in error boundary itself
 * 
 * CLASS COMPONENT:
 * Error boundaries must be class components (not function components).
 * React doesn't have hooks for error boundaries yet.
 * 
 * USAGE:
 * ```tsx
 * import { ErrorBoundary } from '@/components/error-boundary'
 * 
 * <ErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 * 
 * OR with default fallback:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

"use client"

import { Component, ReactNode } from "react"

/**
 * ERROR BOUNDARY PROPS INTERFACE
 * 
 * PROPERTIES:
 * - children: React nodes to wrap (can throw errors)
 * - fallback: Optional custom fallback UI (rendered when error occurs)
 */
interface Props {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * ERROR BOUNDARY STATE INTERFACE
 * 
 * PROPERTIES:
 * - hasError: Boolean indicating if error occurred
 * - error: Optional Error object (for debugging)
 */
interface State {
  hasError: boolean
  error?: Error
}

/**
 * ERROR BOUNDARY COMPONENT
 * 
 * Class component that implements React Error Boundary pattern.
 * 
 * LIFECYCLE METHODS:
 * - constructor: Initialize state
 * - getDerivedStateFromError: Update state when error occurs
 * - componentDidCatch: Log error (development only)
 * - render: Render children or fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  /**
   * CONSTRUCTOR
   * 
   * Initializes component state.
   * Sets hasError to false initially.
   */
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  /**
   * GET DERIVED STATE FROM ERROR
   * 
   * Static lifecycle method called when error occurs.
   * 
   * WHAT IT DOES:
   * - Updates state to trigger re-render
   * - Shows fallback UI instead of error
   * - Stores error for debugging
   * 
   * @param error - The error that was thrown
   * @returns New state object
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  /**
   * COMPONENT DID CATCH
   * 
   * Lifecycle method called after error is caught.
   * 
   * WHAT IT DOES:
   * - Logs error to console (development only)
   * - Can be used for error reporting services
   * 
   * SECURITY:
   * Only logs in development mode.
   * Doesn't expose errors in production.
   * 
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information
   */
  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  /**
   * RENDER METHOD
   * 
   * Renders children or fallback UI based on error state.
   * 
   * LOGIC:
   * 1. If error occurred:
   *    - Check if custom fallback provided
   *    - Render custom fallback or default error UI
   * 2. If no error:
   *    - Render children normally
   * 
   * DEFAULT FALLBACK UI:
   * - Error icon (gradient background)
   * - Error message
   * - Try Again button (reloads page)
   */
  render() {
    if (this.state.hasError) {
      /**
       * ERROR STATE: RENDER FALLBACK UI
       * 
       * If custom fallback provided, use it.
       * Otherwise, use default error UI.
       */
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      /**
       * DEFAULT FALLBACK UI
       * 
       * Provides user-friendly error message and recovery option.
       * 
       * STRUCTURE:
       * - Error icon (visual indicator)
       * - Error heading
       * - Error description
       * - Try Again button (reloads page)
       */
      // Default fallback UI
      return (
        <div className="flex h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Error Message */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We encountered an unexpected error.</p>
            
            {/* Try Again Button */}
            <button
              onClick={() => {
                /**
                 * TRY AGAIN HANDLER
                 * 
                 * Resets error state and reloads page.
                 * 
                 * WHAT IT DOES:
                 * 1. Resets hasError state to false
                 * 2. Reloads entire page
                 * 
                 * WHY RELOAD?
                 * Ensures clean state after error.
                 * Simpler than trying to recover component state.
                 */
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    /**
     * NORMAL STATE: RENDER CHILDREN
     * 
     * No error occurred, render children normally.
     */
    return this.props.children
  }
}
