/**
 * ADD COMMENT TO TRANSFER REQUEST API ROUTE
 * 
 * This API route handles adding comments to transfer requests.
 * 
 * ENDPOINT: POST /api/workflows/transfer-requests/[id]/comment
 * 
 * WORKFLOW OVERVIEW:
 * Comments enable communication between request creators, supervisors, and managers
 * throughout the approval process. Comments are visible to all parties involved.
 * 
 * COMMENT FLOW:
 * 1. Verify authentication
 * 2. Verify user role (User, Supervisor, or Manager)
 * 3. Validate request body (comment body required, 1-2000 characters)
 * 4. Verify user has access to the request
 * 5. Determine author role based on user's role
 * 6. Create comment record
 * 7. Return created comment with author information
 * 
 * ROLE-BASED ACCESS CONTROL:
 * - User: Can comment on requests they created
 * - Supervisor: Can comment on all requests
 * - Manager: Can comment on all requests
 * 
 * AUTHOR ROLE MAPPING:
 * - User role → "User" author role
 * - Supervisor role → "Supervisor" author role
 * - Manager role → "Manager" author role
 * 
 * BUSINESS RULES:
 * - Comment body is required (1-2000 characters)
 * - Users can only comment on their own requests
 * - Supervisors and Managers can comment on any request
 * - Comments are visible to all parties
 * - Comments are ordered by creation time
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "body": "Comment text (required, 1-2000 characters)"
 * }
 * ```
 * 
 * RESPONSE:
 * - 200 OK: { data: TransferComment }
 * - 400 Bad Request: Invalid body
 * - 401 Unauthorized: Not authenticated
 * - 403 Forbidden: Invalid role or access denied
 * - 404 Not Found: Request not found or access denied
 * 
 * SECURITY:
 * - Requires authentication
 * - Role-based access control
 * - Validates user has access to request
 * - Enforces comment length limits
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// COMMENT VALIDATION SCHEMA
// Comment body must be between 1 and 2000 characters
const addCommentSchema = z.object({
  body: z.string().min(1).max(2000)
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // AUTHENTICATION CHECK
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ROLE VALIDATION
    // Only User, Supervisor, and Manager roles can add comments
    const role = session.user.role || "User"
    if (!["User", "Supervisor", "Manager"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // REQUEST BODY VALIDATION
    const json = await request.json()
    const parsed = addCommentSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }

    // ACCESS CHECK
    // Verify user has access to this request
    // Users can only access their own requests
    // Supervisors and Managers can access all requests
    const reqItem = await prisma.transferRequest.findFirst({
      where: {
        id,
        ...(role === "User" ? { createdById: session.user.id } : {})
      }
    })

    if (!reqItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // DETERMINE AUTHOR ROLE
    // Map user role to comment author role
    const authorRole = role === "User" ? "User" : role === "Supervisor" ? "Supervisor" : "Manager"

    // CREATE COMMENT
    // Create comment record with author information
    const comment = await prisma.transferComment.create({
      data: {
        requestId: id,
        authorId: session.user.id,
        authorRole: authorRole as any,
        body: parsed.data.body
      },
      select: {
        id: true,
        body: true,
        authorRole: true,
        createdAt: true,
        author: {
          select: { firstName: true, lastName: true, username: true, email: true }
        }
      }
    })

    return NextResponse.json({ data: comment })
  } catch (e) {
    console.error("Add comment error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
