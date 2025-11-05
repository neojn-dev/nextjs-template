/**
 * TRANSFER REQUESTS API ROUTE
 * 
 * This API route handles transfer request workflow operations.
 * 
 * ENDPOINT: GET /api/workflows/transfer-requests - List transfer requests
 * ENDPOINT: POST /api/workflows/transfer-requests - Create transfer request
 * 
 * FLOW OVERVIEW:
 * 
 * GET (List Transfer Requests):
 * 1. Verify authentication
 * 2. Parse and validate query parameters
 * 3. Build where clause based on role and filters
 * 4. Apply role-based filtering (Users see only their requests)
 * 5. Execute paginated query
 * 6. Return requests list with pagination metadata
 * 
 * POST (Create Transfer Request):
 * 1. Verify authentication
 * 2. Parse and validate request body
 * 3. Create transfer request with Draft status
 * 4. Create attachments (if provided)
 * 5. Send notification email to supervisor (if assigned)
 * 6. Return created request data
 * 
 * ROLE-BASED FILTERING:
 * - User: Only sees requests they created
 * - Supervisor: Sees all requests, filtered by tab (new/completed)
 * - Manager: Sees all requests, filtered by tab (new/completed)
 * 
 * TAB FILTERING:
 * - "all": All requests (for Supervisors/Managers)
 * - "new": Requests awaiting action for current role
 * - "completed": Requests with final status (approved/rejected)
 * 
 * QUERY PARAMETERS (GET):
 * - tab: 'all', 'new', 'completed' (default: 'all')
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search query (title, fromLocation, toLocation)
 * - status: Filter by specific status (optional)
 * 
 * REQUEST BODY (POST):
 * ```json
 * {
 *   "title": "Transfer Request Title",
 *   "fromLocation": "Location A",
 *   "toLocation": "Location B",
 *   "purpose": "Transfer purpose",
 *   "supervisorId": "supervisor-id",
 *   "attachmentsIds": ["upload-id-1", "upload-id-2"]
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createTransferRequestSchema, listTransferRequestsQuery } from "@/lib/validations/transfer-requests"
import { sendWorkflowNotification } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    // AUTHENTICATION CHECK
    // Verify user is authenticated before proceeding
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // PARSE QUERY PARAMETERS
    // Extract and validate query parameters from URL
    const url = new URL(request.url)
    const parse = listTransferRequestsQuery.safeParse({
      tab: url.searchParams.get("tab") || "all",
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      search: url.searchParams.get("search") || undefined,
      status: url.searchParams.get("status") || undefined,
    })
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }
    const { tab, page, limit } = parse.data
    const role = session.user.role || "User"

    // BUILD WHERE CLAUSE FOR DATABASE QUERY
    // Start with empty where clause and build based on role and filters
    const where: any = {}

    // ROLE-BASED FILTERING
    // Users can only see requests they created
    // Supervisors and Managers can see all requests (with tab filtering)
    if (role === "User") {
      where.createdById = session.user.id
    }

    // TAB FILTERING FOR SUPERVISORS AND MANAGERS
    // Allows filtering requests by workflow stage
    if (role === "Supervisor" || role === "Manager") {
      // NEW TAB: Shows requests awaiting action for current role
      if (tab === "new") {
        if (role === "Supervisor") {
          // Supervisor sees requests in Submitted or SupervisorChangesRequested state
          where.status = { in: ["Submitted", "SupervisorChangesRequested"] }
        } else {
          // Manager sees requests in SupervisorApproved or ManagerChangesRequested state
          where.status = { in: ["SupervisorApproved", "ManagerChangesRequested"] }
        }
      }
      // COMPLETED TAB: Shows requests in final states
      if (tab === "completed") {
        // Only show requests that reached final approval/rejection states
        where.status = { in: ["ManagerApproved", "ManagerRejected"] }
      }
    }

    // SEARCH FILTERING
    // Search across title, fromLocation, and toLocation fields
    const search = url.searchParams.get("search")?.trim()
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { fromLocation: { contains: search } },
        { toLocation: { contains: search } },
      ]
    }
    
    // STATUS FILTERING
    // Optional filter by specific status
    const status = url.searchParams.get("status")?.trim() as any
    if (status) {
      where.status = status
    }

    // EXECUTE PAGINATED QUERY
    // Fetch requests and total count in parallel for efficiency
    const [requests, total] = await Promise.all([
      // FETCH REQUESTS
      // Apply pagination: skip = (page - 1) * limit, take = limit
      prisma.transferRequest.findMany({
        where,
        orderBy: { createdAt: "desc" }, // Most recent first
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          fromLocation: true,
          toLocation: true,
          status: true,
          createdAt: true,
          submittedAt: true,
          completedAt: true,
        }
      }),
      // COUNT TOTAL REQUESTS
      // Count matching requests for pagination metadata
      prisma.transferRequest.count({ where }),
    ])

    // RETURN PAGINATED RESULTS
    // Include data array and pagination metadata
    return NextResponse.json({ data: requests, meta: { page, limit, total } })
  } catch (error) {
    console.error("List transfer requests error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // AUTHENTICATION CHECK
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // REQUEST BODY VALIDATION
    // Validate request body using Zod schema
    const json = await request.json()
    const parsed = createTransferRequestSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    const { title, fromLocation, toLocation, purpose, supervisorId, attachmentsIds, itemsJson } = parsed.data

    // CREATE TRANSFER REQUEST
    // Create request with Submitted status (not Draft)
    // When user submits form, request immediately goes to Submitted state
    const created = await prisma.transferRequest.create({
      data: {
        title,
        fromLocation,
        toLocation,
        purpose,
        itemsJson: itemsJson || undefined, // Store items as JSON string
        status: "Submitted", // Start workflow immediately
        submittedAt: new Date(), // Record submission timestamp
        createdById: session.user.id, // Link to creator
        supervisorId: supervisorId ?? undefined, // Optional supervisor assignment
      },
      select: { id: true }
    })

    // CREATE ATTACHMENT LINKS
    // Link uploaded files to the request
    if (attachmentsIds && attachmentsIds.length > 0) {
      await prisma.transferAttachment.createMany({
        data: attachmentsIds.map(id => ({ requestId: created.id, uploadId: id }))
      })
    }

    // CREATE AUDIT LOG ENTRY
    // Track request creation for audit purposes
    await prisma.auditLog.create({
      data: {
        entityType: 'TransferRequest',
        entityId: created.id,
        action: 'Create',
        actorId: session.user.id,
        fromStatus: null, // No previous status
        toStatus: 'Submitted',
        data: JSON.stringify({ title, fromLocation, toLocation, supervisorId })
      }
    })

    // EMAIL NOTIFICATION
    // Notify supervisor if assigned (non-blocking)
    // Email failures don't break the workflow
    if (supervisorId) {
      try {
        const supervisor = await prisma.user.findUnique({ 
          where: { id: supervisorId }, 
          select: { email: true, firstName: true } 
        })
        if (supervisor?.email) {
          await sendWorkflowNotification(
            supervisor.email,
            `New transfer request submitted: ${title}`,
            `<p>Hi ${supervisor.firstName || ''},</p><p>A new transfer request has been submitted and awaits your review.</p>`
          )
        }
      } catch (emailError) {
        console.warn('Email notification failed (workflow still succeeded):', emailError instanceof Error ? emailError.message : 'Unknown error')
      }
    }

    // RETURN CREATED REQUEST ID
    // Client can use this to navigate to the request details page
    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (error) {
    console.error("Create transfer request error", error)
    // In development, return detailed error message
    // In production, return generic error message
    const message = (process.env.NODE_ENV !== 'production' && error instanceof Error)
      ? error.message
      : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


