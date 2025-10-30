import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureBaseDir, resolveSafePath } from "@/lib/file-manager"
import path from "path"
import { promises as fs } from "fs"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await ensureBaseDir()
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const targetPath = (formData.get("path") as string) || ""
    const providedName = ((formData.get("name") as string) || "").trim()
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const targetDir = resolveSafePath(targetPath)
    await fs.mkdir(targetDir, { recursive: true })
    // Determine final filename
    let finalName = file.name
    if (providedName) {
      const inputExt = path.extname(providedName)
      const originalExt = path.extname(file.name)
      if (!inputExt && originalExt) {
        finalName = `${providedName}${originalExt}`
      } else {
        finalName = providedName
      }
      // Basic sanitize: remove path separators
      finalName = finalName.replace(/[\\/]/g, "-")
    }

    const filePath = resolveSafePath(path.join(targetPath, finalName))

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      name: finalName,
      path: path.join(targetPath, finalName).replace(/\\/g, "/"),
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


