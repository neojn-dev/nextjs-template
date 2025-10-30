import 'server-only'
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_SECURE: z.string(),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  FROM_EMAIL: z.string().email(),
  APP_NAME: z.string().default("NextJS Template App"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  ENABLE_WORKFLOWS: z.string().optional().default("true"),
})

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

export const config = {
  app: {
    name: env.APP_NAME,
    url: env.APP_URL,
  },
  features: {
    workflows: env.ENABLE_WORKFLOWS === "true",
  },
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },
  database: {
    url: env.DATABASE_URL,
  },
  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    secure: env.SMTP_SECURE === "true",
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.FROM_EMAIL,
  },
}
