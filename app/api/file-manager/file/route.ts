import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { renameOrMove, resolveSafePath } from "@/lib/file-manager"
import { promises as fs } from "fs"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { from, to } = await request.json()
    if (!from || !to) {
      return NextResponse.json({ error: "from and to paths required" }, { status: 400 })
    }
    await renameOrMove(from, to)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Rename/move file error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")
    if (!filePath) return NextResponse.json({ error: "path required" }, { status: 400 })
    const abs = resolveSafePath(filePath)
    await fs.unlink(abs)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete file error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


