import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const roleName = url.searchParams.get("role")
    if (!roleName || !["Supervisor", "Manager"].includes(roleName)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      return NextResponse.json({ data: [] })
    }

    const users = await prisma.user.findMany({
      where: { roleId: role.id, isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true, username: true }
    })
    return NextResponse.json({ data: users })
  } catch (e) {
    console.error("Approvers list error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


