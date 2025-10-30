import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { config } from "@/lib/config"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        // Find user by username or email
        const user = await db.user.findFirst({
          where: {
            OR: [
              { username: credentials.identifier },
              { email: credentials.identifier },
            ],
          },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            }
          }
        })

        if (!user || !user.emailVerified) {
          return null
        }

        // Check if user account is active
        if (!user.isActive) {
          // Return null with a way to identify this specific case
          // We'll handle this in the signin page by checking the user's active status
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role?.name || 'User', // Use role name or default to 'User'
          roleId: user.roleId,
          profileImage: user.profileImage,
          rememberMe: credentials.rememberMe === "true",
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      try {
        // On session update trigger, fetch latest profileImage
        if (trigger === "update") {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { profileImage: true }
          })
          if (dbUser) {
            token.profileImage = dbUser.profileImage
          }
        }
        
        if (user) {
          token.id = user.id
          token.role = user.role
          token.roleId = user.roleId
          token.username = user.username
          token.profileImage = user.profileImage
          token.rememberMe = user.rememberMe
          
          // Set token expiration based on rememberMe preference
          if (user.rememberMe) {
            // Remember me: 30 days
            token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
          } else {
            // Session only: 8 hours (browser session)
            token.exp = Math.floor(Date.now() / 1000) + (8 * 60 * 60)
          }
        }
        return token
      } catch (error) {
        console.warn('JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token && session?.user) {
          // Validate that the user is still active (but don't do this on every request for performance)
          // Only check occasionally or skip for now since we have the data in the token
          
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.roleId = token.roleId as string | null
          session.user.username = token.username as string
          session.user.image = token.profileImage as string | null | undefined
          session.rememberMe = token.rememberMe as boolean
        }
        return session
      } catch (error) {
        console.warn('Session callback error:', error)
        return session
      }
    }
  },
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect errors to signin page
  },
  secret: config.auth.secret,
  debug: false, // Disable debug logging to reduce console noise
  logger: {
    error: () => {
      // Completely suppress all NextAuth errors to prevent console noise
      // In production, we don't want any NextAuth errors in the console
      // In development, 401 errors are expected when users aren't logged in
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
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Dynamic maxAge will be set based on rememberMe preference
        // Default to session cookie (no maxAge) - will be overridden by JWT exp
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}
