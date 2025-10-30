import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import path from "path"
import { existsSync } from "fs"
import { mkdir, writeFile, readFile } from "fs/promises"
import { db } from "@/lib/db"

const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars")
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Max size 3MB" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WEBP" }, { status: 400 })
    }

    if (!existsSync(AVATAR_DIR)) {
      await mkdir(AVATAR_DIR, { recursive: true })
    }

    const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg"
    const filename = `${session.user.id}${ext}`
    const diskPath = path.join(AVATAR_DIR, filename)
    const relativePath = `uploads/avatars/${filename}`

    const bytes = await file.arrayBuffer()
    await writeFile(diskPath, Buffer.from(bytes))

    await db.user.update({
      where: { id: session.user.id },
      data: { profileImage: relativePath },
    })

    return NextResponse.json({ path: relativePath, url: `/api/users/profile-image` })
  } catch (error) {
    console.error("Avatar upload error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user?.profileImage) {
      return NextResponse.json({ error: "No profile image" }, { status: 404 })
    }

    const filePath = path.join(process.cwd(), user.profileImage)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const buf = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"
    return new NextResponse(buf, { status: 200, headers: { "Content-Type": type, "Cache-Control": "private, max-age=300" } })
  } catch (err) {
    console.error("Avatar get error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


