/**
 * REQUEST CHANGES API ROUTE
 * 
 * This API route handles requesting changes on transfer requests.
 * 
 * ENDPOINT: POST /api/workflows/transfer-requests/[id]/request-changes
 * 
 * WORKFLOW OVERVIEW:
 * Requesting changes allows approvers to send requests back to the creator
 * for modifications without rejecting them. The creator can then resubmit
 * with the requested changes.
 * 
 * SUPERVISOR REQUEST CHANGES FLOW:
 * 1. Verify authentication and supervisor role
 * 2. Validate request body (comment required - minimum 3 characters)
 * 3. Verify request status is "Submitted" or "SupervisorChangesRequested"
 * 4. Update request status to "SupervisorChangesRequested"
 * 5. Create approval step record with ChangesRequested status
 * 6. Create comment with change request details (required)
 * 7. Create audit log entry
 * 8. Send email notification to request creator
 * 
 * MANAGER REQUEST CHANGES FLOW:
 * 1. Verify authentication and manager role
 * 2. Validate request body (comment required - minimum 3 characters)
 * 3. Verify request status is "SupervisorApproved" or "ManagerChangesRequested"
 * 4. Verify manager is assigned to this request (if managerId is set)
 * 5. Update request status to "ManagerChangesRequested"
 * 6. Create approval step record with ChangesRequested status
 * 7. Create comment with change request details (required)
 * 8. Create audit log entry
 * 9. Send email notification to request creator
 * 
 * STATE TRANSITIONS:
 * - Supervisor: Submitted/SupervisorChangesRequested → SupervisorChangesRequested
 * - Manager: SupervisorApproved/ManagerChangesRequested → ManagerChangesRequested
 * 
 * RESUBMISSION:
 * After changes are requested, the creator can:
 * - Update request details (title, locations, purpose, items, attachments)
 * - Resubmit the request (status changes back to "Submitted")
 * - The approver can then approve, reject, or request further changes
 * 
 * BUSINESS RULES:
 * - Change request comment is REQUIRED (minimum 3 characters)
 * - Status changes to ChangesRequested (allows resubmission)
 * - Manager can only request changes on requests assigned to them (if managerId is set)
 * - All state changes are wrapped in database transactions
 * - Email notifications are non-blocking
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "comment": "Details about required changes (required, 3-2000 characters)"
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
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { requestChangesSchema } from "@/lib/validations/transfer-requests"
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
    // Comment is REQUIRED for change requests (minimum 3 characters)
    const json = await request.json().catch(() => ({}))
    const parsed = requestChangesSchema.safeParse(json)
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
    // SUPERVISOR REQUEST CHANGES HANDLING
    // ============================================
    if (role === "Supervisor") {
      // STATE VALIDATION
      // Supervisor can request changes on Submitted or SupervisorChangesRequested requests
      // This allows requesting further changes after initial resubmission
      if (reqItem.status !== "Submitted" && reqItem.status !== "SupervisorChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      
      // DATABASE TRANSACTION
      await prisma.$transaction(async (tx) => {
        // UPDATE REQUEST STATUS
        // Change status to SupervisorChangesRequested (allows resubmission)
        await tx.transferRequest.update({ 
          where: { id }, 
          data: { 
            status: "SupervisorChangesRequested" 
          } 
        })
        
        // CREATE APPROVAL STEP RECORD
        // Records the supervisor's request for changes
        await tx.approvalStep.create({
          data: {
            requestId: id,
            role: 'Supervisor',
            approverId: session.user.id,
            status: 'ChangesRequested',
            comment: parsed.data.comment, // Change request details (required)
            decidedAt: new Date()
          }
        })
        
        // CREATE COMMENT WITH CHANGE REQUEST DETAILS
        // Always create comment for change requests (required field)
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
            action: 'RequestChanges', 
            actorId: session.user.id, 
            fromStatus: reqItem.status, 
            toStatus: 'SupervisorChangesRequested' 
          } 
        })
      })
      
      // EMAIL NOTIFICATION
      // Notify creator that changes are requested
      try {
        const creator = await prisma.user.findUnique({ 
          where: { id: reqItem.createdById }, 
          select: { email: true } 
        })
        if (creator?.email) {
          await sendWorkflowNotification(
            creator.email, 
            'Changes requested by Supervisor', 
            '<p>Changes were requested on your transfer request.</p>'
          )
        }
      } catch (emailError) {
        console.warn('Email notification failed (workflow still succeeded):', emailError instanceof Error ? emailError.message : 'Unknown error')
      }
      return NextResponse.json({ ok: true })
    }

    // ============================================
    // MANAGER REQUEST CHANGES HANDLING
    // ============================================
    if (role === "Manager") {
      // STATE VALIDATION
      // Manager can request changes on SupervisorApproved or ManagerChangesRequested requests
      if (reqItem.status !== "SupervisorApproved" && reqItem.status !== "ManagerChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      
      // ASSIGNMENT CHECK
      // If a manager is assigned, only that manager can request changes
      if (reqItem.managerId && reqItem.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      
      // DATABASE TRANSACTION
      await prisma.$transaction(async (tx) => {
        // UPDATE REQUEST STATUS
        // Change status to ManagerChangesRequested (allows resubmission)
        await tx.transferRequest.update({ 
          where: { id }, 
          data: { 
            status: "ManagerChangesRequested" 
          } 
        })
        
        // CREATE APPROVAL STEP RECORD
        await tx.approvalStep.create({
          data: {
            requestId: id,
            role: 'Manager',
            approverId: session.user.id,
            status: 'ChangesRequested',
            comment: parsed.data.comment, // Change request details (required)
            decidedAt: new Date()
          }
        })
        
        // CREATE COMMENT WITH CHANGE REQUEST DETAILS
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
            action: 'RequestChanges', 
            actorId: session.user.id, 
            fromStatus: reqItem.status, 
            toStatus: 'ManagerChangesRequested' 
          } 
        })
      })
      
      // EMAIL NOTIFICATION
      // Notify creator that changes are requested
      try {
        const creator = await prisma.user.findUnique({ 
          where: { id: reqItem.createdById }, 
          select: { email: true } 
        })
        if (creator?.email) {
          await sendWorkflowNotification(
            creator.email, 
            'Changes requested by Manager', 
            '<p>Changes were requested on your transfer request.</p>'
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
    console.error("Request changes error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
