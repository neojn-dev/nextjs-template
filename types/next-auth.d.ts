import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      role: string
      roleId?: string | null
      createdAt?: Date
    } & DefaultSession["user"]
    rememberMe?: boolean
  }

  interface User extends DefaultUser {
    username: string
    role: string
    roleId?: string | null
    profileImage?: string | null
    createdAt?: Date
    rememberMe?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    username: string
    role: string
    roleId?: string | null
    profileImage?: string | null
    createdAt?: Date
    rememberMe?: boolean
  }
}
