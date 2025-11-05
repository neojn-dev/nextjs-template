/**
 * FILE MANAGER UPLOAD API ROUTE
 * 
 * This API route handles file uploads to the file manager system.
 * 
 * ENDPOINT: POST /api/file-manager/upload
 * 
 * FLOW OVERVIEW:
 * 1. Verify authentication
 * 2. Ensure base upload directory exists
 * 3. Extract file and upload parameters from form data
 * 4. Validate file size (max 20MB)
 * 5. Resolve safe target path (prevents path traversal)
 * 6. Create target directory if it doesn't exist
 * 7. Determine final filename (custom name or original)
 * 8. Sanitize filename (remove path separators)
 * 9. Write file to disk
 * 10. Return file metadata
 * 
 * SECURITY FEATURES:
 * - Requires authentication
 * - Path traversal protection (resolveSafePath utility)
 * - File size validation (max 20MB)
 * - Filename sanitization (removes path separators)
 * - Safe path resolution (confined to uploads directory)
 * 
 * FORM DATA PARAMETERS:
 * - file: File object (required)
 * - path: Target directory path (optional, defaults to root)
 * - name: Custom filename (optional, uses original filename if not provided)
 * 
 * FILENAME HANDLING:
 * - If custom name provided:
 *   - If no extension in custom name: appends original extension
 *   - If extension in custom name: uses custom name as-is
 *   - Sanitizes path separators (replaces with "-")
 * - If no custom name: uses original filename
 * 
 * PATH RESOLUTION:
 * - Uses resolveSafePath utility for security
 * - Prevents path traversal attacks (../, ..\)
 * - Confines all uploads to uploads directory
 * - Creates nested directories automatically
 * 
 * FILE SIZE LIMIT:
 * - Maximum: 20MB
 * - Larger than regular upload route (for file manager use cases)
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - Bad Request: 400 (no file, file too large)
 * - Internal Server Error: 500 (file system errors)
 * 
 * RESPONSE FORMAT:
 * ```json
 * {
 *   "name": "filename.pdf",
 *   "path": "uploads/documents/filename.pdf",
 *   "size": 1024000,
 *   "type": "application/pdf"
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureBaseDir, resolveSafePath } from "@/lib/file-manager"
import path from "path"
import { promises as fs } from "fs"

/**
 * MAXIMUM FILE SIZE
 * 
 * Maximum allowed file size: 20MB
 * Larger limit than regular upload route for file manager use cases.
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

/**
 * POST HANDLER
 * 
 * Handles file upload to file manager.
 * 
 * PROCESS:
 * 1. Check authentication
 * 2. Ensure base directory exists
 * 3. Extract and validate file
 * 4. Resolve safe path
 * 5. Determine filename
 * 6. Write file to disk
 * 7. Return file metadata
 * 
 * @param request - Next.js request object containing form data
 * @returns JSON response with file metadata or error
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: CHECK AUTHENTICATION
     * 
     * User must be authenticated to upload files.
     * All authenticated users can upload files.
     */
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    /**
     * STEP 2: ENSURE BASE DIRECTORY EXISTS
     * 
     * Creates uploads directory if it doesn't exist.
     * Required for file operations.
     */
    await ensureBaseDir()

    /**
     * STEP 3: EXTRACT FORM DATA
     * 
     * Gets file and upload parameters from multipart/form-data.
     * 
     * PARAMETERS:
     * - file: File object to upload
     * - path: Target directory path (optional)
     * - name: Custom filename (optional)
     */
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const targetPath = (formData.get("path") as string) || ""
    const providedName = ((formData.get("name") as string) || "").trim()

    /**
     * STEP 4: VALIDATE FILE EXISTS
     * 
     * Checks if file was provided in form data.
     */
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    /**
     * STEP 5: VALIDATE FILE SIZE
     * 
     * Checks if file size is within allowed limit (20MB).
     * Prevents large file uploads that could cause issues.
     */
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    /**
     * STEP 6: RESOLVE SAFE TARGET PATH
     * 
     * Uses resolveSafePath utility to prevent path traversal attacks.
     * 
     * SECURITY:
     * - Sanitizes path (removes ../, ..\)
     * - Confines to uploads directory
     * - Returns absolute path within uploads directory
     */
    const targetDir = resolveSafePath(targetPath)

    /**
     * STEP 7: CREATE TARGET DIRECTORY
     * 
     * Creates target directory if it doesn't exist.
     * Uses recursive option to create nested directories.
     */
    await fs.mkdir(targetDir, { recursive: true })

    /**
     * STEP 8: DETERMINE FINAL FILENAME
     * 
     * Handles custom filename if provided.
     * 
     * LOGIC:
     * - If custom name provided without extension: appends original extension
     * - If custom name provided with extension: uses custom name
     * - If no custom name: uses original filename
     * - Sanitizes filename (removes path separators)
     */
    let finalName = file.name
    if (providedName) {
      const inputExt = path.extname(providedName)
      const originalExt = path.extname(file.name)
      if (!inputExt && originalExt) {
        // Custom name without extension: append original extension
        finalName = `${providedName}${originalExt}`
      } else {
        // Custom name with extension: use as-is
        finalName = providedName
      }
      /**
       * STEP 8A: SANITIZE FILENAME
       * 
       * Removes path separators from filename to prevent path traversal.
       * Replaces both forward slashes (/) and backslashes (\) with hyphens (-).
       */
      finalName = finalName.replace(/[\\/]/g, "-")
    }

    /**
     * STEP 9: RESOLVE FINAL FILE PATH
     * 
     * Creates safe absolute path for the file.
     * Uses resolveSafePath to prevent path traversal.
     */
    const filePath = resolveSafePath(path.join(targetPath, finalName))

    /**
     * STEP 10: WRITE FILE TO DISK
     * 
     * Converts file to buffer and writes to disk.
     * 
     * PROCESS:
     * - Reads file as ArrayBuffer
     * - Converts to Node.js Buffer
     * - Writes to disk using writeFile
     */
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(filePath, buffer)

    /**
     * STEP 11: RETURN FILE METADATA
     * 
     * Returns file information for frontend use.
     * 
     * RESPONSE INCLUDES:
     * - name: Final filename
     * - path: Relative path (normalized with forward slashes)
     * - size: File size in bytes
     * - type: MIME type
     */
    return NextResponse.json({
      name: finalName,
      path: path.join(targetPath, finalName).replace(/\\/g, "/"), // Normalize path separators
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    /**
     * ERROR HANDLING
     * 
     * Catches and logs errors from file upload.
     * Returns generic error message (doesn't expose internal details).
     */
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
