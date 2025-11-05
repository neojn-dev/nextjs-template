/**
 * DATABASE CLIENT MODULE
 * 
 * This module exports a singleton Prisma Client instance.
 * 
 * WHY SINGLETON PATTERN?
 * Prisma Client instances manage database connections. Creating multiple instances
 * can lead to connection pool exhaustion and performance issues. This pattern ensures
 * only one instance exists across the entire application.
 * 
 * HOW IT WORKS:
 * 1. In development: Reuses the same instance across hot reloads
 * 2. In production: Creates a new instance
 * 3. Uses globalThis to store the instance (survives hot reloads)
 * 
 * DEVELOPMENT MODE:
 * - Next.js hot reloads can create multiple Prisma instances
 * - Storing in globalThis prevents "too many Prisma Clients" warning
 * - Each hot reload reuses the existing instance
 * 
 * PRODUCTION MODE:
 * - No hot reloading, so globalThis isn't needed
 * - Creates a fresh instance normally
 * 
 * USAGE:
 * ```typescript
 * import { db } from '@/lib/db'
 * const users = await db.user.findMany()
 * ```
 * 
 * IMPORTANT:
 * - Always import from this file, never create new PrismaClient() directly
 * - This ensures connection pooling works correctly
 * - Prevents database connection errors
 */

import { PrismaClient } from "@prisma/client"

/**
 * Global type definition for storing Prisma instance
 * 
 * In TypeScript, we need to tell the compiler that globalThis might have
 * a prisma property. This is a type assertion, not actual runtime code.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * PRISMA CLIENT INSTANCE
 * 
 * Creates or reuses Prisma Client instance:
 * - If instance exists in globalThis (development), reuse it
 * - Otherwise, create a new instance
 * 
 * The ?? operator (nullish coalescing) means:
 * "Use globalForPrisma.prisma if it exists, otherwise create new PrismaClient()"
 */
export const db = globalForPrisma.prisma ?? new PrismaClient()

/**
 * ALIAS EXPORT
 * 
 * Export as 'prisma' as well for convenience/backward compatibility
 * Some code might import as 'prisma' instead of 'db'
 */
export const prisma = db

/**
 * DEVELOPMENT MODE: Store instance in globalThis
 * 
 * This prevents Next.js hot reload from creating multiple Prisma instances.
 * Only runs in development (not production).
 * 
 * How it works:
 * - First import: Creates new PrismaClient, stores in globalThis.prisma
 * - Hot reload: Reuses globalThis.prisma instead of creating new instance
 * - Without this: Each hot reload would create a new instance, causing warnings
 */
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
