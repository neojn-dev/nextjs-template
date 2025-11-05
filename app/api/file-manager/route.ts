/**
 * FILE MANAGER LIST API ROUTE
 * 
 * This API route lists files and directories in a specified path.
 * 
 * ENDPOINT: GET /api/file-manager?path=relative/path
 * 
 * FLOW OVERVIEW:
 * 1. Verify authentication
 * 2. Extract path parameter from query string
 * 3. List directory contents using file manager utility
 * 4. Return list of files and directories
 * 
 * AUTHENTICATION:
 * - Requires authenticated session
 * - All authenticated users can list files
 * 
 * PATH PARAMETER:
 * - Query parameter: "path" (optional, defaults to empty string = root)
 * - Relative path from uploads directory
 * - Example: ?path=documents/2024
 * - Empty path ("") lists root uploads directory
 * 
 * RESPONSE FORMAT:
 * ```json
 * {
 *   "items": [
 *     {
 *       "name": "file.pdf",
 *       "type": "file",
 *       "size": 1024,
 *       "path": "uploads/file.pdf"
 *     },
 *     {
 *       "name": "folder",
 *       "type": "directory",
 *       "path": "uploads/folder"
 *     }
 *   ]
 * }
 * ```
 * 
 * ITEM PROPERTIES:
 * - name: File or directory name
 * - type: "file" or "directory"
 * - size: File size in bytes (files only)
 * - path: Full relative path from project root
 * 
 * SECURITY:
 * - Path traversal protection (handled by listDirectory utility)
 * - Only lists files within uploads directory
 * - No access to files outside uploads directory
 * 
 * ERROR HANDLING:
 * - Unauthorized: 401 (no session)
 * - Internal Server Error: 500 (file system errors, invalid path)
 * 
 * NOTE:
 * This route uses the file-manager utility library for directory listing.
 * The utility handles path sanitization and security checks.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { listDirectory } from "@/lib/file-manager"

/**
 * GET HANDLER
 * 
 * Lists files and directories in the specified path.
 * 
 * PROCESS:
 * 1. Check authentication
 * 2. Extract path from query parameters
 * 3. List directory contents
 * 4. Return items list
 * 
 * @param request - Next.js request object with query parameters
 * @returns JSON response with directory items or error
 */
export async function GET(request: NextRequest) {
  try {
    /**
     * STEP 1: CHECK AUTHENTICATION
     * 
     * User must be authenticated to list files.
     * All authenticated users can access file manager.
     */
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    /**
     * STEP 2: EXTRACT PATH PARAMETER
     * 
     * Gets relative path from query parameters.
     * Defaults to empty string (root directory) if not provided.
     * 
     * PATH FORMAT:
     * - Relative path from uploads directory
     * - Example: "documents/2024" → "uploads/documents/2024"
     * - Empty string → "uploads/"
     */
    const { searchParams } = new URL(request.url)
    const relativePath = searchParams.get("path") || ""

    /**
     * STEP 3: LIST DIRECTORY CONTENTS
     * 
     * Uses file-manager utility to list directory.
     * 
     * WHAT IT DOES:
     * - Sanitizes path (prevents path traversal)
     * - Lists files and directories
     * - Returns metadata for each item
     * - Handles errors gracefully
     * 
     * RETURNS:
     * Array of items with name, type, size, and path properties.
     */
    const items = await listDirectory(relativePath)

    /**
     * STEP 4: RETURN DIRECTORY ITEMS
     * 
     * Returns list of files and directories.
     * Items are sorted (typically directories first, then files).
     */
    return NextResponse.json({ items })
  } catch (error) {
    /**
     * ERROR HANDLING
     * 
     * Catches and logs errors from directory listing.
     * Returns generic error message (doesn't expose internal details).
     */
    console.error("File manager list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


