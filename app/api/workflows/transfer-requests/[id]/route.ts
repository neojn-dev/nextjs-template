/**
 * GET TRANSFER REQUEST API ROUTE
 * 
 * This API route retrieves detailed information about a single transfer request.
 * 
 * ENDPOINT: GET /api/workflows/transfer-requests/[id]
 * 
 * WORKFLOW OVERVIEW:
 * Returns comprehensive details about a transfer request including:
 * - Basic request information (title, locations, purpose, status)
 * - Request metadata (created at, submitted at, completed at)
 * - Creator, supervisor, and manager information
 * - Approval steps history
 * - Comments thread
 * - Attachments list
 * 
 * ROLE-BASED ACCESS CONTROL:
 * - User: Can only view requests they created
 * - Supervisor: Can view all requests
 * - Manager: Can view all requests
 * 
 * DATA RETURNED:
 * - Request details: id, title, purpose, locations, status, timestamps
 * - User information: creator, supervisor, manager (name, email)
 * - Approval steps: all approval/rejection/change request decisions with timestamps
 * - Comments: all comments on the request with authors
 * - Attachments: all file attachments with download links
 * 
 * RESPONSE:
 * - 200 OK: { data: TransferRequest }
 * - 401 Unauthorized: Not authenticated
 * - 404 Not Found: Request not found or access denied
 * 
 * SECURITY:
 * - Requires authentication
 * - Role-based access control (Users see only their requests)
 * - Filters requests based on user role
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // AUTHENTICATION CHECK
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // BUILD WHERE CLAUSE WITH ROLE-BASED FILTERING
    // Users can only see their own requests
    // Supervisors and Managers can see all requests
    const role = session.user.role
    const where: any = { id }
    if (role === 'User') {
      where.createdById = session.user.id
    }

    // FETCH REQUEST WITH ALL RELATED DATA
    // Includes creator, supervisor, manager, steps, comments, and attachments
    const item = await prisma.transferRequest.findFirst({
      where,
      select: {
        // Basic request information
        id: true,
        title: true,
        purpose: true,
        fromLocation: true,
        toLocation: true,
        itemsJson: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        completedAt: true,
        createdById: true,
        supervisorId: true,
        managerId: true,
        
        // Creator information
        createdBy: {
          select: { firstName: true, lastName: true, username: true, email: true }
        },
        
        // Supervisor information
        supervisor: {
          select: { firstName: true, lastName: true, username: true, email: true }
        },
        
        // Manager information
        manager: {
          select: { firstName: true, lastName: true, username: true, email: true }
        },
        
        // Approval steps history
        // Ordered by creation time to show workflow progression
        steps: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            status: true,
            comment: true,
            createdAt: true,
            decidedAt: true,
            approver: {
              select: { firstName: true, lastName: true, username: true, email: true }
            }
          }
        },
        
        // Comments thread
        // Ordered by creation time to show conversation flow
        comments: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            body: true,
            authorRole: true,
            createdAt: true,
            author: { 
              select: { firstName: true, lastName: true, username: true, email: true } 
            }
          }
        },
        
        // File attachments
        attachments: {
          select: {
            id: true,
            label: true,
            upload: { 
              select: { id: true, originalName: true, path: true } 
            }
          }
        }
      }
    })

    // NOT FOUND HANDLING
    // Either request doesn't exist or user doesn't have access
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    return NextResponse.json({ data: item })
  } catch (e) {
    console.error('Get transfer request error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
