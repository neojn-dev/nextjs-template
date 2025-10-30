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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const reqItem = await prisma.transferRequest.findUnique({ where: { id } })
    if (!reqItem) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (reqItem.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!['SupervisorChangesRequested', 'ManagerChangesRequested'].includes(reqItem.status)) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 409 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = resubmitTransferRequestSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    const { title, fromLocation, toLocation, purpose, attachmentsIds } = parsed.data

    await prisma.$transaction(async (tx) => {
      await tx.transferRequest.update({
        where: { id },
        data: {
          title,
          fromLocation,
          toLocation,
          purpose,
          status: 'Submitted',
          submittedAt: new Date(),
        }
      })

      if (attachmentsIds && attachmentsIds.length > 0) {
        // Remove existing links and recreate from provided list
        await tx.transferAttachment.deleteMany({ where: { requestId: id } })
        await tx.transferAttachment.createMany({ data: attachmentsIds.map(uid => ({ requestId: id, uploadId: uid })) })
      }

      await tx.auditLog.create({
        data: {
          entityType: 'TransferRequest',
          entityId: id,
          action: 'Resubmit',
          actorId: session.user.id,
          fromStatus: reqItem.status,
          toStatus: 'Submitted',
        }
      })
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Resubmit error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


