/**
 * DEBUG UTILITIES MODULE
 * 
 * Provides debugging utilities for server-side debugging in Next.js applications.
 * 
 * WHAT IT DOES:
 * - Enhanced console logging with timestamps and context
 * - Debug API requests and responses
 * - Debug database operations
 * - Debug authentication operations
 * - Performance debugging (measure execution time)
 * - Debug middleware execution
 * - Debug server-side rendering
 * - Debug breakpoints
 * - Debug error handling with stack traces
 * - Debug session state
 * 
 * DEVELOPMENT ONLY:
 * All functions check NODE_ENV and return early in production.
 * These utilities should NOT be included in production builds.
 * 
 * SECURITY FEATURES:
 * - Filters sensitive data (passwords, tokens)
 * - Only logs in development mode
 * - Safe data structures for logging
 * 
 * USAGE:
 * ```typescript
 * import { debugLog, debugAPI, debugDB } from '@/lib/debug-utils'
 * 
 * debugLog('info', 'MyComponent', 'Component rendered')
 * debugAPI('POST', '/api/users', requestData, responseData)
 * debugDB('create', 'User', userData, result)
 * ```
 * 
 * OR USE DEBUG OBJECT:
 * ```typescript
 * import { debug } from '@/lib/debug-utils'
 * 
 * debug.log('info', 'Context', 'Message')
 * debug.api('POST', '/api/users', data, response)
 * debug.db('create', 'User', data, result)
 * ```
 */

/**
 * DEBUG LEVEL TYPE
 * 
 * Defines valid debug log levels.
 * 
 * LEVELS:
 * - info: Informational messages
 * - warn: Warning messages
 * - error: Error messages
 * - debug: Debug messages (most verbose)
 */
type DebugLevel = 'info' | 'warn' | 'error' | 'debug'

/**
 * DEBUG LOG FUNCTION
 * 
 * Enhanced console logging with timestamps and context.
 * 
 * WHAT IT DOES:
 * - Adds timestamp to log messages
 * - Adds log level prefix
 * - Adds context information
 * - Adds emoji indicators for visual scanning
 * - Only logs in development mode
 * 
 * FORMAT:
 * [TIMESTAMP] [LEVEL] [CONTEXT] Message Data
 * 
 * EMOJI INDICATORS:
 * - 🔴 Error (red)
 * - 🟡 Warning (yellow)
 * - 🔵 Info (blue)
 * - 🟣 Debug (purple)
 * 
 * @param level - Debug level (info, warn, error, debug)
 * @param context - Context identifier (e.g., component name, API route)
 * @param message - Log message
 * @param data - Optional data to log
 * 
 * EXAMPLE:
 * ```typescript
 * debugLog('info', 'UserService', 'User created', { userId: '123' })
 * // Output: [2024-01-01T00:00:00.000Z] [INFO] [UserService] 🔵 User created { userId: '123' }
 * ```
 */
export function debugLog(level: DebugLevel, context: string, message: string, data?: any) {
  /**
   * PRODUCTION CHECK
   * 
   * Returns early if in production mode.
   * Prevents logging in production builds.
   */
  if (process.env.NODE_ENV === 'production') return

  /**
   * TIMESTAMP GENERATION
   * 
   * Creates ISO timestamp for log entry.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`
  
  /**
   * LOG LEVEL ROUTING
   * 
   * Routes to appropriate console method based on level.
   * Adds emoji indicator for visual scanning.
   */
  switch (level) {
    case 'error':
      console.error(`🔴 ${prefix}`, message, data || '')
      break
    case 'warn':
      console.warn(`🟡 ${prefix}`, message, data || '')
      break
    case 'info':
      console.info(`🔵 ${prefix}`, message, data || '')
      break
    case 'debug':
      console.debug(`🟣 ${prefix}`, message, data || '')
      break
  }
}

