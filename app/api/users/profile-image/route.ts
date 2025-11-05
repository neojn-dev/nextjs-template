/**
 * PROFILE IMAGE API ROUTE
 * 
 * This API route handles user profile image upload and retrieval.
 * 
 * ENDPOINT: POST /api/users/profile-image - Upload profile image
 * ENDPOINT: GET /api/users/profile-image - Get profile image
 * 
 * FLOW OVERVIEW:
 * 
 * POST (Upload Profile Image):
 * 1. Verify authentication
 * 2. Extract file from form data
 * 3. Validate file size (max 3MB)
 * 4. Validate file type (JPEG, PNG, WEBP)
 * 5. Create avatars directory if it doesn't exist
 * 6. Generate filename (user-id + extension)
 * 7. Save file to disk
 * 8. Update user profile image path in database
 * 9. Return image path and URL
 * 
 * GET (Get Profile Image):
 * 1. Verify authentication
 * 2. Get user from database
 * 3. Check if profile image exists
 * 4. Verify file exists on disk
 * 5. Read file from disk
 * 6. Return image with appropriate content type
 * 
 * SECURITY FEATURES:
 * - Requires authentication (users can only upload their own image)
 * - File size validation (max 3MB)
 * - File type validation (only images)
 * - Filename sanitization (uses user ID, prevents path traversal)
 * - Secure file storage (separate avatars directory)
 * 
 * FILE STORAGE:
 * - Directory: uploads/avatars/
 * - Filename format: {userId}.{ext}
 * - Supported formats: JPEG, PNG, WEBP
 * - Max size: 3MB
 * 
 * DATABASE:
 * - Stores relative path in user.profileImage field
 * - Format: "uploads/avatars/{userId}.{ext}"
 * 
 * CACHE CONTROL:
 * - GET requests include Cache-Control header
 * - Private cache with 5-minute max-age
 * - Prevents unauthorized caching
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - Bad Request: 400 (no file, invalid size/type)
 * - Not Found: 404 (no profile image)
 * - Internal Server Error: 500 (file system errors)
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import path from "path"
import { existsSync } from "fs"
import { mkdir, writeFile, readFile } from "fs/promises"
import { db } from "@/lib/db"

/**
 * AVATAR DIRECTORY CONFIGURATION
 * 
 * Path to avatars directory relative to project root.
 * Created automatically if it doesn't exist.
 */
const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars")

/**
 * FILE VALIDATION CONSTANTS
 * 
 * MAX_FILE_SIZE: Maximum file size in bytes (3MB)
 * ALLOWED_TYPES: MIME types allowed for profile images
 */
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

