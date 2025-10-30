import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [created, approved, rejected] = await Promise.all([
      prisma.auditLog.count({ where: { entityType: 'TransferRequest', action: 'Create' } }),
      prisma.auditLog.count({ where: { entityType: 'TransferRequest', action: 'Approve' } }),
      prisma.auditLog.count({ where: { entityType: 'TransferRequest', action: 'Reject' } }),
    ])

    return NextResponse.json({ data: { created, approved, rejected } })
  } catch (e) {
    console.error('Stats error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