/**
 * DEBUG API FUNCTION
 * 
 * Debugs API requests and responses.
 * 
 * WHAT IT DOES:
 * - Logs HTTP method and URL
 * - Logs request data (if provided)
 * - Logs response data (if provided)
 * - Uses debug context 'API'
 * 
 * USE CASE:
 * Debug API route handlers and fetch calls.
 * 
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - Request URL
 * @param data - Optional request data
 * @param response - Optional response data
 * 
 * EXAMPLE:
 * ```typescript
 * debugAPI('POST', '/api/users', { username: 'john' }, { id: '123' })
 * ```
 */
export function debugAPI(method: string, url: string, data?: any, response?: any) {
  if (process.env.NODE_ENV === 'production') return

  debugLog('info', 'API', `${method} ${url}`)
  
  if (data) {
    debugLog('debug', 'API-REQUEST', 'Request data:', data)
  }
  
  if (response) {
    debugLog('debug', 'API-RESPONSE', 'Response data:', response)
  }
}

/**
 * DEBUG DATABASE FUNCTION
 * 
 * Debugs database operations.
 * 
 * WHAT IT DOES:
 * - Logs operation type (create, update, delete, etc.)
 * - Logs table name
 * - Logs operation data (if provided)
 * - Logs operation result (if provided)
 * - Uses debug context 'DATABASE'
 * 
 * USE CASE:
 * Debug Prisma database operations.
 * 
 * @param operation - Operation type (create, update, delete, find, etc.)
 * @param table - Table/model name
 * @param data - Optional operation data
 * @param result - Optional operation result
 * 
 * EXAMPLE:
 * ```typescript
 * debugDB('create', 'User', { username: 'john' }, { id: '123' })
 * ```
 */
export function debugDB(operation: string, table: string, data?: any, result?: any) {
  if (process.env.NODE_ENV === 'production') return

  debugLog('info', 'DATABASE', `${operation} on ${table}`)
  
  if (data) {
    debugLog('debug', 'DB-DATA', 'Operation data:', data)
  }
  
  if (result) {
    debugLog('debug', 'DB-RESULT', 'Operation result:', result)
  }
}

/**
 * DEBUG AUTHENTICATION FUNCTION
 * 
 * Debugs authentication operations.
 * 
 * WHAT IT DOES:
 * - Logs authentication operation
 * - Logs user data (safe, filtered)
 * - Logs session data (if provided)
 * - Uses debug context 'AUTH'
 * 
 * SECURITY:
 * Filters sensitive data (passwords, tokens) from user object.
 * Only logs safe user fields (id, username, email, role).
 * 
 * @param operation - Operation type (signin, signout, verify, etc.)
 * @param user - Optional user object (filtered for security)
 * @param session - Optional session object
 * 
 * EXAMPLE:
 * ```typescript
 * debugAuth('signin', { id: '123', username: 'john' }, session)
 * ```
 */
export function debugAuth(operation: string, user?: any, session?: any) {
  if (process.env.NODE_ENV === 'production') return

  debugLog('info', 'AUTH', `Authentication: ${operation}`)
  
  if (user) {
    /**
     * SAFE USER DATA FILTERING
     * 
     * Filters out sensitive fields before logging.
     * Only includes: id, username, email, role.
     * 
     * SECURITY:
     * Never logs passwords, tokens, or other sensitive data.
     */
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
    debugLog('debug', 'AUTH-USER', 'User data:', safeUser)
  }
  
  if (session) {
    debugLog('debug', 'AUTH-SESSION', 'Session data:', session)
  }
}

/**
 * DEBUG PERFORMANCE FUNCTION
 * 
 * Measures execution time of a function.
 * 
 * WHAT IT DOES:
 * - Measures execution time before and after function call
 * - Logs start and completion times
 * - Handles both sync and async functions
 * - Logs errors if function fails
 * 
 * USE CASE:
 * Debug slow operations, identify performance bottlenecks.
 * 
 * @param label - Label for the operation (used in logs)
 * @param fn - Function to measure (can be sync or async)
 * @returns Result of function call (preserves return value)
 * 
 * EXAMPLE:
 * ```typescript
 * const result = await debugPerformance('Database Query', async () => {
 *   return await db.user.findMany()
 * })
 * ```
 */