/**
 * POST HANDLER
 * 
 * Handles profile image upload.
 * 
 * PROCESS:
 * 1. Check authentication
 * 2. Validate file
 * 3. Save file to disk
 * 4. Update database
 * 5. Return image path
 * 
 * @param request - Next.js request object containing form data with file
 * @returns JSON response with image path and URL or error
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: CHECK AUTHENTICATION
     * 
     * User must be authenticated to upload profile image.
     * Users can only upload their own profile image.
     */
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    /**
     * STEP 2: EXTRACT FILE FROM FORM DATA
     * 
     * Gets file from multipart/form-data request.
     * Form data is used for file uploads in web browsers.
     */
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    /**
     * STEP 3: VALIDATE FILE SIZE
     * 
     * Checks if file size is within allowed limit (3MB).
     * Prevents large file uploads that could cause issues.
     */
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Max size 3MB" }, { status: 400 })
    }

    /**
     * STEP 4: VALIDATE FILE TYPE
     * 
     * Checks if file type is allowed (JPEG, PNG, WEBP).
     * Prevents upload of non-image files or unsupported formats.
     * 
     * SECURITY: Prevents malicious file uploads.
     */
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WEBP" }, { status: 400 })
    }

    /**
     * STEP 5: CREATE AVATAR DIRECTORY
     * 
     * Creates avatars directory if it doesn't exist.
     * Uses recursive option to create parent directories if needed.
     */
    if (!existsSync(AVATAR_DIR)) {
      await mkdir(AVATAR_DIR, { recursive: true })
    }

    /**
     * STEP 6: GENERATE FILENAME
     * 
     * Creates filename using user ID and file extension.
     * 
     * FILENAME FORMAT: {userId}.{ext}
     * 
     * SECURITY:
     * - Uses user ID (prevents path traversal)
     * - Extension based on file type (validated)
     * - No user-controlled filename (prevents injection)
     */
    const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg"
    const filename = `${session.user.id}${ext}`
    const diskPath = path.join(AVATAR_DIR, filename)
    const relativePath = `uploads/avatars/${filename}`

    /**
     * STEP 7: SAVE FILE TO DISK
     * 
     * Converts file to buffer and writes to disk.
     * 
     * PROCESS:
     * - Reads file as ArrayBuffer
     * - Converts to Node.js Buffer
     * - Writes to disk using writeFile
     */
    const bytes = await file.arrayBuffer()
    await writeFile(diskPath, Buffer.from(bytes))

    /**
     * STEP 8: UPDATE USER PROFILE IMAGE IN DATABASE
     * 
     * Updates user record with profile image path.
     * Stores relative path (not absolute) for portability.
     */
    await db.user.update({
      where: { id: session.user.id },
      data: { profileImage: relativePath },
    })

    /**
     * STEP 9: RETURN SUCCESS RESPONSE
     * 
     * Returns image path and URL for frontend use.
     * URL points to GET endpoint for retrieving image.
     */
    return NextResponse.json({ path: relativePath, url: `/api/users/profile-image` })
  } catch (error) {
    console.error("Avatar upload error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET HANDLER
 * 
 * Retrieves the authenticated user's profile image.
 * 
 * PROCESS:
 * 1. Check authentication
 * 2. Get user from database
 * 3. Verify profile image exists
 * 4. Read file from disk
 * 5. Return image with proper content type
 * 
 * @returns NextResponse with image file or error
 */
export async function GET() {
  try {
    /**
     * STEP 1: CHECK AUTHENTICATION
     * 
     * User must be authenticated to retrieve profile image.
     * Users can only retrieve their own profile image.
     */
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    /**
     * STEP 2: GET USER FROM DATABASE
     * 
     * Retrieves user record to get profile image path.
     */
    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user?.profileImage) {
      return NextResponse.json({ error: "No profile image" }, { status: 404 })
    }

    /**
     * STEP 3: VERIFY FILE EXISTS ON DISK
     * 
     * Checks if profile image file exists on filesystem.
     * Database might have path but file might be deleted.
     */
    const filePath = path.join(process.cwd(), user.profileImage)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    /**
     * STEP 4: READ FILE FROM DISK
     * 
     * Reads image file as buffer.
     */
    const buf = await readFile(filePath)

    /**
     * STEP 5: DETERMINE CONTENT TYPE
     * 
     * Determines MIME type from file extension.
     * Used for proper browser rendering.
     */
    const ext = path.extname(filePath).toLowerCase()
    const type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"

    /**
     * STEP 6: RETURN IMAGE RESPONSE
     * 
     * Returns image with appropriate headers.
     * 
     * HEADERS:
     * - Content-Type: Image MIME type (JPEG, PNG, WEBP)
     * - Cache-Control: Private cache with 5-minute max-age
     * 
     * CACHE CONTROL:
     * - private: Prevents proxy caching
     * - max-age=300: Cache for 5 minutes
     * - Balances performance and freshness
     */
    return new NextResponse(buf, { 
      status: 200, 
      headers: { 
        "Content-Type": type, 
        "Cache-Control": "private, max-age=300" 
      } 
    })
  } catch (err) {
    console.error("Avatar get error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


