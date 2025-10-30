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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = session.user.role

    const json = await request.json().catch(() => ({}))
    const parsed = rejectSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (role === "Supervisor") {
      if (reqItem.status !== "Submitted" && reqItem.status !== "SupervisorChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      await prisma.$transaction([
        prisma.transferRequest.update({ where: { id }, data: { status: "SupervisorRejected", completedAt: new Date() } }),
        prisma.transferComment.create({ data: { requestId: id, authorId: session.user.id, authorRole: 'Supervisor', body: parsed.data.comment } }),
        prisma.auditLog.create({ data: { entityType: 'TransferRequest', entityId: id, action: 'Reject', actorId: session.user.id, fromStatus: reqItem.status, toStatus: 'SupervisorRejected' } })
      ])
      const creator = await prisma.user.findUnique({ where: { id: reqItem.createdById }, select: { email: true } })
      if (creator?.email) await sendWorkflowNotification(creator.email, 'Transfer request rejected by Supervisor', '<p>Your transfer request was rejected.</p>')
      return NextResponse.json({ ok: true })
    }

    if (role === "Manager") {
      if (reqItem.status !== "SupervisorApproved" && reqItem.status !== "ManagerChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      if (reqItem.managerId && reqItem.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      await prisma.$transaction([
        prisma.transferRequest.update({ where: { id }, data: { status: "ManagerRejected", completedAt: new Date() } }),
        prisma.transferComment.create({ data: { requestId: id, authorId: session.user.id, authorRole: 'Manager', body: parsed.data.comment } }),
        prisma.auditLog.create({ data: { entityType: 'TransferRequest', entityId: id, action: 'Reject', actorId: session.user.id, fromStatus: reqItem.status, toStatus: 'ManagerRejected' } })
      ])
      const creator = await prisma.user.findUnique({ where: { id: reqItem.createdById }, select: { email: true } })
      if (creator?.email) await sendWorkflowNotification(creator.email, 'Transfer request rejected by Manager', '<p>Your transfer request was rejected.</p>')
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (e) {
    console.error("Reject error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