export function debugPerformance<T>(
  label: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  if (process.env.NODE_ENV === 'production') {
    return fn()
  }

  /**
   * START TIMER
   * 
   * Uses performance.now() for high-resolution timing.
   * More accurate than Date.now() for measuring execution time.
   */
  const start = performance.now()
  debugLog('debug', 'PERF', `Starting: ${label}`)
  
  /**
   * EXECUTE FUNCTION
   * 
   * Calls function and captures result.
   */
  const result = fn()
  
  /**
   * HANDLE ASYNC FUNCTION
   * 
   * If function returns Promise, measure async execution time.
   */
  if (result instanceof Promise) {
    return result.then((value) => {
      const end = performance.now()
      const duration = (end - start).toFixed(2)
      debugLog('info', 'PERF', `Completed: ${label} (${duration}ms)`)
      return value
    }).catch((error) => {
      const end = performance.now()
      const duration = (end - start).toFixed(2)
      debugLog('error', 'PERF', `Failed: ${label} (${duration}ms)`, error)
      throw error
    })
  } else {
    /**
     * HANDLE SYNC FUNCTION
     * 
     * If function is synchronous, measure immediately.
     */
    const end = performance.now()
    const duration = (end - start).toFixed(2)
    debugLog('info', 'PERF', `Completed: ${label} (${duration}ms)`)
    return result
  }
}

/**
 * DEBUG MIDDLEWARE FUNCTION
 * 
 * Debugs middleware execution.
 * 
 * WHAT IT DOES:
 * - Logs HTTP method and path
 * - Logs relevant headers (filtered for security)
 * - Uses debug context 'MIDDLEWARE'
 * 
 * SECURITY:
 * Only logs safe headers (user-agent, content-type, etc.).
 * Filters out sensitive headers (authorization, cookies, etc.).
 * 
 * @param path - Request path
 * @param method - HTTP method
 * @param headers - Optional request headers (filtered)
 * 
 * EXAMPLE:
 * ```typescript
 * debugMiddleware('/api/users', 'GET', request.headers)
 * ```
 */
export function debugMiddleware(path: string, method: string, headers?: any) {
  if (process.env.NODE_ENV === 'production') return

  debugLog('info', 'MIDDLEWARE', `${method} ${path}`)
  
  if (headers) {
    /**
     * SAFE HEADERS FILTERING
     * 
     * Only logs non-sensitive headers.
     * Filters out authorization, cookies, etc.
     */
    const safeHeaders = {
      'user-agent': headers['user-agent'],
      'content-type': headers['content-type'],
      'accept': headers['accept'],
      'referer': headers['referer']
    }
    debugLog('debug', 'MIDDLEWARE-HEADERS', 'Request headers:', safeHeaders)
  }
}

/**
 * DEBUG SSR FUNCTION
 * 
 * Debugs server-side rendering operations.
 * 
 * WHAT IT DOES:
 * - Logs component being rendered
 * - Logs component props (if provided)
 * - Logs render context (if provided)
 * - Uses debug context 'SSR'
 * 
 * USE CASE:
 * Debug Next.js Server Components and Server-Side Rendering.
 * 
 * @param component - Component name
 * @param props - Optional component props
 * @param context - Optional render context
 * 
 * EXAMPLE:
 * ```typescript
 * debugSSR('UserProfile', { userId: '123' }, { locale: 'en' })
 * ```
 */
export function debugSSR(component: string, props?: any, context?: any) {
  if (process.env.NODE_ENV === 'production') return

  debugLog('info', 'SSR', `Rendering: ${component}`)
  
  if (props) {
    debugLog('debug', 'SSR-PROPS', 'Component props:', props)
  }
  
  if (context) {
    debugLog('debug', 'SSR-CONTEXT', 'Render context:', context)
  }
}

/**
 * DEBUG BREAKPOINT FUNCTION
 * 
 * Conditional debugger statement.
 * 
 * WHAT IT DOES:
 * - Pauses execution at debugger statement (if condition met)
 * - Logs optional message
 * - Only works in development mode
 * 
 * USE CASE:
 * Set conditional breakpoints in code.
 * Useful for debugging specific conditions.
 * 
 * @param condition - Optional condition (if true or undefined, breaks)
 * @param message - Optional message to log before breaking
 * 
 * EXAMPLE:
 * ```typescript
 * debugBreakpoint(userId === '123', 'Debugging user 123')
 * ```
 */
