/**
 * ASSIGN MANAGER TO TRANSFER REQUEST API ROUTE
 * 
 * This API route handles assigning a manager to a transfer request.
 * 
 * ENDPOINT: POST /api/workflows/transfer-requests/[id]/assign-manager
 * 
 * WORKFLOW OVERVIEW:
 * Supervisors can assign a specific manager to a transfer request before or after approval.
 * This allows delegation of the manager approval step to a specific individual.
 * 
 * ASSIGNMENT FLOW:
 * 1. Verify authentication and supervisor role
 * 2. Validate request body (managerId required, valid CUID format)
 * 3. Verify request exists
 * 4. Verify request status allows manager assignment
 * 5. Update request with managerId
 * 6. Create audit log entry
 * 
 * WHEN CAN MANAGER BE ASSIGNED:
 * - Submitted: Before supervisor approval
 * - SupervisorApproved: After supervisor approval
 * - SupervisorChangesRequested: When changes are requested
 * 
 * BUSINESS RULES:
 * - Only supervisors can assign managers
 * - Manager assignment is optional (can be done during approval)
 * - Assignment can be changed if needed
 * - All changes are wrapped in database transactions
 * - Audit log tracks all assignment changes
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "managerId": "cuid-string" // Required, valid CUID format
 * }
 * ```
 * 
 * RESPONSE:
 * - 200 OK: { ok: true }
 * - 400 Bad Request: Invalid body
 * - 401 Unauthorized: Not authenticated
 * - 403 Forbidden: Not a supervisor
 * - 404 Not Found: Request not found
 * - 409 Conflict: Invalid workflow state
 * 
 * SECURITY:
 * - Requires authentication
 * - Role-based access control (Supervisor only)
 * - Validates workflow state before allowing assignment
 * - Ensures data consistency with database transactions
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { assignManagerSchema } from "@/lib/validations/transfer-requests"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // AUTHENTICATION CHECK
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    // ROLE CHECK
    // Only supervisors can assign managers
    const role = session.user.role
    if (role !== "Supervisor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // REQUEST BODY VALIDATION
    // ManagerId must be a valid CUID format
    const json = await request.json().catch(() => ({}))
    const parsed = assignManagerSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    // FETCH REQUEST
    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // STATE VALIDATION
    // Manager can be assigned in these states:
    // - Submitted: Before supervisor approval
    // - SupervisorApproved: After supervisor approval
    // - SupervisorChangesRequested: When changes are requested
    if (reqItem.status !== "Submitted" && reqItem.status !== "SupervisorApproved" && reqItem.status !== "SupervisorChangesRequested") {
      return NextResponse.json({ error: "Invalid state" }, { status: 409 })
    }

    // DATABASE TRANSACTION
    // Update manager assignment and create audit log
    await prisma.$transaction([
      // UPDATE MANAGER ASSIGNMENT
      prisma.transferRequest.update({ 
        where: { id }, 
        data: { managerId: parsed.data.managerId } 
      }),
      
      // CREATE AUDIT LOG ENTRY
      // Track manager assignment for audit purposes
      prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: id, 
          action: 'AssignManager', 
          actorId: session.user.id, 
          fromStatus: reqItem.status, 
          toStatus: reqItem.status, // Status doesn't change on assignment
          data: JSON.stringify({ managerId: parsed.data.managerId }) 
        } 
      })
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Assign manager error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
