/**
 * LABEL COMPONENT
 * 
 * A reusable label component built with Radix UI and Tailwind CSS.
 * 
 * WHAT IT DOES:
 * - Provides accessible labels for form inputs
 * - Built on Radix UI Label primitive (accessibility)
 * - Supports variant styling (if needed)
 * 
 * FEATURES:
 * - Accessible by default (Radix UI primitives)
 * - Properly associates with form inputs
 * - Disabled state handling (when input is disabled)
 * - Customizable via className prop
 * 
 * ACCESSIBILITY:
 * - Automatically associates with form controls
 * - Handles disabled state styling
 * - Proper semantic HTML
 * 
 * USAGE:
 * ```tsx
 * import { Label } from '@/components/ui/label'
 * 
 * <Label htmlFor="email">Email Address</Label>
 * <Input id="email" type="email" />
 * ```
 * 
 * OR with React Hook Form:
 * ```tsx
 * <Label htmlFor={register("email").name}>Email</Label>
 * ```
 */

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * LABEL VARIANTS CONFIGURATION
 * 
 * Uses class-variance-authority (cva) for variant styling.
 * Currently uses base styles only (no variants defined).
 * 
 * BASE CLASSES:
 * - text-sm: Small text size
 * - font-medium: Medium font weight
 * - leading-none: No line height
 * - peer-disabled:cursor-not-allowed: Cursor when associated input is disabled
 * - peer-disabled:opacity-70: Reduced opacity when associated input is disabled
 * 
 * PEER PSEUDO-CLASS:
 * Uses Tailwind's peer modifier to style based on sibling input state.
 * When input is disabled, label also appears disabled.
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * LABEL COMPONENT
 * 
 * Forwarded ref component for label element.
 * 
 * HOW IT WORKS:
 * 1. Uses Radix UI Label primitive for accessibility
 * 2. Merges variant classes with className prop
 * 3. Forwards ref for imperative handle access
 * 4. Spreads all other props to label element
 * 
 * RADIX UI INTEGRATION:
 * Uses LabelPrimitive.Root for accessibility features:
 * - Proper ARIA attributes
 * - Keyboard navigation support
 * - Screen reader support
 * 
 * @param className - Additional CSS classes
 * @param props - All Radix UI Label props (htmlFor, etc.)
 * @param ref - Ref forwarded to label element
 * 
 * DISPLAY NAME:
 * Uses Radix UI's displayName for proper debugging.
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