export function debugBreakpoint(condition?: boolean, message?: string) {
  if (process.env.NODE_ENV === 'production') return
  
  /**
   * CONDITIONAL BREAKPOINT
   * 
   * Breaks if condition is undefined (always break) or true.
   * Logs message if provided.
   */
  if (condition === undefined || condition) {
    if (message) {
      debugLog('debug', 'BREAKPOINT', message)
    }
    // eslint-disable-next-line no-debugger
    debugger // Pauses execution in browser DevTools
  }
}

/**
 * DEBUG ERROR FUNCTION
 * 
 * Debugs errors with stack traces.
 * 
 * WHAT IT DOES:
 * - Logs error message
 * - Logs error stack trace
 * - Logs additional data (if provided)
 * - Uses debug context for categorization
 * 
 * USE CASE:
 * Enhanced error logging with context.
 * 
 * @param error - Error object
 * @param context - Context identifier
 * @param additionalData - Optional additional data
 * 
 * EXAMPLE:
 * ```typescript
 * try {
 *   // code
 * } catch (error) {
 *   debugError(error, 'UserService', { userId: '123' })
 * }
 * ```
 */
export function debugError(error: Error, context: string, additionalData?: any) {
  if (process.env.NODE_ENV === 'production') return

  debugLog('error', context, `Error: ${error.message}`)
  debugLog('error', context, `Stack: ${error.stack}`)
  
  if (additionalData) {
    debugLog('error', context, 'Additional data:', additionalData)
  }
}

/**
 * DEBUG SESSION FUNCTION
 * 
 * Debugs session state.
 * 
 * WHAT IT DOES:
 * - Checks if session exists
 * - Logs safe session data (user info, expires)
 * - Filters sensitive session data
 * - Uses debug context 'SESSION'
 * 
 * SECURITY:
 * Only logs safe session fields.
 * Filters out tokens, secrets, etc.
 * 
 * @param session - Session object
 * @param context - Optional context identifier (defaults to 'SESSION')
 * 
 * EXAMPLE:
 * ```typescript
 * debugSession(session, 'AuthCheck')
 * ```
 */
export function debugSession(session: any, context: string = 'SESSION') {
  if (process.env.NODE_ENV === 'production') return

  /**
   * CHECK IF SESSION EXISTS
   * 
   * Logs warning if session is null/undefined.
   */
  if (!session) {
    debugLog('warn', context, 'No session found')
    return
  }

  /**
   * SAFE SESSION DATA FILTERING
   * 
   * Filters sensitive session data.
   * Only includes: user (filtered), expires.
   */
  const safeSession = {
    user: session.user ? {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role
    } : null,
    expires: session.expires
  }

  debugLog('info', context, 'Session state:', safeSession)
}

/**
 * DEBUG OBJECT EXPORT
 * 
 * Provides convenient object with all debug utilities.
 * 
 * BENEFITS:
 * - Single import for all utilities
 * - Cleaner API
 * - Easier to use
 * 
 * USAGE:
 * ```typescript
 * import { debug } from '@/lib/debug-utils'
 * 
 * debug.log('info', 'Context', 'Message')
 * debug.api('POST', '/api/users', data, response)
 * debug.db('create', 'User', data, result)
 * debug.auth('signin', user, session)
 * debug.perf('Operation', () => { // your code here })
 * debug.middleware('/api/users', 'GET', headers)
 * debug.ssr('Component', props, context)
 * debug.breakpoint(true, 'Message')
 * debug.error(error, 'Context', data)
 * debug.session(session, 'Context')
 * ```
 */
export const debug = {
  log: debugLog,
  api: debugAPI,
  db: debugDB,
  auth: debugAuth,
  perf: debugPerformance,
  middleware: debugMiddleware,
  ssr: debugSSR,
  breakpoint: debugBreakpoint,
  error: debugError,
  session: debugSession
}
