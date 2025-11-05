/**
 * USER VALIDATION SCHEMAS MODULE
 * 
 * Defines Zod validation schemas for user management operations.
 * 
 * WHAT IT DOES:
 * - Validates user creation
 * - Validates user updates
 * - Validates password changes
 * - Validates query parameters for listing users
 * 
 * BENEFITS:
 * - Type-safe validation
 * - Consistent validation across client and server
 * - Clear error messages
 * - Prevents invalid data
 * 
 * SECURITY FEATURES:
 * - Username format restrictions (alphanumeric + underscore)
 * - Email format validation
 * - Password complexity requirements
 * - Password confirmation matching
 * - CUID validation for IDs
 * 
 * USAGE:
 * ```typescript
 * import { createUserSchema, updateUserSchema } from '@/lib/validations/users'
 * 
 * const result = createUserSchema.parse(data)
 * ```
 */

import { z } from "zod"

/**
 * USER SCHEMA (BASE)
 * 
 * Base schema for user data.
 * Used as foundation for create and update schemas.
 * 
 * VALIDATION RULES:
 * - username: Required, 3-30 chars, alphanumeric + underscore only
 * - email: Required, valid email format, max 255 chars
 * - firstName: Optional, 1-50 chars
 * - lastName: Optional, 1-50 chars
 * - roleId: Optional, valid CUID or null/empty string
 * - isActive: Boolean, defaults to true
 * 
 * USERNAME RULES:
 * - Only letters, numbers, and underscores allowed
 * - Prevents spaces and special characters
 * - Examples: "johndoe", "user123", "admin_user"
 * 
 * ROLE ID HANDLING:
 * - Accepts CUID, empty string, null, or undefined
 * - Transforms empty string/undefined to null
 * - Allows null (no role assigned)
 */
export const userSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .optional(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  roleId: z.union([
    z.string().cuid(),
    z.literal(''),
    z.null(),
    z.undefined()
  ])
    .optional()
    .nullable()
    .transform(val => {
      // Transform empty string or undefined to null
      if (val === '' || val === undefined) return null
      return val
    }),
  isActive: z.boolean().default(true),
})

/**
 * CREATE USER SCHEMA
 * 
 * Validates data when creating a new user.
 * 
 * EXTENDS BASE SCHEMA:
 * - Adds password field (required, complexity requirements)
 * - Adds confirmPassword field (required, must match password)
 * - Uses refine() to ensure passwords match
 * 
 * PASSWORD REQUIREMENTS:
 * - Minimum 8 characters
 * - Maximum 100 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - Special characters allowed but not required
 * 
 * PASSWORD CONFIRMATION:
 * - Must match password exactly
 * - Error message shown on confirmPassword field
 * 
 * USE CASE:
 * Validates form data before creating user account.
 */
export const createUserSchema = userSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error appears on confirmPassword field
})

/**
 * UPDATE USER SCHEMA
 * 
 * Validates data when updating an existing user.
 * 
 * DIFFERENCES FROM CREATE:
 * - All fields optional (using partial())
 * - Includes id field (required)
 * - Password is optional (only validate if provided)
 * - Password confirmation only required if password is provided
 * 
 * PASSWORD VALIDATION:
 * - Only validates password if it's provided
 * - If password provided, confirmPassword is required
 * - If password not provided, confirmPassword is ignored
 * - Uses refine() to ensure passwords match (if both provided)
 * 
 * USE CASE:
 * Validates form data before updating user account.
 */
export const updateUserSchema = userSchema.partial().extend({
  id: z.string().cuid("Invalid user ID format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number")
    .optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  /**
   * PASSWORD MATCHING LOGIC
   * 
   * Ensures password and confirmPassword match if password is provided.
   * 
   * RULES:
   * - If password provided but confirmPassword missing → invalid
   * - If confirmPassword provided but password missing → invalid
   * - If both provided → must match
   * - If neither provided → valid (password not being changed)
   */
  if (data.password && !data.confirmPassword) return false
  if (!data.password && data.confirmPassword) return false
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * USER ID SCHEMA
 * 
 * Validates user ID parameter.
 * 
 * VALIDATION RULES:
 * - id: Required, valid CUID format
 * 
 * USE CASE:
 * Validates user ID in API routes (e.g., GET /api/users/:id).
 */
export const userIdSchema = z.object({
  id: z.string().cuid("Invalid user ID format"),
})

/**
 * CHANGE PASSWORD SCHEMA
 * 
 * Validates data when user changes their password.
 * 
 * VALIDATION RULES:
 * - currentPassword: Required, non-empty
 * - newPassword: Required, meets complexity requirements
 * - confirmPassword: Required, must match newPassword
 * 
 * PASSWORD REQUIREMENTS:
 * Same as createUserSchema password requirements.
 * 
 * USE CASE:
 * Validates form data for password change operation.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * USER QUERY SCHEMA
 * 
 * Validates query parameters for listing/filtering users.
 * 
 * VALIDATION RULES:
 * - page: Coerced to number, min 1, defaults to 1
 * - limit: Coerced to number, min 1, max 100, defaults to 10
 * - search: Optional string (nullish transformed to undefined)
 * - roleId: Optional CUID (nullish transformed to undefined)
 * - isActive: Optional enum ('true'/'false'), transformed to undefined
 * - sortBy: Enum, defaults to 'createdAt'
 * - sortOrder: Enum ('asc'/'desc'), defaults to 'desc'
 * 
 * COERCION:
 * Uses z.coerce to automatically convert string query params to numbers.
 * 
 * TRANSFORMS:
 * - Converts null/undefined to undefined for optional fields
 * - Converts 'true'/'false' strings to boolean logic
 * 
 * SORT OPTIONS:
 * - username, email, firstName, lastName, createdAt, updatedAt
 * 
 * USE CASE:
 * Validates URL query parameters in API routes.
 */
export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().nullish().transform(val => val || undefined),
  roleId: z.string().cuid().nullish().transform(val => val || undefined),
  isActive: z.enum(['true', 'false']).nullish().transform(val => val || undefined),
  sortBy: z.enum(['username', 'email', 'firstName', 'lastName', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * TYPE EXPORTS
 * 
 * Exports TypeScript types inferred from Zod schemas.
 * These types can be used throughout the application.
 * 
 * TYPES:
 * - User: Base user type
 * - CreateUser: Type for creating users
 * - UpdateUser: Type for updating users
 * - UserId: Type for user ID parameter
 * - ChangePassword: Type for password change operation
 * - UserQuery: Type for user query parameters
 */
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type UserId = z.infer<typeof userIdSchema>
export type ChangePassword = z.infer<typeof changePasswordSchema>
export type UserQuery = z.infer<typeof userQuerySchema>
