import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { config } from "@/lib/config"

/**
 * NEXTAUTH CONFIGURATION
 * 
 * This object configures NextAuth.js behavior:
 * - Providers: How users authenticate
 * - Session: How sessions are stored and managed
 * - JWT: How tokens are created and validated
 * - Callbacks: Customize token and session data
 * - Pages: Custom signin/error pages
 * - Cookies: Cookie security settings
 */
export const authOptions: NextAuthOptions = {
  /**
   * PRISMA ADAPTER
   * 
   * Connects NextAuth to Prisma database.
   * This allows NextAuth to:
   * - Store sessions in database (if using database sessions)
   * - Store OAuth accounts
   * - Manage verification tokens
   * 
   * Note: We use JWT sessions, but adapter still needed for OAuth/tokens
   */
  adapter: PrismaAdapter(db) as any,
  
  /**
   * AUTHENTICATION PROVIDERS
   * 
   * Defines how users can authenticate.
   * Currently supports credentials (username/password).
   * Can add OAuth providers (Google, GitHub, etc.) here.
   */
  providers: [
    /**
     * CREDENTIALS PROVIDER
     * 
     * Handles username/password authentication.
     * 
     * HOW IT WORKS:
     * 1. User submits username/email and password
     * 2. authorize() function is called
     * 3. Function validates credentials against database
     * 4. Returns user object if valid, null if invalid
     * 5. NextAuth creates session from returned user object
     */
    CredentialsProvider({
      name: "credentials", // Provider identifier
      
      // Define form fields (used by NextAuth UI, not our custom forms)
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      
      /**
       * AUTHORIZE FUNCTION
       * 
       * This is the core authentication logic.
       * Called when user tries to sign in.
       * 
       * STEP-BY-STEP:
       * 1. Validate credentials exist
       * 2. Find user by username OR email
       * 3. Check if email is verified
       * 4. Check if account is active
       * 5. Compare password with bcrypt
       * 6. Return user object if all checks pass
       * 
       * SECURITY CHECKS:
       * - Email verification required
       * - Account must be active
       * - Password compared securely with bcrypt
       * 
       * @param credentials - User's login credentials
       * @returns User object if authenticated, null if not
       */
      async authorize(credentials) {
        // Validate that credentials are provided
        // Return null early if missing (NextAuth will show error)
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        /**
         * FIND USER IN DATABASE
         * 
         * Search for user by username OR email (flexible login).
         * Uses Prisma's OR operator to check both fields.
         * 
         * Also includes role data so we can attach role to session.
         */
        const user = await db.user.findFirst({
          where: {
            OR: [
              { username: credentials.identifier }, // Try username first
              { email: credentials.identifier }, // Then try email
            ],
          },
          include: {
            role: {
              select: {
                id: true,
                name: true, // Role name (Admin, User, Manager, etc.)
                description: true,
              }
            }
          }
        })

        /**
         * SECURITY CHECKS
         * 
         * Multiple validation steps before allowing login:
         * 1. User must exist in database
         * 2. Email must be verified (prevents unverified accounts)
         * 3. Account must be active (prevents deactivated accounts)
         */
        if (!user || !user.emailVerified) {
          return null // User doesn't exist or email not verified
        }

        // Check if user account is active
        if (!user.isActive) {
          // Return null - account is deactivated
          // We check for this specifically in signin page to show helpful message
          return null
        }

        /**
         * PASSWORD VERIFICATION
         * 
         * bcrypt.compare() securely compares plain password with hashed password.
         * 
         * HOW BCRYPT WORKS:
         * - Passwords are hashed with salt (random data)
         * - Hash includes salt, so same password has different hash each time
         * - compare() extracts salt from hash and compares securely
         * - Protects against timing attacks
         * 
         * WHY NOT STORE PLAIN PASSWORDS?
         * - If database is compromised, passwords are still safe
         * - Hashing is one-way (can't reverse to get password)
         * - Each password has unique hash (even same password)
         */
        const isPasswordValid = await bcrypt.compare(
          credentials.password, // Plain text password from form
          user.passwordHash // Hashed password from database
        )

        if (!isPasswordValid) {
          return null // Password doesn't match
        }

        /**
         * RETURN USER OBJECT
         * 
         * This object becomes the "user" parameter in JWT callback.
         * Only include data needed for session (not sensitive data).
         * 
         * What gets stored in session:
         * - id: User's unique ID
         * - username: Username for display
         * - email: Email address
         * - role: User's role name
         * - roleId: Role ID for permission checks
         * - profileImage: Avatar URL
         * - createdAt: Account creation date
         * - rememberMe: Whether to extend session duration
         */
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role?.name || 'User', // Default to 'User' if no role
          roleId: user.roleId,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          rememberMe: credentials.rememberMe === "true", // Convert string to boolean
        }
      }
    })
  ],
  
  /**
   * SESSION CONFIGURATION
   * 
   * Controls how user sessions are managed.
   * 
   * strategy: "jwt"
   * - Sessions stored as JWT tokens (not in database)
   * - Faster (no database lookup)
   * - Stateless (can scale horizontally)
   * - Token contains user data (encrypted)
   * 
   * maxAge: 30 days
   * - Maximum session duration
   * - After this time, user must sign in again
   * - Measured in seconds (30 * 24 * 60 * 60)
   * 
   * updateAge: 24 hours
   * - How often to refresh session
   * - Keeps session fresh if user is active
   * - Prevents stale sessions
   */
  session: {
    strategy: "jwt", // Use JWT tokens instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 24 * 60 * 60, // Refresh every 24 hours
  },
  
  /**
   * JWT CONFIGURATION
   * 
   * Controls JWT token creation and validation.
   * 
   * maxAge: 30 days
   * - Token expiration time
   * - Matches session maxAge
   * - After expiration, user must sign in again
   */
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  /**
   * CALLBACKS
   * 
   * Customize token and session data.
   * These functions run at specific points in the auth flow.
   */
  callbacks: {
    /**
     * JWT CALLBACK
     * 
     * Called when:
     * - User signs in (creates token)
     * - Session is accessed (refreshes token)
     * - Session is updated (updates token data)
     * 
     * WHAT IT DOES:
     * 1. Adds user data to JWT token
     * 2. Sets token expiration based on "remember me"
     * 3. Updates profile image if session is updated
     * 
     * TOKEN CONTENT:
     * - User ID, username, email, role
     * - Profile image URL
     * - Account creation date
     * - Remember me preference
     * - Expiration timestamp
     */
    async jwt({ token, user, account, trigger }) {
      try {
        /**
         * SESSION UPDATE HANDLING
         * 
         * When trigger === "update", this means the session was manually updated
         * (e.g., user changed profile image). We fetch the latest data from database.
         * 
         * WHY FETCH FROM DATABASE?
         * - Token might have stale data
         * - Database is source of truth
         * - Ensures session reflects latest changes
         */
        if (trigger === "update") {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { profileImage: true }
          })
          if (dbUser) {
            token.profileImage = dbUser.profileImage // Update token with latest image
          }
        }
        
        /**
         * INITIAL TOKEN CREATION
         * 
         * When user object exists, this is the first time creating the token.
         * Happens immediately after successful login.
         * 
         * WHAT WE DO:
         * - Copy all user data to token
         * - Set expiration based on "remember me" preference
         * - Store role and permissions
         */
        if (user) {
          // Store user data in token
          token.id = user.id
          token.role = user.role
          token.roleId = user.roleId
          token.username = user.username
          token.profileImage = user.profileImage
          token.createdAt = user.createdAt
          token.rememberMe = user.rememberMe
          
          /**
           * TOKEN EXPIRATION SETTING
           * 
           * Set expiration based on "remember me" checkbox:
           * - Remember me checked: 30 days (long session)
           * - Remember me unchecked: 8 hours (short session)
           * 
           * WHY DIFFERENT EXPIRATIONS?
           * - Security: Short sessions for public computers
           * - Convenience: Long sessions for trusted devices
           * - User choice: Let user decide their security preference
           */
          if (user.rememberMe) {
            // Remember me: 30 days
            // Calculate: current time + (30 days * 24 hours * 60 minutes * 60 seconds)
            token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
          } else {
            // Session only: 8 hours (browser session)
            // Shorter expiration for better security
            token.exp = Math.floor(Date.now() / 1000) + (8 * 60 * 60)
          }
        }
        return token
      } catch (error) {
        // If error occurs, log warning but don't break authentication
        console.warn('JWT callback error:', error)
        return token
      }
    },
    
    /**
     * SESSION CALLBACK
     * 
     * Called when session is accessed (e.g., useSession() hook).
     * Transforms JWT token data into session object.
     * 
     * WHAT IT DOES:
     * 1. Reads data from JWT token
     * 2. Adds data to session.user object
     * 3. Makes session data available to components
     * 
     * SESSION OBJECT STRUCTURE:
     * - session.user.id: User ID
     * - session.user.username: Username
     * - session.user.email: Email address
     * - session.user.role: Role name
     * - session.user.image: Profile image URL
     * - session.rememberMe: Whether session should persist
     */
    async session({ session, token }) {
      try {
        /**
         * BUILD SESSION OBJECT
         * 
         * Transfer data from JWT token to session object.
         * This makes session data available to client components.
         * 
         * NOTE: We don't validate user status here for performance.
         * Session validation happens in middleware or API routes.
         */
        if (token && session?.user) {
          // Add custom fields to session.user
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.roleId = token.roleId as string | null
          session.user.username = token.username as string
          session.user.image = token.profileImage as string | null | undefined
          session.user.createdAt = token.createdAt as Date | undefined
          session.rememberMe = token.rememberMe as boolean
        }
        return session
      } catch (error) {
        // If error occurs, log warning but return session anyway
        console.warn('Session callback error:', error)
        return session
      }
    }
  },
  
  /**
   * CUSTOM PAGES
   * 
   * Redirects NextAuth to our custom pages instead of default ones.
   * 
   * signIn: "/signin"
   * - Use our custom signin page
   * - Matches our route structure
   * 
   * error: "/signin"
   * - Redirect errors to signin page
   * - Shows error message there
   */
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect errors to signin page
  },
  
  /**
   * SECRET KEY
   * 
   * Used to encrypt JWT tokens and cookies.
   * MUST be set in production!
   * 
   * Generate with: openssl rand -base64 32
   */
  secret: config.auth.secret,
  
  /**
   * DEBUG MODE
   * 
   * Set to false to reduce console noise.
   * Enable only for debugging authentication issues.
   */
  debug: false,
  
  /**
   * LOGGER CONFIGURATION
   * 
   * Suppresses NextAuth error/warning logs.
   * In production, we don't want auth errors cluttering console.
   * 
   * WHY SUPPRESS?
   * - 401 errors are expected when users aren't logged in
   * - Reduces noise in production logs
   * - Errors are handled gracefully in UI
   */
  logger: {
    error: () => {
      // Suppress all NextAuth errors
      return
    },
    warn: () => {
      // Suppress all NextAuth warnings
      return
    },
    debug: () => {
      // Suppress all NextAuth debug messages
      return
    }
  },
  
  /**
   * SECURE COOKIES
   * 
   * Only use secure cookies in production (HTTPS).
   * In development (HTTP), cookies work without secure flag.
   */
  useSecureCookies: process.env.NODE_ENV === "production",
  
  /**
   * COOKIE CONFIGURATION
   * 
   * Configures security settings for authentication cookies.
   * 
   * SECURITY FEATURES:
   * - httpOnly: Prevents JavaScript access (XSS protection)
   * - sameSite: CSRF protection
   * - secure: HTTPS only in production
   * - path: Cookie available for entire site
   * 
   * COOKIE TYPES:
   * - sessionToken: Main authentication cookie
   * - callbackUrl: Redirect URL after login
   * - csrfToken: CSRF protection token
   */
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token"  // Secure cookie prefix in production
        : "next-auth.session-token",            // Regular name in development
      options: {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        sameSite: "lax", // CSRF protection
        path: "/", // Available for entire site
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.callback-url" 
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Host-next-auth.csrf-token" // __Host- prefix requires secure and path=/
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}
