import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveSafePath } from "@/lib/file-manager"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { spawn } from "child_process"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { paths }: { paths: string[] } = await request.json()
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "paths[] required" }, { status: 400 })
    }

    // Resolve and validate all paths
    const absList: string[] = []
    for (const p of paths) {
      const abs = resolveSafePath(p)
      // Ensure exists
      await fs.access(abs)
      absList.push(abs)
    }

    // Create temp zip path
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "zip-"))
    const zipPath = path.join(tmpDir, `files-${Date.now()}.zip`)

    // Use system `zip` command to create archive
    // zip -r <zipPath> <items...>
    const zipProc = spawn("zip", ["-r", zipPath, ...absList], { stdio: "ignore" })
    const exitCode: number = await new Promise((resolve, reject) => {
      zipProc.on("error", reject)
      zipProc.on("close", resolve)
    }) as number

    if (exitCode !== 0) {
      return NextResponse.json({ error: "Failed to create zip (zip utility not available?)" }, { status: 500 })
    }

    const data = await fs.readFile(zipPath)

    // Cleanup temp directory asynchronously
    fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": data.length.toString(),
        "Content-Disposition": `attachment; filename="selection-${Date.now()}.zip"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Zip download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


