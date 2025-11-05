/**
 * UTILITY FUNCTIONS MODULE
 * 
 * This module provides common utility functions used throughout the application.
 * These are helper functions that don't belong to any specific domain.
 * 
 * WHY UTILITIES?
 * - Reusable code used in multiple places
 * - Reduces code duplication
 * - Consistent behavior across the app
 * - Easier to test and maintain
 * 
 * CATEGORIES:
 * - CSS/Class utilities (cn)
 * - Date formatting (formatDate, formatDateTime)
 * - File utilities (formatFileSize)
 * - String generation (generateRandomString, generateSecurePassword)
 * - Async utilities (sleep)
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * CN (CLASS NAME) UTILITY FUNCTION
 * 
 * Combines clsx and tailwind-merge for optimal className handling.
 * 
 * WHAT IT DOES:
 * - clsx: Conditionally joins classNames together
 * - twMerge: Intelligently merges Tailwind CSS classes, resolving conflicts
 * 
 * WHY BOTH?
 * - clsx handles conditional classes (true/false, null, undefined)
 * - tailwind-merge resolves Tailwind class conflicts (e.g., "p-4 p-6" → "p-6")
 * 
 * EXAMPLES:
 * ```typescript
 * cn("text-red-500", isActive && "bg-blue-500") // Conditional classes
 * cn("p-4", "p-6") // Resolves to "p-6" (last wins)
 * cn("text-red-500 bg-blue-500", "text-blue-500") // Resolves to "bg-blue-500 text-blue-500"
 * ```
 * 
 * @param inputs - Class names or objects with boolean values
 * @returns Merged className string
 */
export function cn(...inputs: ClassValue[]) {
  // clsx combines classes, twMerge resolves Tailwind conflicts
  return twMerge(clsx(inputs))
}

/**
 * FORMAT DATE FUNCTION
 * 
 * Formats a date into a human-readable string.
 * 
 * FORMAT: "Jan 15, 2024"
 * 
 * WHAT IT DOES:
 * - Handles null/undefined dates gracefully
 * - Converts string dates to Date objects
 * - Uses Intl.DateTimeFormat for locale-aware formatting
 * 
 * EXAMPLES:
 * ```typescript
 * formatDate(new Date()) // "Jan 15, 2024"
 * formatDate("2024-01-15") // "Jan 15, 2024"
 * formatDate(null) // "N/A"
 * ```
 * 
 * @param date - Date object, date string, or null/undefined
 * @returns Formatted date string or "N/A"
 */
export function formatDate(date: Date | string | null | undefined): string {
  // Handle null/undefined dates
  if (!date) return "N/A"
  
  // Use Intl.DateTimeFormat for locale-aware formatting
  // Locale: "en-US" (English, United States)
  // Options: year (numeric), month (short), day (numeric)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", // 2024
    month: "short", // Jan, Feb, Mar, etc.
    day: "numeric", // 1, 2, 3, etc.
  }).format(new Date(date)) // Convert to Date object if string
}

