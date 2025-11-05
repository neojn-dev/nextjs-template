/**
 * CONFIGURATION MODULE
 * 
 * This module provides type-safe access to environment variables.
 * 
 * WHY THIS APPROACH?
 * - Environment variables are strings by default (process.env)
 * - We need typed, validated configuration
 * - Missing/invalid env vars should fail fast at startup
 * - Centralized configuration makes it easier to manage
 * 
 * HOW IT WORKS:
 * 1. Define Zod schema for all environment variables
 * 2. Parse and validate environment variables at module load
 * 3. Export validated, typed configuration object
 * 4. If any env var is missing/invalid, app won't start (fail fast)
 * 
 * BENEFITS:
 * - Type safety: TypeScript knows the types
 * - Validation: Catches configuration errors early
 * - Centralized: All config in one place
 * - Server-only: Can't accidentally import in client code
 * 
 * USAGE:
 * ```typescript
 * import { config } from '@/lib/config'
 * const dbUrl = config.database.url
 * ```
 */

// 'server-only' prevents this module from being imported in client components
// This is important because environment variables shouldn't be exposed to the browser
import 'server-only'
import { z } from "zod"

/**
 * ENVIRONMENT VARIABLE SCHEMA
 * 
 * Defines all required environment variables and their validation rules.
 * 
 * Zod schema validation ensures:
 * - Required variables are present
 * - Types are correct (string, email, URL, etc.)
 * - Values meet minimum requirements
 * 
 * WHAT EACH VARIABLE IS FOR:
 * - DATABASE_URL: MySQL connection string
 * - NEXTAUTH_SECRET: Secret key for JWT signing (should be random)
 * - NEXTAUTH_URL: Base URL of the application
 * - SMTP_*: Email server configuration
 * - APP_NAME/APP_URL: Application metadata
 * - ENABLE_WORKFLOWS: Feature flag for workflow system
 */
const envSchema = z.object({
  // Database connection string (required)
  DATABASE_URL: z.string().min(1),
  
  // NextAuth secret for JWT signing (required, generate with: openssl rand -base64 32)
  NEXTAUTH_SECRET: z.string().min(1),
  
  // Application base URL (must be valid URL)
  NEXTAUTH_URL: z.string().url(),
  
  // Email server configuration (SMTP)
  SMTP_HOST: z.string().min(1), // e.g., "smtp.gmail.com"
  SMTP_PORT: z.string().min(1), // e.g., "587"
  SMTP_SECURE: z.string(), // "true" or "false" (as string)
  SMTP_USER: z.string().email(), // Email address for SMTP auth
  SMTP_PASS: z.string().min(1), // Password or app password
  FROM_EMAIL: z.string().email(), // Email address to send from
  
  // Application metadata (with defaults)
  APP_NAME: z.string().default("NextJS Template App"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  
  // Feature flags (optional, defaults to "true")
  ENABLE_WORKFLOWS: z.string().optional().default("true"),
})

/**
 * VALIDATED ENVIRONMENT VARIABLES
 * 
 * Parse and validate all environment variables at module load.
 * 
 * If validation fails:
 * - Zod throws an error with details
 * - Application won't start
 * - Error message shows which env vars are missing/invalid
 * 
 * This is "fail fast" - better to fail at startup than later with cryptic errors
 */
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  ENABLE_WORKFLOWS: process.env.ENABLE_WORKFLOWS,
})

/**
 * CONFIGURATION OBJECT
 * 
 * Provides organized, typed access to configuration values.
 * 
 * STRUCTURE:
 * - app: Application metadata (name, URL)
 * - features: Feature flags (workflows enabled/disabled)
 * - auth: Authentication configuration (secret, URL)
 * - database: Database configuration (connection URL)
 * - email: Email server configuration (SMTP settings)
 * 
 * USAGE EXAMPLES:
 * ```typescript
 * config.app.name // "NextJS Template App"
 * config.database.url // "mysql://user:pass@host:3306/db"
 * config.email.host // "smtp.gmail.com"
 * config.features.workflows // true or false
 * ```
 */
export const config = {
  // Application metadata
  app: {
    name: env.APP_NAME,
    url: env.APP_URL,
  },
  
  // Feature flags (convert string "true"/"false" to boolean)
  features: {
    workflows: env.ENABLE_WORKFLOWS === "true",
  },
  
  // Authentication configuration
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },
  
  // Database configuration
  database: {
    url: env.DATABASE_URL,
  },
  
  // Email server configuration
  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT), // Convert string to number
    secure: env.SMTP_SECURE === "true", // Convert string to boolean
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.FROM_EMAIL,
  },
}
