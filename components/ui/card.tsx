/**
 * CARD COMPONENT
 * 
 * A reusable card component built with React and Tailwind CSS.
 * 
 * WHAT IT DOES:
 * - Provides consistent card styling across the application
 * - Composable card structure (header, content, footer)
 * - Supports all card sub-components
 * 
 * COMPONENT STRUCTURE:
 * Card is composed of multiple sub-components:
 * - Card: Main container
 * - CardHeader: Header section (title + description)
 * - CardTitle: Title element
 * - CardDescription: Description text
 * - CardContent: Main content area
 * - CardFooter: Footer section (actions, buttons)
 * 
 * FEATURES:
 * - Type-safe props
 * - Forward refs for all components
 * - Customizable via className prop
 * - Uses design system colors (bg-card, text-card-foreground)
 * - Shadow styling for depth
 * 
 * USAGE:
 * ```tsx
 * import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
 * 
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 * ```
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * CARD COMPONENT
 * 
 * Main card container component.
 * 
 * STYLING:
 * - rounded-lg: Rounded corners
 * - border: Border
 * - bg-card: Background color from design system
 * - text-card-foreground: Text color from design system
 * - shadow-sm: Small shadow for depth
 * 
 * @param className - Additional CSS classes
 * @param props - All HTML div attributes
 * @param ref - Ref forwarded to div element
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CARD HEADER COMPONENT
 * 
 * Header section of the card.
 * Typically contains title and description.
 * 
 * STYLING:
 * - flex flex-col: Vertical flex layout
 * - space-y-1.5: Vertical spacing between children
 * - p-6: Padding
 * 
 * @param className - Additional CSS classes
 * @param props - All HTML div attributes
 * @param ref - Ref forwarded to div element
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CARD TITLE COMPONENT
 * 
 * Title element for the card.
 * 
 * STYLING:
 * - text-2xl: Large text size
 * - font-semibold: Semi-bold font weight
 * - leading-none: No line height
 * - tracking-tight: Tight letter spacing
 * 
 * @param className - Additional CSS classes
 * @param props - All HTML heading attributes
 * @param ref - Ref forwarded to h3 element
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CARD DESCRIPTION COMPONENT
 * 
 * Description text for the card.
 * 
 * STYLING:
 * - text-sm: Small text size
 * - text-muted-foreground: Muted text color from design system
 * 
 * @param className - Additional CSS classes
 * @param props - All HTML paragraph attributes
 * @param ref - Ref forwarded to p element
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CARD CONTENT COMPONENT
 * 
 * Main content area of the card.
 * 
 * STYLING:
 * - p-6: Padding
 * - pt-0: No top padding (header already has padding)
 * 
 * @param className - Additional CSS classes
 * @param props - All HTML div attributes
 * @param ref - Ref forwarded to div element
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CARD FOOTER COMPONENT
 * 
 * Footer section of the card.
 * Typically contains action buttons.
 * 
 * STYLING:
 * - flex: Flex layout
 * - items-center: Vertical centering
 * - p-6: Padding
 * - pt-0: No top padding (content already has padding)
 * 
 * @param className - Additional CSS classes
 * @param props - All HTML div attributes
 * @param ref - Ref forwarded to div element
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/**
 * EXPORT ALL CARD COMPONENTS
 * 
 * Exports all card-related components for use throughout the application.
 */
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