/**
 * FORMAT DATE TIME FUNCTION
 * 
 * Formats a date and time into a human-readable string.
 * 
 * FORMAT: "Jan 15, 2024, 02:30 PM"
 * 
 * DIFFERENCE FROM formatDate:
 * - Includes time (hour and minute)
 * - Uses 12-hour format with AM/PM
 * 
 * EXAMPLES:
 * ```typescript
 * formatDateTime(new Date()) // "Jan 15, 2024, 02:30 PM"
 * formatDateTime("2024-01-15T14:30:00") // "Jan 15, 2024, 02:30 PM"
 * formatDateTime(null) // "N/A"
 * ```
 * 
 * @param date - Date object, date string, or null/undefined
 * @returns Formatted date and time string or "N/A"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  
  // Same as formatDate, but includes time
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit", // 02, 03, etc. (12-hour format)
    minute: "2-digit", // 30, 45, etc.
  }).format(new Date(date))
}

/**
 * FORMAT FILE SIZE FUNCTION
 * 
 * Converts bytes to human-readable file size.
 * 
 * HOW IT WORKS:
 * 1. Calculates which unit to use (Bytes, KB, MB, GB)
 * 2. Divides bytes by appropriate power of 1024
 * 3. Rounds to 2 decimal places
 * 4. Returns formatted string with unit
 * 
 * EXAMPLES:
 * ```typescript
 * formatFileSize(0) // "0 Bytes"
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * formatFileSize(1536) // "1.5 KB"
 * ```
 * 
 * MATH EXPLANATION:
 * - Math.log(bytes) / Math.log(k) calculates which power of 1024
 * - Math.floor() rounds down to get unit index
 * - Math.pow(k, i) calculates divisor (1024^0, 1024^1, 1024^2, etc.)
 * 
 * @param bytes - File size in bytes (number)
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024 // Base for binary units (KB, MB, GB)
  const sizes = ["Bytes", "KB", "MB", "GB"] // Size units
  
  // Calculate which unit to use
  // log(1024) = 1, log(1048576) = 2, log(1073741824) = 3
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  // Divide by appropriate power of 1024 and format to 2 decimals
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * GENERATE RANDOM STRING FUNCTION
 * 
 * Generates a cryptographically random string of specified length.
 * 
 * USE CASES:
 * - Verification tokens
 * - Password reset tokens
 * - Unique identifiers
 * - Session IDs
 * 
 * CHARACTER SET:
 * - Uppercase letters (A-Z)
 * - Lowercase letters (a-z)
 * - Numbers (0-9)
 * - Total: 62 characters
 * 
 * EXAMPLES:
 * ```typescript
 * generateRandomString(32) // "aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z"
 * generateRandomString(16) // "aB3dE5fG7hI9jK1"
 * ```
 * 
 * SECURITY NOTE:
 * Uses Math.random() which is cryptographically weak.
 * For security-critical tokens, use crypto.randomBytes() instead.
 * 
 * @param length - Length of random string (default: 32)
 * @returns Random string of specified length
 */
export function generateRandomString(length: number = 32): string {
  // Character set: all alphanumeric characters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  
  // Generate random character for each position
  for (let i = 0; i < length; i++) {
    // Math.random() returns 0-1, multiply by chars.length to get 0-61
    // Math.floor() rounds down to integer
    // chars.charAt() gets character at that index
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * SLEEP FUNCTION
 * 
 * Creates a delay/pause in async code execution.
 * 
 * USE CASES:
 * - Rate limiting API calls
 * - Adding delays in animations
 * - Testing async behavior
 * - Simulating network latency
 * 
 * HOW IT WORKS:
 * - Creates a Promise that resolves after specified milliseconds
 * - Use with await to pause execution
 * 
 * EXAMPLES:
 * ```typescript
 * await sleep(1000) // Wait 1 second
 * await sleep(500) // Wait 0.5 seconds
 * ```
 * 
 * ALTERNATIVE:
 * ```typescript
 * setTimeout(() => {}, 1000) // Doesn't work with async/await
 * ```
 * 
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  // Create Promise that resolves after ms milliseconds
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * GENERATE SECURE PASSWORD FUNCTION
 * 
 * Generates a secure password that meets all security requirements.
 * 
 * SECURITY REQUIREMENTS:
 * - Minimum 12 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 * 
 * HOW IT WORKS:
 * 1. Ensures at least one character from each category
 * 2. Fills remaining length with random characters
 * 3. Shuffles characters to avoid predictable patterns
 * 
 * WHY SHUFFLE?
 * - Without shuffle: "aA1!xxxx" (predictable pattern)
 * - With shuffle: "x!aAx1x" (random distribution)
 * 
 * EXAMPLES:
 * ```typescript
 * generateSecurePassword() // "K#mP9vL2@xR!"
 * generateSecurePassword() // "p@T3qW7$nM9"
 * ```
 * 
 * USE CASE:
 * When admin creates a user account, this generates a temporary password
 * that the user must change on first login.
 * 
 * @returns Secure password string (12 characters)
 */
export function generateSecurePassword(): string {
  // Define character categories
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  /**
   * STEP 1: Ensure at least one character from each category
   * 
   * This guarantees password meets all requirements.
   * Randomly selects one character from each category.
   */
  let password = ''
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  /**
   * STEP 2: Fill remaining length with random characters
   * 
   * Password needs 12 characters total.
   * We have 4 so far, need 8 more.
   * Use all character categories combined for variety.
   */
  const allChars = lowercase + uppercase + numbers + symbols
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  /**
   * STEP 3: Shuffle characters to avoid predictable patterns
   * 
   * Without shuffle: "aA1!xxxx" (pattern: lowercase, uppercase, number, symbol, rest)
   * With shuffle: "x!aAx1x" (random distribution)
   * 
   * How shuffle works:
   * - split('') converts string to array
   * - sort(() => Math.random() - 0.5) randomly sorts array
   * - join('') converts array back to string
   */
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
