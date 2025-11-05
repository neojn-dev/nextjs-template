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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    const where: any = {}

    if (role === "User") {
      where.createdById = session.user.id
    }

    if (role === "Supervisor" || role === "Manager") {
      // Supervisors and Managers see all by default; apply tab filters
      if (tab === "new") {
        // New means awaiting action for their role
        if (role === "Supervisor") {
          where.status = { in: ["Submitted", "SupervisorChangesRequested"] }
        } else {
          where.status = { in: ["SupervisorApproved", "ManagerChangesRequested"] }
        }
      }
      if (tab === "completed") {
        where.status = { in: ["ManagerApproved", "ManagerRejected"] }
      }
    }

    const search = url.searchParams.get("search")?.trim()
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { fromLocation: { contains: search } },
        { toLocation: { contains: search } },
      ]
    }
    const status = url.searchParams.get("status")?.trim() as any
    if (status) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      prisma.transferRequest.findMany({
      where,
        orderBy: { createdAt: "desc" },
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
      prisma.transferRequest.count({ where }),
    ])

    return NextResponse.json({ data: requests, meta: { page, limit, total } })
  } catch (error) {
    console.error("List transfer requests error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const parsed = createTransferRequestSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    const { title, fromLocation, toLocation, purpose, supervisorId, attachmentsIds } = parsed.data

    const created = await prisma.transferRequest.create({
      data: {
        title,
        fromLocation,
        toLocation,
        purpose,
        status: "Submitted",
        submittedAt: new Date(),
        createdById: session.user.id,
        supervisorId: supervisorId ?? undefined,
      },
      select: { id: true }
    })

    if (attachmentsIds && attachmentsIds.length > 0) {
      await prisma.transferAttachment.createMany({
        data: attachmentsIds.map(id => ({ requestId: created.id, uploadId: id }))
      })
    }

    await prisma.auditLog.create({
      data: {
        entityType: 'TransferRequest',
        entityId: created.id,
        action: 'Create',
        actorId: session.user.id,
        fromStatus: null,
        toStatus: 'Submitted',
        data: JSON.stringify({ title, fromLocation, toLocation, supervisorId })
      }
    })

    // Notify supervisor if selected - do not fail the request on email issues
    if (supervisorId) {
      try {
        const supervisor = await prisma.user.findUnique({ where: { id: supervisorId }, select: { email: true, firstName: true } })
        if (supervisor?.email) {
          await sendWorkflowNotification(
            supervisor.email,
            `New transfer request submitted: ${title}`,
            `<p>Hi ${supervisor.firstName || ''},</p><p>A new transfer request has been submitted and awaits your review.</p>`
          )
        }
      } catch (e) {
        console.warn('Workflow email send skipped:', e)
      }
    }

    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (error) {
    console.error("Create transfer request error", error)
    const message = (process.env.NODE_ENV !== 'production' && error instanceof Error)
      ? error.message
      : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


