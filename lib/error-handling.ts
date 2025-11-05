/**
 * ERROR HANDLING UTILITIES MODULE
 * 
 * Provides standardized error handling across the application.
 * 
 * WHY STANDARDIZED ERRORS?
 * - Consistent error format across the app
 * - Easy to handle errors in UI
 * - Type-safe error handling
 * - Better debugging with error codes
 * 
 * ERROR CLASSES:
 * - AuthError: Authentication/authorization errors
 * - ValidationError: Input validation errors
 * - NetworkError: Network/connection errors
 * 
 * ERROR FORMAT:
 * All errors include:
 * - message: Human-readable error message
 * - code: Machine-readable error code
 * - statusCode: HTTP status code
 * - details: Additional error context (optional)
 * 
 * USAGE:
 * ```typescript
 * import { AuthError, handleApiError } from '@/lib/error-handling'
 * 
 * throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS', 401)
 * const error = handleApiError(caughtError)
 * ```
 */

/**
 * APP ERROR INTERFACE
 * 
 * Standard error format used throughout the application.
 * 
 * PROPERTIES:
 * - message: Human-readable error message (shown to user)
 * - code: Machine-readable error code (for programmatic handling)
 * - statusCode: HTTP status code (for API responses)
 * - details: Additional error context (optional, for debugging)
 * 
 * USAGE:
 * Returned by handleApiError() function.
 * Used in API routes and error handling.
 */
export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

/**
 * AUTHENTICATION ERROR CLASS
 * 
 * Custom error class for authentication/authorization errors.
 * 
 * WHEN TO USE:
 * - Invalid credentials
 * - Account deactivated
 * - Email not verified
 * - Session expired
 * - Unauthorized access
 * 
 * DEFAULT VALUES:
 * - code: 'AUTH_ERROR'
 * - statusCode: 400 (Bad Request)
 * 
 * EXAMPLES:
 * ```typescript
 * throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS', 401)
 * throw new AuthError('Account deactivated', 'ACCOUNT_DEACTIVATED', 403)
 * ```
 * 
 * EXTENDS ERROR:
 * Inherits from JavaScript Error class.
 * Can be caught with try/catch.
 * Shows up in error stack traces.
 */
export class AuthError extends Error {
  code: string
  statusCode: number
  details?: any

  constructor(message: string, code: string = 'AUTH_ERROR', statusCode: number = 400, details?: any) {
    super(message) // Call parent Error constructor
    this.name = 'AuthError' // Error class name
    this.code = code // Machine-readable error code
    this.statusCode = statusCode // HTTP status code
    this.details = details // Additional error context
  }
}

/**
 * VALIDATION ERROR CLASS
 * 
 * Custom error class for input validation errors.
 * 
 * WHEN TO USE:
 * - Invalid form data
 * - Missing required fields
 * - Type mismatches
 * - Format validation failures
 * 
 * DEFAULT VALUES:
 * - code: 'VALIDATION_ERROR'
 * - statusCode: 400 (Bad Request)
 * 
 * EXAMPLES:
 * ```typescript
 * throw new ValidationError('Email is required')
 * throw new ValidationError('Invalid email format', { field: 'email' })
 * ```
 * 
 * DETAILS PROPERTY:
 * Often contains Zod validation errors or field-specific errors.
 * Useful for displaying field-level error messages in forms.
 */
export class ValidationError extends Error {
  code: string
  statusCode: number
  details?: any

  constructor(message: string, details?: any) {
    super(message)
    this.name = 'ValidationError'
    this.code = 'VALIDATION_ERROR'
    this.statusCode = 400 // Bad Request
    this.details = details // Validation error details (e.g., Zod errors)
  }
}

/**
 * NETWORK ERROR CLASS
 * 
 * Custom error class for network/connection errors.
 * 
 * WHEN TO USE:
 * - API request failed
 * - Network timeout
 * - Connection refused
 * - DNS resolution failed
 * 
 * DEFAULT VALUES:
 * - code: 'NETWORK_ERROR'
 * - statusCode: 500 (Internal Server Error)
 * - message: 'Network error occurred'
 * 
 * EXAMPLES:
 * ```typescript
 * throw new NetworkError('Failed to connect to server')
 * throw new NetworkError() // Uses default message
 * ```
 */
export class NetworkError extends Error {
  code: string
  statusCode: number

  constructor(message: string = 'Network error occurred') {
    super(message)
    this.name = 'NetworkError'
    this.code = 'NETWORK_ERROR'
    this.statusCode = 500 // Internal Server Error
  }
}

