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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = session.user.role
    if (role !== "Supervisor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const json = await request.json().catch(() => ({}))
    const parsed = assignManagerSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (reqItem.status !== "Submitted" && reqItem.status !== "SupervisorApproved" && reqItem.status !== "SupervisorChangesRequested") {
      return NextResponse.json({ error: "Invalid state" }, { status: 409 })
    }

    await prisma.$transaction([
      prisma.transferRequest.update({ where: { id }, data: { managerId: parsed.data.managerId } }),
      prisma.auditLog.create({ data: { entityType: 'TransferRequest', entityId: id, action: 'AssignManager', actorId: session.user.id, fromStatus: reqItem.status, toStatus: reqItem.status, data: JSON.stringify({ managerId: parsed.data.managerId }) } })
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Assign manager error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


