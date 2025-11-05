/**
 * AUTHENTICATION LAYOUT COMPONENT
 * 
 * This is the layout wrapper for all authentication pages (signin, signup, verify, etc.)
 * It provides a consistent two-column layout structure:
 * - Left side: Decorative graphic component
 * - Right side: Authentication form (signin, signup, etc.)
 * 
 * HOW IT WORKS:
 * 1. This layout wraps all pages in the (auth) route group
 * 2. The `children` prop receives the actual page content (signin form, signup form, etc.)
 * 3. Styles are imported from lib/styles using the `auth` namespace
 * 4. The layout uses Next.js metadata API for SEO
 * 
 * KEY CONCEPTS:
 * - Route Groups: The (auth) folder is a route group - parentheses prevent it from being part of the URL
 * - Layout Nesting: This layout is nested inside the root layout (app/layout.tsx)
 * - Server Components: By default, this is a server component (no "use client" directive)
 * 
 * LEARN MORE:
 * - Next.js Layouts: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts
 * - Route Groups: https://nextjs.org/docs/app/building-your-application/routing/route-groups
 */

// Metadata for SEO and browser tab display
// This appears in search results and browser tabs
export const metadata = {
  title: 'Authentication - Next.js Template',
  description: 'Sign in, sign up, and manage your account',
}

// Import styling utilities from our centralized styles
// The `auth as a` syntax creates a shorter alias for cleaner code
import { auth as a } from "@/lib/styles"
// Import the decorative graphic component shown on the left side
import { AuthGraphic } from "@/components/website-components"

/**
 * AuthLayout Component
 * 
 * @param children - React node containing the page content (signin form, signup form, etc.)
 * 
 * STRUCTURE:
 * - Outer container: Full page wrapper with background styling
 * - Main: Main content area
 * - Split layout: Two-column design
 *   - Left: Graphic pane (decorative visual element)
 *   - Right: Form pane (actual authentication form)
 * 
 * VISUAL LAYOUT:
 * ┌─────────────────────────────────────┐
 * │  [Graphic]  │  [Form Content]      │
 * │             │  (children)          │
 * └─────────────────────────────────────┘
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Full page container with styling from lib/styles
    <div className={a.page}>
      {/* Main content area */}
      <main className={a.main}>
        {/* Two-column split layout */}
        <div className={a.split}>
          {/* LEFT COLUMN: Decorative graphic */}
          {/* This displays a visual element (logo, illustration, etc.) on the left side */}
          {/* The AuthGraphic component handles its own rendering */}
          <div className={a.graphicPane}>
            <AuthGraphic />
          </div>

          {/* RIGHT COLUMN: Authentication form */}
          {/* This is where the actual page content (signin, signup, etc.) appears */}
          {/* The children prop contains the page component */}
          <div className={a.formPane}>
            {/* Center the form vertically and horizontally */}
            <div className={a.formCenter}>
              {/* Constrain the form width for optimal readability */}
              {/* The form content (children) is rendered here */}
              <div className={a.formMax}>{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
