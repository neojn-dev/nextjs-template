import path from "path"
import { promises as fs } from "fs"
import { existsSync } from "fs"

export const FILES_BASE_DIR = path.join(process.cwd(), "uploads", "files")

export function resolveSafePath(relativePath: string = ""): string {
  const normalized = path.normalize(relativePath).replace(/^\/+|\/+$/g, "")
  const fullPath = path.join(FILES_BASE_DIR, normalized)
  const resolved = path.resolve(fullPath)
  const baseResolved = path.resolve(FILES_BASE_DIR)
  if (!resolved.startsWith(baseResolved)) {
    throw new Error("Invalid path")
  }
  return resolved
}

export async function ensureBaseDir(): Promise<void> {
  if (!existsSync(FILES_BASE_DIR)) {
    await fs.mkdir(FILES_BASE_DIR, { recursive: true })
  }
}

export interface FileEntry {
  name: string
  path: string // relative to base
  type: "file" | "folder"
  size: number
  mimeType?: string
  modifiedAt: number
}

export async function listDirectory(relativePath: string = ""): Promise<FileEntry[]> {
  await ensureBaseDir()
  const dirPath = resolveSafePath(relativePath)
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const results: FileEntry[] = []
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)
    const stat = await fs.stat(entryPath)
    const isDir = entry.isDirectory()
    results.push({
      name: entry.name,
      path: path.join(relativePath, entry.name).replace(/\\/g, "/"),
      type: isDir ? "folder" : "file",
      size: isDir ? 0 : stat.size,
      modifiedAt: stat.mtimeMs,
    })
  }
  return results
}

export async function createFolder(parentRelativePath: string, name: string): Promise<void> {
  await ensureBaseDir()
  const dir = resolveSafePath(path.join(parentRelativePath, name))
  await fs.mkdir(dir, { recursive: true })
}

export async function deleteFolder(relativePath: string): Promise<void> {
  const dir = resolveSafePath(relativePath)
  await fs.rm(dir, { recursive: true, force: true })
}

export async function renameOrMove(oldRelativePath: string, newRelativePath: string): Promise<void> {
  const src = resolveSafePath(oldRelativePath)
  const dest = resolveSafePath(newRelativePath)
  const destDir = path.dirname(dest)
  await fs.mkdir(destDir, { recursive: true })
  await fs.rename(src, dest)
}


