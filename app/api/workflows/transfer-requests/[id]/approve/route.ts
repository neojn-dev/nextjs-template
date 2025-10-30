import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { approveSchema } from "@/lib/validations/transfer-requests"
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
    const parsed = approveSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (role === "Supervisor") {
      if (reqItem.status !== "Submitted" && reqItem.status !== "SupervisorChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      await prisma.$transaction(async (tx) => {
        await tx.transferRequest.update({ where: { id }, data: { status: "SupervisorApproved" } })
        if (parsed.data.comment) {
          await tx.transferComment.create({ data: { requestId: id, authorId: session.user.id, authorRole: 'Supervisor', body: parsed.data.comment } })
        }
        await tx.auditLog.create({ data: { entityType: 'TransferRequest', entityId: id, action: 'Approve', actorId: session.user.id, fromStatus: reqItem.status, toStatus: 'SupervisorApproved' } })
      })
      // Notify assigned manager if any; otherwise creator
      if (reqItem.managerId) {
        const mgr = await prisma.user.findUnique({ where: { id: reqItem.managerId }, select: { email: true, firstName: true } })
        if (mgr?.email) await sendWorkflowNotification(mgr.email, 'Transfer request needs your approval', '<p>A transfer request was approved by Supervisor and needs your approval.</p>')
      } else {
        const creator = await prisma.user.findUnique({ where: { id: reqItem.createdById }, select: { email: true } })
        if (creator?.email) await sendWorkflowNotification(creator.email, 'Transfer request approved by Supervisor', '<p>Your transfer request was approved by Supervisor.</p>')
      }
      return NextResponse.json({ ok: true })
    }

    if (role === "Manager") {
      if (reqItem.status !== "SupervisorApproved" && reqItem.status !== "ManagerChangesRequested") {
        return NextResponse.json({ error: "Invalid state" }, { status: 409 })
      }
      // Optional guard: only assigned manager can act when set
      if (reqItem.managerId && reqItem.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      await prisma.$transaction(async (tx) => {
        await tx.transferRequest.update({ where: { id }, data: { status: "ManagerApproved", completedAt: new Date() } })
        if (parsed.data.comment) {
          await tx.transferComment.create({ data: { requestId: id, authorId: session.user.id, authorRole: 'Manager', body: parsed.data.comment } })
        }
        await tx.auditLog.create({ data: { entityType: 'TransferRequest', entityId: id, action: 'Approve', actorId: session.user.id, fromStatus: reqItem.status, toStatus: 'ManagerApproved' } })
      })
      const creator = await prisma.user.findUnique({ where: { id: reqItem.createdById }, select: { email: true } })
      if (creator?.email) await sendWorkflowNotification(creator.email, 'Transfer request approved by Manager', '<p>Your transfer request was approved by Manager.</p>')
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (e) {
    console.error("Approve error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


