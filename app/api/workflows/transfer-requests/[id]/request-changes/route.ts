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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = session.user.role

    const json = await request.json().catch(() => ({}))
    const parsed = requestChangesSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (role === "Supervisor") {
      if (reqItem.status !== "Submitted") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      await prisma.$transaction([
        prisma.transferRequest.update({ where: { id }, data: { status: "SupervisorChangesRequested" } }),
        prisma.transferComment.create({ data: { requestId: id, authorId: session.user.id, authorRole: 'Supervisor', body: parsed.data.comment } }),
        prisma.auditLog.create({ data: { entityType: 'TransferRequest', entityId: id, action: 'RequestChanges', actorId: session.user.id, fromStatus: reqItem.status, toStatus: 'SupervisorChangesRequested' } })
      ])
      const creator = await prisma.user.findUnique({ where: { id: reqItem.createdById }, select: { email: true } })
      if (creator?.email) await sendWorkflowNotification(creator.email, 'Changes requested by Supervisor', '<p>Changes were requested on your transfer request.</p>')
      return NextResponse.json({ ok: true })
    }

    if (role === "Manager") {
      if (reqItem.status !== "SupervisorApproved") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      // Only assigned manager can act when set
      if (reqItem.managerId && reqItem.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      await prisma.$transaction([
        prisma.transferRequest.update({ where: { id }, data: { status: "ManagerChangesRequested" } }),
        prisma.transferComment.create({ data: { requestId: id, authorId: session.user.id, authorRole: 'Manager', body: parsed.data.comment } }),
        prisma.auditLog.create({ data: { entityType: 'TransferRequest', entityId: id, action: 'RequestChanges', actorId: session.user.id, fromStatus: reqItem.status, toStatus: 'ManagerChangesRequested' } })
      ])
      const creator = await prisma.user.findUnique({ where: { id: reqItem.createdById }, select: { email: true } })
      if (creator?.email) await sendWorkflowNotification(creator.email, 'Changes requested by Manager', '<p>Changes were requested on your transfer request.</p>')
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (e) {
    console.error("Request changes error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


