import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveSafePath } from "@/lib/file-manager"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const resolvedParams = await params
    const filePath = decodeURIComponent(resolvedParams.path)
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
      const absPath = resolveSafePath(filePath)
      if (!existsSync(absPath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      const fileBuffer = await readFile(absPath)
      const ext = path.extname(absPath).toLowerCase()
      
      // Determine MIME type
      const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".csv": "text/csv",
        ".json": "application/json",
        ".xml": "application/xml",
        ".zip": "application/zip",
      }
      
      const contentType = mimeTypes[ext] || "application/octet-stream"

      const url = new URL(request.url)
      const download = url.searchParams.get("download") === "1"
      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      }
      if (download) {
        const baseName = path.basename(absPath)
        headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(baseName)}"`
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      })
    } catch (error) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }
  } catch (error) {
    console.error("File serve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

