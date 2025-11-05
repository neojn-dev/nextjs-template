/**
 * ROLE VALIDATION SCHEMAS MODULE
 * 
 * Defines Zod validation schemas for role management operations.
 * 
 * WHAT IT DOES:
 * - Validates role creation
 * - Validates role updates
 * - Validates query parameters for listing roles
 * 
 * BENEFITS:
 * - Type-safe validation
 * - Consistent validation across client and server
 * - Clear error messages
 * - Prevents invalid data
 * 
 * SECURITY FEATURES:
 * - Role name format restrictions
 * - Description length limits
 * - CUID validation for IDs
 * 
 * USAGE:
 * ```typescript
 * import { createRoleSchema, updateRoleSchema } from '@/lib/validations/roles'
 * 
 * const result = createRoleSchema.parse(data)
 * ```
 */

import { z } from "zod"

/**
 * ROLE SCHEMA (BASE)
 * 
 * Base schema for role data.
 * Used as foundation for create and update schemas.
 * 
 * VALIDATION RULES:
 * - name: Required, 1-50 chars, alphanumeric + spaces/hyphens/underscores
 * - description: Optional, max 255 chars
 * - permissions: Optional string
 * - isActive: Boolean, defaults to true
 * 
 * ROLE NAME RULES:
 * - Only letters, numbers, spaces, hyphens, and underscores allowed
 * - Prevents special characters that could cause issues
 * - Examples: "Admin", "Super User", "Project-Manager"
 */
export const roleSchema = z.object({
  name: z.string()
    .min(1, "Role name is required")
    .max(50, "Role name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Role name can only contain letters, numbers, spaces, hyphens, and underscores"),
  description: z.string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
  permissions: z.string().optional(),
  isActive: z.boolean().default(true),
})

/**
 * CREATE ROLE SCHEMA
 * 
 * Validates data when creating a new role.
 * 
 * SAME AS BASE SCHEMA:
 * Uses base roleSchema directly (no password fields like users).
 * 
 * USE CASE:
 * Validates form data before creating role.
 */
export const createRoleSchema = roleSchema

/**
 * UPDATE ROLE SCHEMA
 * 
 * Validates data when updating an existing role.
 * 
 * DIFFERENCES FROM CREATE:
 * - All fields optional (using partial())
 * - Includes id field (required)
 * 
 * USE CASE:
 * Validates form data before updating role.
 */
export const updateRoleSchema = roleSchema.partial().extend({
  id: z.string().cuid("Invalid role ID format"),
})

/**
 * ROLE ID SCHEMA
 * 
 * Validates role ID parameter.
 * 
 * VALIDATION RULES:
 * - id: Required, valid CUID format
 * 
 * USE CASE:
 * Validates role ID in API routes (e.g., GET /api/roles/:id).
 */
export const roleIdSchema = z.object({
  id: z.string().cuid("Invalid role ID format"),
})

/**
 * ROLE QUERY SCHEMA
 * 
 * Validates query parameters for listing/filtering roles.
 * 
 * VALIDATION RULES:
 * - page: Coerced to number, min 1, defaults to 1
 * - limit: Coerced to number, min 1, max 100, defaults to 10
 * - search: Optional string (nullish transformed to undefined)
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
 * USE CASE:
 * Validates URL query parameters in API routes.
 */
export const roleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().nullish().transform(val => val || undefined),
  isActive: z.enum(['true', 'false']).nullish().transform(val => val || undefined),
  sortBy: z.enum(['name', 'description', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * TYPE EXPORTS
 * 
 * Exports TypeScript types inferred from Zod schemas.
 * These types can be used throughout the application.
 */
export type Role = z.infer<typeof roleSchema>
export type CreateRole = z.infer<typeof createRoleSchema>
export type UpdateRole = z.infer<typeof updateRoleSchema>
export type RoleId = z.infer<typeof roleIdSchema>
export type RoleQuery = z.infer<typeof roleQuerySchema>
