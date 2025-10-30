import { z } from "zod"

export const createTransferRequestSchema = z.object({
  title: z.string().min(3).max(200),
  fromLocation: z.string().min(1).max(200),
  toLocation: z.string().min(1).max(200),
  purpose: z.string().max(2000).optional(),
  supervisorId: z.string().cuid().optional().nullable(),
  // Prefer upload IDs for attachment linking
  attachmentsIds: z.array(z.string().cuid()).max(10).optional(),
})

export const listTransferRequestsQuery = z.object({
  tab: z.enum(["all", "new", "completed"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
})

export const requestChangesSchema = z.object({
  comment: z.string().min(3).max(2000)
})

export const approveSchema = z.object({
  comment: z.string().max(2000).optional()
})

export const rejectSchema = z.object({
  comment: z.string().min(3).max(2000)
})

export const assignManagerSchema = z.object({
  managerId: z.string().cuid()
})

export const resubmitTransferRequestSchema = z.object({
  title: z.string().min(3).max(200),
  fromLocation: z.string().min(1).max(200),
  toLocation: z.string().min(1).max(200),
  purpose: z.string().max(2000).optional(),
  attachmentsIds: z.array(z.string().cuid()).max(10).optional(),
})
