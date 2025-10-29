import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { listDirectory } from "@/lib/file-manager"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const relativePath = searchParams.get("path") || ""
    const items = await listDirectory(relativePath)
    return NextResponse.json({ items })
  } catch (error) {
    console.error("File manager list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


