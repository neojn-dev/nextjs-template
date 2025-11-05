/**
 * FILE MANAGER UTILITIES MODULE
 * 
 * Provides server-side file system operations for file management.
 * 
 * WHAT IT DOES:
 * - Lists files and folders in uploads directory
 * - Creates folders
 * - Deletes files and folders
 * - Renames/moves files and folders
 * - Path resolution with security checks
 * 
 * SECURITY FEATURES:
 * - Path traversal prevention (prevents ../ attacks)
 * - Base directory restriction
 * - Safe path resolution
 * 
 * FILE STRUCTURE:
 * Files are stored in: uploads/files/
 * This directory is created automatically if it doesn't exist.
 * 
 * PATH HANDLING:
 * - All paths are relative to FILES_BASE_DIR
 * - Absolute paths are resolved and validated
 * - Prevents access outside base directory
 * 
 * USAGE:
 * ```typescript
 * import { listDirectory, createFolder } from '@/lib/file-manager'
 * 
 * const files = await listDirectory('documents')
 * await createFolder('documents', 'new-folder')
 * ```
 */

import path from "path"
import { promises as fs } from "fs"
import { existsSync } from "fs"

/**
 * FILES BASE DIRECTORY
 * 
 * Base directory for all file uploads.
 * Located in: project-root/uploads/files/
 * 
 * STRUCTURE:
 * uploads/
 *   files/
 *     documents/
 *     images/
 *     ...
 * 
 * WHY THIS LOCATION?
 * - Outside of app directory (not exposed via web)
 * - Easy to backup
 * - Can be moved to external storage later
 */
export const FILES_BASE_DIR = path.join(process.cwd(), "uploads", "files")

/**
 * RESOLVE SAFE PATH FUNCTION
 * 
 * Resolves and validates file paths safely.
 * 
 * SECURITY FEATURES:
 * - Prevents path traversal attacks (../)
 * - Ensures path stays within base directory
 * - Normalizes path separators
 * 
 * HOW IT WORKS:
 * 1. Normalize path (removes .., ./, etc.)
 * 2. Remove leading/trailing slashes
 * 3. Join with base directory
 * 4. Resolve to absolute path
 * 5. Verify it's within base directory
 * 
 * PATH TRAVERSAL PREVENTION:
 * If resolved path doesn't start with base directory,
 * it means user tried to access outside (e.g., ../etc/passwd).
 * 
 * @param relativePath - Relative path from base directory
 * @returns Absolute resolved path
 * @throws Error if path is invalid (outside base directory)
 */
export function resolveSafePath(relativePath: string = ""): string {
  /**
   * STEP 1: NORMALIZE PATH
   * 
   * - Removes .. and . segments
   * - Normalizes slashes (Windows vs Unix)
   * - Removes leading/trailing slashes
   */
  const normalized = path.normalize(relativePath).replace(/^\/+|\/+$/g, "")
  
  /**
   * STEP 2: JOIN WITH BASE DIRECTORY
   * 
   * Combines base directory with normalized path.
   */
  const fullPath = path.join(FILES_BASE_DIR, normalized)
  
  /**
   * STEP 3: RESOLVE TO ABSOLUTE PATH
   * 
   * Converts to absolute path.
   * Handles . and .. properly.
   */
  const resolved = path.resolve(fullPath)
  const baseResolved = path.resolve(FILES_BASE_DIR)
  
  /**
   * STEP 4: VALIDATE PATH IS WITHIN BASE DIRECTORY
   * 
   * SECURITY CHECK:
   * If resolved path doesn't start with base directory,
   * it means path traversal attack was attempted.
   */
  if (!resolved.startsWith(baseResolved)) {
    throw new Error("Invalid path")
  }
  
  return resolved
}

/**
 * ENSURE BASE DIRECTORY EXISTS FUNCTION
 * 
 * Creates base directory if it doesn't exist.
 * 
 * WHY THIS?
 * - Directory might not exist on first run
 * - Ensures directory structure is ready
 * - Recursive creation (creates parent dirs if needed)
 * 
 * CALLED BY:
 * - listDirectory
 * - createFolder
 * - Other file operations
 */
export async function ensureBaseDir(): Promise<void> {
  if (!existsSync(FILES_BASE_DIR)) {
    await fs.mkdir(FILES_BASE_DIR, { recursive: true })
  }
}

