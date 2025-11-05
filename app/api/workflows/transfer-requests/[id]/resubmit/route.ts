/**
 * RESUBMIT TRANSFER REQUEST API ROUTE
 * 
 * This API route handles resubmission of transfer requests after changes have been requested.
 * 
 * ENDPOINT: POST /api/workflows/transfer-requests/[id]/resubmit
 * 
 * WORKFLOW OVERVIEW:
 * When an approver requests changes, the request status changes to ChangesRequested.
 * The creator can then update the request details and resubmit it, which changes
 * the status back to "Submitted" and sends it back through the approval workflow.
 * 
 * RESUBMISSION FLOW:
 * 1. Verify authentication
 * 2. Verify request belongs to current user (only creator can resubmit)
 * 3. Verify request status is "SupervisorChangesRequested" or "ManagerChangesRequested"
 * 4. Validate request body (same as create request)
 * 5. Update request with new details (title, locations, purpose, items, attachments)
 * 6. Change status back to "Submitted"
 * 7. Update submittedAt timestamp
 * 8. Replace attachments with new ones (if provided)
 * 9. Create audit log entry
 * 
 * STATE TRANSITIONS:
 * - SupervisorChangesRequested → Submitted
 * - ManagerChangesRequested → Submitted
 * 
 * WHAT CAN BE UPDATED:
 * - title: Request title
 * - fromLocation: Source location
 * - toLocation: Destination location
 * - purpose: Request purpose/description
 * - itemsJson: List of items to transfer (JSON string)
 * - attachmentsIds: List of attachment upload IDs
 * 
 * WHAT CANNOT BE UPDATED:
 * - supervisorId: Cannot change supervisor (must stay the same)
 * - createdById: Creator cannot be changed
 * 
 * BUSINESS RULES:
 * - Only the request creator can resubmit
 * - Can only resubmit when status is ChangesRequested
 * - All updates are wrapped in database transactions
 * - Attachments are replaced (not appended) if provided
 * - SubmittedAt timestamp is updated to reflect resubmission time
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "title": "Updated request title",
 *   "fromLocation": "Source location",
 *   "toLocation": "Destination location",
 *   "purpose": "Updated purpose (optional)",
 *   "itemsJson": "[{\"name\":\"Item\",\"quantity\":\"10\",\"unit\":\"boxes\"}]",
 *   "attachmentsIds": ["upload-id-1", "upload-id-2"]
 * }
 * ```
 * 
 * RESPONSE:
 * - 200 OK: { ok: true }
 * - 400 Bad Request: Invalid body
 * - 401 Unauthorized: Not authenticated
 * - 403 Forbidden: Not the request creator
 * - 404 Not Found: Request not found
 * - 409 Conflict: Invalid workflow state
 * 
 * SECURITY:
 * - Requires authentication
 * - Only creator can resubmit their own requests
 * - Validates workflow state before allowing resubmission
 * - Ensures data consistency with database transactions
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { resubmitTransferRequestSchema } from "@/lib/validations/transfer-requests"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // AUTHENTICATION CHECK
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // FETCH REQUEST
    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // AUTHORIZATION CHECK
    // Only the request creator can resubmit
    if (reqItem.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // STATE VALIDATION
    // Can only resubmit when changes have been requested
    if (!['SupervisorChangesRequested', 'ManagerChangesRequested'].includes(reqItem.status)) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 409 })
    }

    // REQUEST BODY VALIDATION
    // Validate resubmission data (same structure as create request)
    const json = await request.json().catch(() => ({}))
    const parsed = resubmitTransferRequestSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    const { title, fromLocation, toLocation, purpose, attachmentsIds, itemsJson } = parsed.data

    // DATABASE TRANSACTION
    // All updates are atomic
    await prisma.$transaction(async (tx) => {
      // UPDATE REQUEST WITH NEW DETAILS
      // Update all editable fields and change status back to Submitted
      await tx.transferRequest.update({
        where: { id },
        data: {
          title,                      // Updated title
          fromLocation,              // Updated source location
          toLocation,                // Updated destination location
          purpose,                   // Updated purpose
          itemsJson: itemsJson || undefined, // Updated items list
          status: 'Submitted',       // Back to Submitted state
          submittedAt: new Date(),  // Update submission timestamp
        }
      })

      // UPDATE ATTACHMENTS
      // If attachments are provided, replace all existing attachments
      if (attachmentsIds && attachmentsIds.length > 0) {
        // Remove existing attachment links
        await tx.transferAttachment.deleteMany({ where: { requestId: id } })
        // Create new attachment links
        await tx.transferAttachment.createMany({ 
          data: attachmentsIds.map(uid => ({ 
            requestId: id, 
            uploadId: uid 
          })) 
        })
      }

      // CREATE AUDIT LOG ENTRY
      // Track the resubmission action
      await tx.auditLog.create({
        data: {
          entityType: 'TransferRequest',
          entityId: id,
          action: 'Resubmit',
          actorId: session.user.id,
          fromStatus: reqItem.status,    // Previous status (ChangesRequested)
          toStatus: 'Submitted',          // New status
        }
      })
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Resubmit error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
