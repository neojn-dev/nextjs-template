/**
 * BUTTON COMPONENT
 * 
 * A reusable button component built with Radix UI and Tailwind CSS.
 * 
 * WHAT IT DOES:
 * - Provides consistent button styling across the application
 * - Supports multiple variants (default, destructive, outline, secondary, ghost, link)
 * - Supports multiple sizes (default, sm, lg, icon)
 * - Supports asChild prop for composition (Radix UI Slot pattern)
 * 
 * FEATURES:
 * - Type-safe variants using class-variance-authority (cva)
 * - Accessible by default (Radix UI primitives)
 * - Focus-visible styles for keyboard navigation
 * - Disabled state handling
 * - Customizable via className prop
 * 
 * VARIANTS:
 * - default: Primary button (bg-primary, text-primary-foreground)
 * - destructive: Danger/delete button (bg-destructive, text-destructive-foreground)
 * - outline: Outlined button (border, transparent background)
 * - secondary: Secondary button (bg-secondary, text-secondary-foreground)
 * - ghost: Ghost button (no background, hover effect)
 * - link: Link-style button (text with underline)
 * 
 * SIZES:
 * - default: h-10, px-4, py-2
 * - sm: h-9, px-3
 * - lg: h-11, px-8
 * - icon: h-10, w-10 (square button for icons)
 * 
 * ASCHILD PROP:
 * When asChild={true}, renders as child component instead of button.
 * Useful for composition (e.g., wrapping Link component).
 * 
 * USAGE:
 * ```tsx
 * import { Button } from '@/components/ui/button'
 * 
 * <Button variant="default" size="lg">Click me</Button>
 * <Button variant="destructive" size="sm">Delete</Button>
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * BUTTON VARIANTS CONFIGURATION
 * 
 * Uses class-variance-authority (cva) to define button variants.
 * 
 * BASE CLASSES:
 * - inline-flex: Display as inline flex
 * - items-center: Vertical centering
 * - justify-center: Horizontal centering
 * - whitespace-nowrap: Prevent text wrapping
 * - rounded-md: Rounded corners
 * - text-sm: Small text size
 * - font-medium: Medium font weight
 * - ring-offset-background: Ring offset color
 * - transition-colors: Smooth color transitions
 * - focus-visible:outline-none: Remove default outline
 * - focus-visible:ring-2: Focus ring
 * - focus-visible:ring-ring: Ring color
 * - focus-visible:ring-offset-2: Ring offset
 * - disabled:pointer-events-none: Disable pointer events when disabled
 * - disabled:opacity-50: Reduce opacity when disabled
 * 
 * VARIANTS:
 * Each variant has its own color scheme and hover states.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * BUTTON PROPS INTERFACE
 * 
 * Extends HTML button attributes and adds variant props.
 * 
 * PROPERTIES:
 * - All standard HTML button attributes (onClick, disabled, etc.)
 * - variant: Button variant (from buttonVariants)
 * - size: Button size (from buttonVariants)
 * - asChild: Use Slot pattern for composition
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * BUTTON COMPONENT
 * 
 * Forwarded ref component for button element.
 * 
 * HOW IT WORKS:
 * 1. Merges variant and size classes with className
 * 2. Uses Slot if asChild is true, otherwise uses button element
 * 3. Forwards ref for imperative handle access
 * 4. Spreads all other props to button element
 * 
 * @param className - Additional CSS classes
 * @param variant - Button variant (default, destructive, etc.)
 * @param size - Button size (default, sm, lg, icon)
 * @param asChild - Use Slot pattern
 * @param props - All other HTML button attributes
 * @param ref - Ref forwarded to button element
 * 
 * DISPLAY NAME:
 * Required for React DevTools debugging.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    /**
     * COMPONENT SELECTION
     * 
     * Uses Slot if asChild is true, otherwise uses button element.
     * Slot allows composition with other components (e.g., Link).
     */
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
