/**
 * ROOT LAYOUT COMPONENT
 * 
 * This is the root layout for the entire Next.js application.
 * It wraps all pages and provides the basic HTML structure.
 * 
 * WHAT IS A ROOT LAYOUT?
 * - Required in Next.js App Router
 * - Provides <html> and <body> tags
 * - Wraps all pages in the application
 * - Shared across all routes
 * 
 * KEY FEATURES:
 * - HTML structure: <html> and <body> tags
 * - Font loading: Inter font from Google Fonts
 * - Session provider: Makes NextAuth session available to all components
 * - Global styles: Imports global CSS
 * - Metadata: SEO and social media meta tags
 * 
 * IMPORTANT NOTES:
 * - This layout is shared by ALL routes
 * - Auth routes have their own layout (app/(auth)/layout.tsx)
 * - App routes have their own layout (app/(app)/layout.tsx)
 * - This layout provides the base structure
 * 
 * SESSION PROVIDER:
 * Wraps entire app with SessionProviderWrapper to make session data
 * available to all client components via useSession() hook.
 */

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProviderWrapper } from "@/components/providers/session-provider"
import "@/styles/globals.css"

/**
 * INTER FONT LOADING
 * 
 * Loads Inter font from Google Fonts.
 * 
 * WHAT IT DOES:
 * - Fetches Inter font from Google Fonts CDN
 * - Optimizes font loading (Next.js optimization)
 * - Provides className for applying font
 * 
 * WHY INTER?
 * - Modern, clean sans-serif font
 * - Excellent readability
 * - Professional appearance
 * - Widely used in modern web apps
 * 
 * SUBSETS:
 * - ["latin"]: Loads Latin character set
 * - Reduces font file size
 * - Faster loading times
 */
const inter = Inter({ subsets: ["latin"] })

/**
 * METADATA EXPORT
 * 
 * Defines SEO and social media metadata for the application.
 * 
 * WHAT IT DOES:
 * - Sets page title and description
 * - Configures Open Graph tags (Facebook, LinkedIn)
 * - Configures Twitter Card tags
 * - Sets robots meta tags (SEO)
 * 
 * METADATA INCLUDES:
 * - metadataBase: Base URL for all metadata URLs
 * - title: Page title (shown in browser tab)
 * - description: Page description (SEO, social sharing)
 * - keywords: SEO keywords
 * - openGraph: Social media sharing tags
 * - twitter: Twitter Card tags
 * - robots: Search engine indexing rules
 */
export const metadata: Metadata = {
  // Base URL for all metadata URLs
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  
  // Page title (shown in browser tab)
  title: "NextJS Template App",
  
  // Page description (used in SEO and social sharing)
  description: "A production-ready NextJS template with authentication, data management, and modern UI",
  
  // SEO keywords
  keywords: ["nextjs", "typescript", "prisma", "tailwind", "shadcn"],
  
  // Author information
  authors: [{ name: "Template App" }],
  creator: "Template App",
  
  /**
   * OPEN GRAPH METADATA
   * 
   * Used for social media sharing (Facebook, LinkedIn, etc.).
   * When someone shares your site, these tags control how it appears.
   */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "http://localhost:3000",
    title: "NextJS Template App",
    description: "A production-ready NextJS template with authentication, data management, and modern UI",
    siteName: "NextJS Template App",
  },
  
  /**
   * TWITTER CARD METADATA
   * 
   * Used for Twitter sharing.
   * Controls how your site appears when shared on Twitter.
   */
  twitter: {
    card: "summary_large_image", // Large image card format
    title: "NextJS Template App",
    description: "A production-ready NextJS template with authentication, data management, and modern UI",
  },
  
  /**
   * ROBOTS METADATA
   * 
   * Controls search engine indexing.
   * - index: true - Allow indexing
   * - follow: true - Follow links
   * - googleBot: Specific rules for Google
   */
  robots: {
    index: true,    // Allow search engines to index
    follow: true,  // Allow search engines to follow links
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,      // No limit on video preview
      "max-image-preview": "large",  // Large image preview
      "max-snippet": -1,             // No limit on text snippet
    },
  },
}

/**
 * ROOT LAYOUT COMPONENT
 * 
 * The main layout component that wraps all pages.
 * 
 * STRUCTURE:
 * - <html>: Root HTML element
 * - <body>: Body element with font class
 * - SessionProviderWrapper: Provides session context
 * - {children}: Page content (rendered by Next.js)
 * 
 * PROPS:
 * - children: React.ReactNode - Page content to render
 * 
 * IMPORTANT ATTRIBUTES:
 * - lang="en": Sets language to English (accessibility)
 * - className={inter.className}: Applies Inter font
 * - suppressHydrationWarning: Prevents hydration warnings (common in Next.js)
 * 
 * SESSION PROVIDER:
 * Wraps entire app with SessionProviderWrapper to enable session access
 * in all client components via useSession() hook.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {/* Session Provider makes NextAuth session available to all components */}
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
