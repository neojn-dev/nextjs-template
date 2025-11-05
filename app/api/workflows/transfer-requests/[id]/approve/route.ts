/**
 * APPROVE TRANSFER REQUEST API ROUTE
 * 
 * This API route handles approval of transfer requests in the workflow.
 * 
 * ENDPOINT: POST /api/workflows/transfer-requests/[id]/approve
 * 
 * WORKFLOW OVERVIEW:
 * The approval process follows a two-stage workflow:
 * 1. Supervisor Approval: First level of approval (required)
 * 2. Manager Approval: Final approval (required)
 * 
 * SUPERVISOR APPROVAL FLOW:
 * 1. Verify authentication and supervisor role
 * 2. Validate request body (comment optional, managerId required)
 * 3. Verify request status is "Submitted" or "SupervisorChangesRequested"
 * 4. Require managerId selection (mandatory for supervisor approval)
 * 5. Update request status to "SupervisorApproved"
 * 6. Assign manager to the request (managerId)
 * 7. Create approval step record
 * 8. Create comment if provided
 * 9. Create audit log entry
 * 10. Send email notification to assigned manager
 * 
 * MANAGER APPROVAL FLOW:
 * 1. Verify authentication and manager role
 * 2. Validate request body (comment optional)
 * 3. Verify request status is "SupervisorApproved" or "ManagerChangesRequested"
 * 4. Verify manager is assigned to this request (if managerId is set)
 * 5. Update request status to "ManagerApproved" (final state)
 * 6. Set completedAt timestamp
 * 7. Create approval step record
 * 8. Create comment if provided
 * 9. Create audit log entry
 * 10. Send email notification to request creator
 * 
 * STATE TRANSITIONS:
 * - Supervisor: Submitted/SupervisorChangesRequested → SupervisorApproved
 * - Manager: SupervisorApproved/ManagerChangesRequested → ManagerApproved
 * 
 * BUSINESS RULES:
 * - Supervisor MUST select a manager before approval
 * - Manager can only approve requests assigned to them (if managerId is set)
 * - All state changes are wrapped in database transactions for atomicity
 * - Email notifications are non-blocking (failures don't break workflow)
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "comment": "Optional approval comment",
 *   "managerId": "cuid-string" // Required for supervisor, ignored for manager
 * }
 * ```
 * 
 * RESPONSE:
 * - 200 OK: { ok: true }
 * - 400 Bad Request: Invalid body or missing managerId (supervisor)
 * - 401 Unauthorized: Not authenticated
 * - 403 Forbidden: Wrong role or manager not assigned
 * - 404 Not Found: Request not found
 * - 409 Conflict: Invalid workflow state
 * 
 * SECURITY:
 * - Requires authentication
 * - Role-based access control (Supervisor/Manager only)
 * - Validates workflow state before allowing transitions
 * - Ensures data consistency with database transactions
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { approveSchema } from "@/lib/validations/transfer-requests"
import { sendWorkflowNotification } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // AUTHENTICATION CHECK
    // Verify user is authenticated before proceeding
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = session.user.role

    // REQUEST BODY VALIDATION
    // Parse and validate request body using Zod schema
    const json = await request.json().catch(() => ({}))
    const parsed = approveSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    // FETCH REQUEST
    // Load the transfer request from database
    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // ============================================
    // SUPERVISOR APPROVAL HANDLING
    // ============================================
    if (role === "Supervisor") {
      // STATE VALIDATION
      // Supervisor can only approve requests in Submitted or SupervisorChangesRequested state
      if (reqItem.status !== "Submitted" && reqItem.status !== "SupervisorChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      
      // MANAGER SELECTION REQUIREMENT
      // Supervisor MUST select a manager before approval
      // This ensures every approved request has a manager assigned for the next stage
      if (!parsed.data.managerId) {
        return NextResponse.json({ error: "Manager selection is required for approval" }, { status: 400 })
      }
      
      // DATABASE TRANSACTION
      // All database changes are atomic - either all succeed or all fail
      await prisma.$transaction(async (tx) => {
        // UPDATE REQUEST STATUS
        // Change status to SupervisorApproved and assign manager
        await tx.transferRequest.update({ 
          where: { id }, 
          data: { 
            status: "SupervisorApproved",
            managerId: parsed.data.managerId // Assign manager when approving
          } 
        })
        
        // CREATE APPROVAL STEP RECORD
        // Records the supervisor's approval decision with timestamp
        await tx.approvalStep.create({
          data: {
            requestId: id,
            role: 'Supervisor',
            approverId: session.user.id,
            status: 'Approved',
            comment: parsed.data.comment || undefined,
            decidedAt: new Date()
          }
        })
        
        // CREATE COMMENT IF PROVIDED
        // If supervisor added a comment, save it as a transfer comment
        if (parsed.data.comment) {
          await tx.transferComment.create({ 
            data: { 
              requestId: id, 
              authorId: session.user.id, 
              authorRole: 'Supervisor', 
              body: parsed.data.comment 
            } 
          })
        }
        
        // CREATE AUDIT LOG ENTRY
        // Track the approval action for audit purposes
        await tx.auditLog.create({ 
          data: { 
            entityType: 'TransferRequest', 
            entityId: id, 
            action: 'Approve', 
            actorId: session.user.id, 
            fromStatus: reqItem.status, 
            toStatus: 'SupervisorApproved' 
          } 
        })
      })
      
      // EMAIL NOTIFICATION
      // Send notification to assigned manager (non-blocking)
      // Email failures don't break the workflow
      try {
        if (parsed.data.managerId) {
          const mgr = await prisma.user.findUnique({ 
            where: { id: parsed.data.managerId }, 
            select: { email: true, firstName: true } 
          })
          if (mgr?.email) {
            await sendWorkflowNotification(
              mgr.email, 
              'Transfer request needs your approval', 
              '<p>A transfer request was approved by Supervisor and needs your approval.</p>'
            )
          }
        }
      } catch (emailError) {
        // Log warning but don't fail the request
        console.warn('Email notification failed (workflow still succeeded):', emailError instanceof Error ? emailError.message : 'Unknown error')
      }
      return NextResponse.json({ ok: true })
    }

    // ============================================
    // MANAGER APPROVAL HANDLING
    // ============================================
    if (role === "Manager") {
      // STATE VALIDATION
      // Manager can only approve requests in SupervisorApproved or ManagerChangesRequested state
      if (reqItem.status !== "SupervisorApproved" && reqItem.status !== "ManagerChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      
      // ASSIGNMENT CHECK
      // If a manager is assigned, only that manager can approve
      // This prevents unauthorized managers from approving requests
      if (reqItem.managerId && reqItem.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      
      // DATABASE TRANSACTION
      // All database changes are atomic
      await prisma.$transaction(async (tx) => {
        // UPDATE REQUEST STATUS (FINAL STATE)
        // Change status to ManagerApproved and set completion timestamp
        await tx.transferRequest.update({ 
          where: { id }, 
          data: { 
            status: "ManagerApproved", 
            completedAt: new Date() // Mark as completed
          } 
        })
        
        // CREATE APPROVAL STEP RECORD
        // Records the manager's approval decision
        await tx.approvalStep.create({
          data: {
            requestId: id,
            role: 'Manager',
            approverId: session.user.id,
            status: 'Approved',
            comment: parsed.data.comment || undefined,
            decidedAt: new Date()
          }
        })
        
        // CREATE COMMENT IF PROVIDED
        if (parsed.data.comment) {
          await tx.transferComment.create({ 
            data: { 
              requestId: id, 
              authorId: session.user.id, 
              authorRole: 'Manager', 
              body: parsed.data.comment 
            } 
          })
        }
        
        // CREATE AUDIT LOG ENTRY
        await tx.auditLog.create({ 
          data: { 
            entityType: 'TransferRequest', 
            entityId: id, 
            action: 'Approve', 
            actorId: session.user.id, 
            fromStatus: reqItem.status, 
            toStatus: 'ManagerApproved' 
          } 
        })
      })
      
      // EMAIL NOTIFICATION
      // Notify creator that request is approved (final state)
      try {
        const creator = await prisma.user.findUnique({ 
          where: { id: reqItem.createdById }, 
          select: { email: true } 
        })
        if (creator?.email) {
          await sendWorkflowNotification(
            creator.email, 
            'Transfer request approved by Manager', 
            '<p>Your transfer request was approved by Manager.</p>'
          )
        }
      } catch (emailError) {
        console.warn('Email notification failed (workflow still succeeded):', emailError instanceof Error ? emailError.message : 'Unknown error')
      }
      return NextResponse.json({ ok: true })
    }

    // ROLE NOT AUTHORIZED
    // Only Supervisor and Manager roles can approve requests
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (e) {
    console.error("Approve error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
