import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createFolder, deleteFolder, renameOrMove } from "@/lib/file-manager"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { parentPath = "", name } = await request.json()
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Folder name required" }, { status: 400 })
    }
    await createFolder(parentPath, name)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    console.error("Rename/move folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")
    if (!path) return NextResponse.json({ error: "path required" }, { status: 400 })
    await deleteFolder(path)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


