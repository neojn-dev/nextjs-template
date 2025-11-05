/**
 * GET APPROVERS LIST API ROUTE
 * 
 * This API route retrieves a list of users with a specific role (Supervisor or Manager).
 * 
 * ENDPOINT: GET /api/workflows/approvers?role=Supervisor|Manager
 * 
 * WORKFLOW OVERVIEW:
 * Used to populate dropdown lists for assigning supervisors and managers to transfer requests.
 * Returns only active users with the specified role.
 * 
 * USE CASES:
 * - Create request: Select supervisor (Supervisor role)
 * - Approve request: Select manager (Manager role)
 * - Assign manager: Select manager (Manager role)
 * 
 * QUERY PARAMETERS:
 * - role: Required, must be "Supervisor" or "Manager"
 * 
 * FILTERING:
 * - Only returns active users (isActive: true)
 * - Only returns users with the specified role
 * - Returns user identification information (id, name, email)
 * 
 * RESPONSE:
 * - 200 OK: { data: User[] }
 * - 400 Bad Request: Invalid role parameter
 * - 401 Unauthorized: Not authenticated
 * 
 * RESPONSE FORMAT:
 * ```json
 * {
 *   "data": [
 *     {
 *       "id": "cuid-string",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "email": "john@example.com",
 *       "username": "johndoe"
 *     }
 *   ]
 * }
 * ```
 * 
 * SECURITY:
 * - Requires authentication
 * - Validates role parameter
 * - Returns only active users
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // AUTHENTICATION CHECK
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // EXTRACT ROLE PARAMETER
    const url = new URL(request.url)
    const roleName = url.searchParams.get("role")
    
    // VALIDATE ROLE PARAMETER
    // Must be either "Supervisor" or "Manager"
    if (!roleName || !["Supervisor", "Manager"].includes(roleName)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // FIND ROLE IN DATABASE
    // Look up the role by name
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      // If role doesn't exist, return empty array
      return NextResponse.json({ data: [] })
    }

    // FETCH USERS WITH SPECIFIED ROLE
    // Only return active users with the requested role
    const users = await prisma.user.findMany({
      where: { 
        roleId: role.id,  // Match role ID
        isActive: true     // Only active users
      },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        username: true 
      }
    })
    
    return NextResponse.json({ data: users })
  } catch (e) {
    console.error("Approvers list error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
