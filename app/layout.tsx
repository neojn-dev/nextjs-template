/**
 * ROOT LAYOUT - Global Layout for Entire Application
 * 
 * This is the top-level layout that wraps ALL pages in the application.
 * It provides:
 * - Global HTML structure (html, body tags)
 * - Global CSS imports
 * - Session provider for authentication
 * - Toast notifications
 * - Global metadata
 * 
 * Used by: ALL pages in the application
 */

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { SessionProviderWrapper } from "@/components/providers/session-provider"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "NextJS Template App",
  description: "A production-ready NextJS template with authentication, data management, and modern UI",
  keywords: ["nextjs", "typescript", "prisma", "tailwind", "shadcn"],
  authors: [{ name: "Template App" }],
  creator: "Template App",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "http://localhost:3000",
    title: "NextJS Template App",
    description: "A production-ready NextJS template with authentication, data management, and modern UI",
    siteName: "NextJS Template App",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextJS Template App",
    description: "A production-ready NextJS template with authentication, data management, and modern UI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