/**
 * STANDARD ERROR MESSAGES
 * 
 * Centralized error messages used throughout the application.
 * 
 * WHY CENTRALIZED?
 * - Consistent error messages across the app
 * - Easy to update messages in one place
 * - Prevents typos and inconsistencies
 * - Makes i18n (internationalization) easier
 * 
 * USAGE:
 * ```typescript
 * import { ERROR_MESSAGES } from '@/lib/error-handling'
 * 
 * throw new AuthError(ERROR_MESSAGES.INVALID_CREDENTIALS)
 * ```
 * 
 * 'as const' MEANS:
 * TypeScript treats these as literal types, not strings.
 * Provides better type safety and autocomplete.
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid username or password',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact your administrator.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before signing in',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  
  // Network errors
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  SERVER_ERROR: 'An error occurred. Please try again later.',
  
  // Token errors
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  
  // Generic
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
} as const

/**
 * HANDLE API ERROR FUNCTION
 * 
 * Converts various error types into standardized AppError format.
 * 
 * WHAT IT DOES:
 * - Checks error type (AuthError, ValidationError, NetworkError, etc.)
 * - Extracts error information
 * - Returns standardized AppError object
 * 
 * ERROR TYPE HANDLING:
 * 
 * 1. Custom Errors (AuthError, ValidationError):
 *    - Extracts message, code, statusCode, details
 *    - Returns as-is (already standardized)
 * 
 * 2. NetworkError:
 *    - Extracts message, code, statusCode
 *    - Returns standardized format
 * 
 * 3. HTTP Error Response (error.response):
 *    - Axios/fetch error response
 *    - Extracts error message from response.data
 *    - Uses HTTP status code
 * 
 * 4. Network Request Error (error.request):
 *    - Request made but no response received
 *    - Returns generic network error
 * 
 * 5. Generic Error:
 *    - Unknown error type
 *    - Returns generic error message
 * 
 * EXAMPLES:
 * ```typescript
 * try {
 *   await apiCall()
 * } catch (error) {
 *   const appError = handleApiError(error)
 *   console.log(appError.message) // Safe error message
 *   console.log(appError.code) // Error code
 *   console.log(appError.statusCode) // HTTP status
 * }
 * ```
 * 
 * @param error - Any error object (Error, AuthError, axios error, etc.)
 * @returns Standardized AppError object
 */
export function handleApiError(error: any): AppError {
  // Handle custom error classes
  if (error instanceof AuthError || error instanceof ValidationError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    }
  }

  // Handle network errors
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }

  // Handle HTTP error responses (axios/fetch)
  if (error?.response) {
    // HTTP error response
    // error.response is from axios or similar HTTP client
    return {
      message: error.response.data?.error || ERROR_MESSAGES.SERVER_ERROR,
      code: 'HTTP_ERROR',
      statusCode: error.response.status,
      details: error.response.data
    }
  }

  // Handle network request errors (no response received)
  if (error?.request) {
    // Network error (request made but no response)
    // Usually means server is down or network issue
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      statusCode: 500
    }
  }

  // Handle generic errors (unknown type)
  // Fallback for any other error type
  return {
    message: error?.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  }
}

/**
 * GET ERROR MESSAGE HELPER
 * 
 * Extracts error message from various error formats.
 * 
 * WHAT IT DOES:
 * - Handles string errors (simple case)
 * - Handles Error objects (error.message)
 * - Handles API error responses (error.error)
 * - Returns fallback message if none found
 * 
 * USE CASE:
 * When you need just the error message string, not full error object.
 * 
 * EXAMPLES:
 * ```typescript
 * const message = getErrorMessage(error)
 * setError(message) // Display to user
 * ```
 * 
 * @param error - Any error format (string, Error, API error, etc.)
 * @returns Error message string
 */
export function getErrorMessage(error: any): string {
  // Handle string errors (simplest case)
  if (typeof error === 'string') {
    return error
  }

  // Handle Error objects (error.message)
  if (error?.message) {
    return error.message
  }

  // Handle API error responses (error.error)
  if (error?.error) {
    return error.error
  }

  // Fallback to generic error message
  return ERROR_MESSAGES.SOMETHING_WENT_WRONG
}

/**
 * GET FIELD ERROR HELPER
 * 
 * Extracts error message for a specific form field.
 * 
 * USE CASE:
 * When displaying field-level errors in forms.
 * 
 * EXAMPLES:
 * ```typescript
 * const emailError = getFieldError(errors, 'email')
 * if (emailError) {
 *   return <div className="error">{emailError}</div>
 * }
 * ```
 * 
 * ERROR OBJECT STRUCTURE:
 * Errors object typically comes from React Hook Form:
 * ```typescript
 * {
 *   email: { message: 'Invalid email' },
 *   password: { message: 'Password required' }
 * }
 * ```
 * 
 * @param errors - Errors object (from React Hook Form or similar)
 * @param fieldName - Name of field to get error for
 * @returns Error message string or undefined if no error
 */
export function getFieldError(errors: any, fieldName: string): string | undefined {
  const error = errors[fieldName]
  if (!error) return undefined // No error for this field
  
  // Return error message or default required field message
  return error.message || ERROR_MESSAGES.REQUIRED_FIELD
}
