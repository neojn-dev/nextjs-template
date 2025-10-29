/**
 * ROOT LAYOUT - Application Root Layout
 * 
 * This is the root layout for the NextJS application.
 * Provides the basic HTML structure and session provider.
 * 
 * Note: Auth and app routes have their own layouts
 */

import type { Metadata } from "next"
import { Inter } from "next/font/google"
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
      <body className={inter.className} suppressHydrationWarning>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
