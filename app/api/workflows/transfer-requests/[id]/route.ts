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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = session.user.role
    const where: any = { id }
    if (role === 'User') {
      where.createdById = session.user.id
    }

    const item = await prisma.transferRequest.findFirst({
      where,
      select: {
        id: true,
        title: true,
        purpose: true,
        fromLocation: true,
        toLocation: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        completedAt: true,
        supervisorId: true,
        managerId: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            body: true,
            authorRole: true,
            createdAt: true,
            author: { select: { firstName: true, lastName: true, username: true, email: true } }
          }
        },
        attachments: {
          select: {
            id: true,
            label: true,
            upload: { select: { id: true, originalName: true, path: true } }
          }
        }
      }
    })

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: item })
  } catch (e) {
    console.error('Get transfer request error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


