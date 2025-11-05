/**
 * TRANSFER REQUEST VALIDATION SCHEMAS MODULE
 * 
 * Defines Zod validation schemas for transfer request operations.
 * 
 * WHAT IT DOES:
 * - Validates transfer request creation
 * - Validates transfer request updates
 * - Validates workflow actions (approve, reject, request changes)
 * - Validates query parameters for listing requests
 * 
 * BENEFITS:
 * - Type-safe validation
 * - Consistent validation across client and server
 * - Clear error messages
 * - Prevents invalid data
 * 
 * USAGE:
 * ```typescript
 * import { createTransferRequestSchema } from '@/lib/validations/transfer-requests'
 * 
 * const result = createTransferRequestSchema.parse(data)
 * ```
 */

import { z } from "zod"

/**
 * CREATE TRANSFER REQUEST SCHEMA
 * 
 * Validates data when creating a new transfer request.
 * 
 * VALIDATION RULES:
 * - title: Required, 3-200 characters
 * - fromLocation: Required, 1-200 characters
 * - toLocation: Required, 1-200 characters
 * - purpose: Optional, max 2000 characters
 * - supervisorId: Optional, valid CUID format
 * - attachmentsIds: Optional array of CUIDs, max 10 attachments
 * 
 * USE CASE:
 * Validates form data before creating transfer request.
 */
export const createTransferRequestSchema = z.object({
  title: z.string().min(3).max(200),
  fromLocation: z.string().min(1).max(200),
  toLocation: z.string().min(1).max(200),
  purpose: z.string().max(2000).optional(),
  supervisorId: z.string().cuid().optional().nullable(),
  // Prefer upload IDs for attachment linking
  attachmentsIds: z.array(z.string().cuid()).max(10).optional(),
  itemsJson: z.string().optional(),
})

/**
 * LIST TRANSFER REQUESTS QUERY SCHEMA
 * 
 * Validates query parameters for listing/filtering transfer requests.
 * 
 * VALIDATION RULES:
 * - tab: Enum, defaults to "all" (all/new/completed)
 * - page: Coerced to number, min 1, defaults to 1
 * - limit: Coerced to number, min 1, max 100, defaults to 10
 * - search: Optional string
 * - status: Optional string
 * 
 * COERCION:
 * Uses z.coerce to automatically convert string query params to numbers.
 * 
 * USE CASE:
 * Validates URL query parameters in API routes.
 */
export const listTransferRequestsQuery = z.object({
  tab: z.enum(["all", "new", "completed"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
})

/**
 * REQUEST CHANGES SCHEMA
 * 
 * Validates data when requesting changes to a transfer request.
 * 
 * VALIDATION RULES:
 * - comment: Required, 3-2000 characters
 * 
 * USE CASE:
 * Validates supervisor/manager comment when requesting changes.
 */
export const requestChangesSchema = z.object({
  comment: z.string().min(3).max(2000)
})

/**
 * APPROVE SCHEMA
 * 
 * Validates data when approving a transfer request.
 * 
 * VALIDATION RULES:
 * - comment: Optional, max 2000 characters
 * - managerId: Optional, valid CUID format (required when supervisor approves)
 * 
 * USE CASE:
 * Validates approval action (comment is optional).
 * When supervisor approves, managerId should be provided to assign a manager.
 */
export const approveSchema = z.object({
  comment: z.string().max(2000).optional(),
  managerId: z.string().cuid().optional()
})

/**
 * REJECT SCHEMA
 * 
 * Validates data when rejecting a transfer request.
 * 
 * VALIDATION RULES:
 * - comment: Required, 3-2000 characters
 * 
 * USE CASE:
 * Validates rejection action (comment is required).
 * 
 * WHY REQUIRED?
 * Provides feedback to requester about why request was rejected.
 */
export const rejectSchema = z.object({
  comment: z.string().min(3).max(2000)
})

/**
 * ASSIGN MANAGER SCHEMA
 * 
 * Validates data when assigning a manager to a transfer request.
 * 
 * VALIDATION RULES:
 * - managerId: Required, valid CUID format
 * 
 * USE CASE:
 * Validates manager assignment action.
 */
export const assignManagerSchema = z.object({
  managerId: z.string().cuid()
})

/**
 * RESUBMIT TRANSFER REQUEST SCHEMA
 * 
 * Validates data when resubmitting a transfer request after changes.
 * 
 * VALIDATION RULES:
 * - title: Required, 3-200 characters
 * - fromLocation: Required, 1-200 characters
 * - toLocation: Required, 1-200 characters
 * - purpose: Optional, max 2000 characters
 * - attachmentsIds: Optional array of CUIDs, max 10 attachments
 * 
 * USE CASE:
 * Validates form data when resubmitting after changes were requested.
 * 
 * DIFFERENCE FROM CREATE:
 * Does not include supervisorId (cannot change supervisor on resubmit).
 */
export const resubmitTransferRequestSchema = z.object({
  title: z.string().min(3).max(200),
  fromLocation: z.string().min(1).max(200),
  toLocation: z.string().min(1).max(200),
  purpose: z.string().max(2000).optional(),
  attachmentsIds: z.array(z.string().cuid()).max(10).optional(),
  itemsJson: z.string().optional(),
})
