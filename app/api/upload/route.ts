/**
 * FILE UPLOAD API ROUTE
 * 
 * This API route handles file uploads for authenticated users.
 * 
 * ENDPOINT: POST /api/upload
 * 
 * FLOW OVERVIEW:
 * 1. Verify user is authenticated
 * 2. Extract file from FormData
 * 3. Validate file size (max 5MB)
 * 4. Validate file type (allowed types)
 * 5. Generate unique filename
 * 6. Save file to uploads directory
 * 7. Create database record (Upload model)
 * 8. Return file metadata
 * 
 * SECURITY FEATURES:
 * - Requires authentication
 * - File size validation (5MB limit)
 * - File type validation (whitelist)
 * - Unique filename generation (prevents overwrites)
 * - Secure file storage
 * 
 * ALLOWED FILE TYPES:
 * - Images: JPEG, PNG, GIF
 * - Documents: PDF
 * - Spreadsheets: CSV, Excel (xls, xlsx)
 * 
 * FILE STORAGE:
 * - Files stored in: uploads/ directory
 * - Filename format: {random-string}_{timestamp}.{extension}
 * - Database record links file to user
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - Missing file: 400 Bad Request
 * - File too large: 400 Bad Request
 * - Invalid file type: 400 Bad Request
 * - Generic errors: 500 Internal Server Error
 * 
 * REQUEST:
 * POST /api/upload
 * Content-Type: multipart/form-data
 * FormData:
 *   - file: File object
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "id": "upload-id",
 *   "filename": "unique-filename.pdf",
 *   "originalName": "document.pdf",
 *   "mimeType": "application/pdf",
 *   "size": 1024000,
 *   "url": "/uploads/unique-filename.pdf"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { generateRandomString } from "@/lib/utils"

/**
 * UPLOAD DIRECTORY CONFIGURATION
 * 
 * Base directory for file uploads.
 * Located in: project-root/uploads/
 */
const UPLOAD_DIR = path.join(process.cwd(), "uploads")

/**
 * FILE SIZE LIMIT
 * 
 * Maximum file size allowed: 5MB
 * Prevents large file uploads that could cause issues.
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * ALLOWED FILE TYPES
 * 
 * Whitelist of MIME types allowed for upload.
 * 
 * TYPES ALLOWED:
 * - Images: JPEG, PNG, GIF
 * - Documents: PDF
 * - Spreadsheets: CSV, Excel (xls, xlsx)
 * 
 * SECURITY:
 * Only allows safe file types.
 * Prevents executable files, scripts, etc.
 */
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/gif",
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]

/**
 * POST HANDLER
 * 
 * Handles POST requests to /api/upload
 * 
 * PROCESS:
 * 1. Check authentication
 * 2. Extract file from FormData
 * 3. Validate file
 * 4. Generate unique filename
 * 5. Save file
 * 6. Create database record
 * 
 * @param request - Next.js request object with FormData
 * @returns JSON response with file metadata
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, PDF, CSV, Excel" },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate safe filename
    const fileExtension = path.extname(file.name)
    const safeFileName = `${generateRandomString(16)}_${Date.now()}${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, safeFileName)
    const relativePath = `uploads/${safeFileName}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save file metadata to database
    const upload = await db.upload.create({
      data: {
        filename: safeFileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: relativePath,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      id: upload.id,
      filename: upload.filename,
      originalName: upload.originalName,
      size: upload.size,
      path: upload.path,
      url: `/api/upload/${upload.id}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