/**
 * FILE ENTRY INTERFACE
 * 
 * Structure representing a file or folder entry.
 * 
 * PROPERTIES:
 * - name: File/folder name
 * - path: Relative path from base directory
 * - type: "file" or "folder"
 * - size: File size in bytes (0 for folders)
 * - mimeType: MIME type (optional, for files)
 * - modifiedAt: Last modification timestamp (milliseconds)
 */
export interface FileEntry {
  name: string
  path: string // relative to base
  type: "file" | "folder"
  size: number
  mimeType?: string
  modifiedAt: number
}

/**
 * LIST DIRECTORY FUNCTION
 * 
 * Lists all files and folders in a directory.
 * 
 * WHAT IT DOES:
 * 1. Ensures base directory exists
 * 2. Resolves safe path
 * 3. Reads directory entries
 * 4. Gets file stats (size, modified date)
 * 5. Returns structured file entries
 * 
 * @param relativePath - Relative path from base directory (empty = root)
 * @returns Array of file/folder entries
 */
export async function listDirectory(relativePath: string = ""): Promise<FileEntry[]> {
  await ensureBaseDir()
  const dirPath = resolveSafePath(relativePath)
  
  /**
   * READ DIRECTORY ENTRIES
   * 
   * withFileTypes: true returns Dirent objects instead of strings.
   * Allows distinguishing files from directories.
   */
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const results: FileEntry[] = []
  
  /**
   * PROCESS EACH ENTRY
   * 
   * For each entry:
   * 1. Get full path
   * 2. Get file stats (size, modified date)
   * 3. Determine if file or folder
   * 4. Build FileEntry object
   */
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)
    const stat = await fs.stat(entryPath)
    const isDir = entry.isDirectory()
    
    results.push({
      name: entry.name,
      path: path.join(relativePath, entry.name).replace(/\\/g, "/"), // Normalize to forward slashes
      type: isDir ? "folder" : "file",
      size: isDir ? 0 : stat.size, // Folders have size 0
      modifiedAt: stat.mtimeMs, // Last modification time in milliseconds
    })
  }
  
  return results
}

/**
 * CREATE FOLDER FUNCTION
 * 
 * Creates a new folder in the specified parent directory.
 * 
 * WHAT IT DOES:
 * 1. Ensures base directory exists
 * 2. Resolves safe path for new folder
 * 3. Creates directory (recursive if needed)
 * 
 * RECURSIVE CREATION:
 * recursive: true creates parent directories if they don't exist.
 * 
 * @param parentRelativePath - Parent directory path (relative to base)
 * @param name - Name of new folder
 */
export async function createFolder(parentRelativePath: string, name: string): Promise<void> {
  await ensureBaseDir()
  const dir = resolveSafePath(path.join(parentRelativePath, name))
  await fs.mkdir(dir, { recursive: true })
}

/**
 * DELETE FOLDER FUNCTION
 * 
 * Deletes a folder and all its contents recursively.
 * 
 * SECURITY:
 * Uses resolveSafePath to ensure folder is within base directory.
 * 
 * FORCE OPTION:
 * force: true doesn't throw error if folder doesn't exist.
 * 
 * @param relativePath - Path to folder to delete (relative to base)
 */
export async function deleteFolder(relativePath: string): Promise<void> {
  const dir = resolveSafePath(relativePath)
  await fs.rm(dir, { recursive: true, force: true })
}

/**
 * RENAME OR MOVE FUNCTION
 * 
 * Renames or moves a file or folder.
 * 
 * WHAT IT DOES:
 * 1. Resolves safe paths for source and destination
 * 2. Creates destination directory if needed
 * 3. Moves/renames file or folder
 * 
 * USE CASES:
 * - Renaming a file
 * - Moving a file to different folder
 * - Renaming a folder
 * - Moving a folder
 * 
 * @param oldRelativePath - Current path (relative to base)
 * @param newRelativePath - New path (relative to base)
 */
export async function renameOrMove(oldRelativePath: string, newRelativePath: string): Promise<void> {
  const src = resolveSafePath(oldRelativePath)
  const dest = resolveSafePath(newRelativePath)
  const destDir = path.dirname(dest)
  
  // Create destination directory if it doesn't exist
  await fs.mkdir(destDir, { recursive: true })
  
  // Move/rename file or folder
  await fs.rename(src, dest)
}


