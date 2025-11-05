/**
 * REJECT TRANSFER REQUEST API ROUTE
 * 
 * This API route handles rejection of transfer requests in the workflow.
 * 
 * ENDPOINT: POST /api/workflows/transfer-requests/[id]/reject
 * 
 * WORKFLOW OVERVIEW:
 * Rejection is a terminal action that ends the workflow at the current stage.
 * The request moves to a final state and cannot be resubmitted.
 * 
 * SUPERVISOR REJECTION FLOW:
 * 1. Verify authentication and supervisor role
 * 2. Validate request body (comment required - minimum 3 characters)
 * 3. Verify request status is "Submitted" or "SupervisorChangesRequested"
 * 4. Update request status to "SupervisorRejected" (final state)
 * 5. Set completedAt timestamp (rejection ends the workflow)
 * 6. Create approval step record with rejection status
 * 7. Create comment with rejection reason (required)
 * 8. Create audit log entry
 * 9. Send email notification to request creator
 * 
 * MANAGER REJECTION FLOW:
 * 1. Verify authentication and manager role
 * 2. Validate request body (comment required - minimum 3 characters)
 * 3. Verify request status is "SupervisorApproved" or "ManagerChangesRequested"
 * 4. Verify manager is assigned to this request (if managerId is set)
 * 5. Update request status to "ManagerRejected" (final state)
 * 6. Set completedAt timestamp
 * 7. Create approval step record with rejection status
 * 8. Create comment with rejection reason (required)
 * 9. Create audit log entry
 * 10. Send email notification to request creator
 * 
 * STATE TRANSITIONS:
 * - Supervisor: Submitted/SupervisorChangesRequested → SupervisorRejected (final)
 * - Manager: SupervisorApproved/ManagerChangesRequested → ManagerRejected (final)
 * 
 * BUSINESS RULES:
 * - Rejection comment is REQUIRED (minimum 3 characters)
 * - Rejection is a FINAL state (cannot be resubmitted)
 * - completedAt is set when rejected (workflow ends)
 * - Manager can only reject requests assigned to them (if managerId is set)
 * - All state changes are wrapped in database transactions for atomicity
 * - Email notifications are non-blocking
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "comment": "Rejection reason (required, 3-2000 characters)"
 * }
 * ```
 * 
 * RESPONSE:
 * - 200 OK: { ok: true }
 * - 400 Bad Request: Invalid body or missing comment
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
 * - Requires rejection reason for accountability
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rejectSchema } from "@/lib/validations/transfer-requests"
import { sendWorkflowNotification } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // AUTHENTICATION CHECK
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = session.user.role

    // REQUEST BODY VALIDATION
    // Comment is REQUIRED for rejection (minimum 3 characters)
    const json = await request.json().catch(() => ({}))
    const parsed = rejectSchema.safeParse(json)
    if (!parsed.success) {
      const errorMessage = parsed.error.errors[0]?.message || "Invalid body"
      return NextResponse.json({ 
        error: errorMessage,
        details: parsed.error.errors 
      }, { status: 400 })
    }

    // FETCH REQUEST
    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // ============================================
    // SUPERVISOR REJECTION HANDLING
    // ============================================
    if (role === "Supervisor") {
      // STATE VALIDATION
      // Supervisor can only reject requests in Submitted or SupervisorChangesRequested state
      if (reqItem.status !== "Submitted" && reqItem.status !== "SupervisorChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      
      // DATABASE TRANSACTION
      await prisma.$transaction(async (tx) => {
        // UPDATE REQUEST STATUS (FINAL STATE)
        // Change status to SupervisorRejected and mark as completed
        await tx.transferRequest.update({ 
          where: { id }, 
          data: { 
            status: "SupervisorRejected", 
            completedAt: new Date() // Rejection ends workflow
          } 
        })
        
        // CREATE APPROVAL STEP RECORD
        // Records the supervisor's rejection decision
        await tx.approvalStep.create({
          data: {
            requestId: id,
            role: 'Supervisor',
            approverId: session.user.id,
            status: 'Rejected',
            comment: parsed.data.comment, // Rejection reason (required)
            decidedAt: new Date()
          }
        })
        
        // CREATE COMMENT WITH REJECTION REASON
        // Always create comment for rejection (required field)
        await tx.transferComment.create({ 
          data: { 
            requestId: id, 
            authorId: session.user.id, 
            authorRole: 'Supervisor', 
            body: parsed.data.comment 
          } 
        })
        
        // CREATE AUDIT LOG ENTRY
        await tx.auditLog.create({ 
          data: { 
            entityType: 'TransferRequest', 
            entityId: id, 
            action: 'Reject', 
            actorId: session.user.id, 
            fromStatus: reqItem.status, 
            toStatus: 'SupervisorRejected' 
          } 
        })
      })
      
      // EMAIL NOTIFICATION
      // Notify creator that request was rejected
      try {
        const creator = await prisma.user.findUnique({ 
          where: { id: reqItem.createdById }, 
          select: { email: true } 
        })
        if (creator?.email) {
          await sendWorkflowNotification(
            creator.email, 
            'Transfer request rejected by Supervisor', 
            '<p>Your transfer request was rejected.</p>'
          )
        }
      } catch (emailError) {
        console.warn('Email notification failed (workflow still succeeded):', emailError instanceof Error ? emailError.message : 'Unknown error')
      }
      return NextResponse.json({ ok: true })
    }

    // ============================================
    // MANAGER REJECTION HANDLING
    // ============================================
    if (role === "Manager") {
      // STATE VALIDATION
      // Manager can only reject requests in SupervisorApproved or ManagerChangesRequested state
      if (reqItem.status !== "SupervisorApproved" && reqItem.status !== "ManagerChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      
      // ASSIGNMENT CHECK
      // If a manager is assigned, only that manager can reject
      if (reqItem.managerId && reqItem.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      
      // DATABASE TRANSACTION
      await prisma.$transaction(async (tx) => {
        // UPDATE REQUEST STATUS (FINAL STATE)
        // Change status to ManagerRejected and mark as completed
        await tx.transferRequest.update({ 
          where: { id }, 
          data: { 
            status: "ManagerRejected", 
            completedAt: new Date() 
          } 
        })
        
        // CREATE APPROVAL STEP RECORD
        await tx.approvalStep.create({
          data: {
            requestId: id,
            role: 'Manager',
            approverId: session.user.id,
            status: 'Rejected',
            comment: parsed.data.comment, // Rejection reason (required)
            decidedAt: new Date()
          }
        })
        
        // CREATE COMMENT WITH REJECTION REASON
        await tx.transferComment.create({ 
          data: { 
            requestId: id, 
            authorId: session.user.id, 
            authorRole: 'Manager', 
            body: parsed.data.comment 
          } 
        })
        
        // CREATE AUDIT LOG ENTRY
        await tx.auditLog.create({ 
          data: { 
            entityType: 'TransferRequest', 
            entityId: id, 
            action: 'Reject', 
            actorId: session.user.id, 
            fromStatus: reqItem.status, 
            toStatus: 'ManagerRejected' 
          } 
        })
      })
      
      // EMAIL NOTIFICATION
      // Notify creator that request was rejected
      try {
        const creator = await prisma.user.findUnique({ 
          where: { id: reqItem.createdById }, 
          select: { email: true } 
        })
        if (creator?.email) {
          await sendWorkflowNotification(
            creator.email, 
            'Transfer request rejected by Manager', 
            '<p>Your transfer request was rejected.</p>'
          )
        }
      } catch (emailError) {
        console.warn('Email notification failed (workflow still succeeded):', emailError instanceof Error ? emailError.message : 'Unknown error')
      }
      return NextResponse.json({ ok: true })
    }

    // ROLE NOT AUTHORIZED
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (e) {
    console.error("Reject error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
