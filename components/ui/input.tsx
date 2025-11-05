/**
 * INPUT COMPONENT
 * 
 * A reusable input component built with React and Tailwind CSS.
 * 
 * WHAT IT DOES:
 * - Provides consistent input styling across the application
 * - Supports all HTML input types (text, email, password, etc.)
 * - Handles file inputs with custom styling
 * - Provides focus states and accessibility features
 * 
 * FEATURES:
 * - Type-safe props (extends HTMLInputElement attributes)
 * - Focus-visible styles for keyboard navigation
 * - Disabled state handling
 * - Placeholder styling
 * - File input styling
 * - Customizable via className prop
 * 
 * STYLING:
 * - Uses design system colors (border-input, bg-background, etc.)
 * - Focus ring for accessibility
 * - Disabled state with reduced opacity
 * - Placeholder text styling
 * 
 * FILE INPUT STYLING:
 * Custom styles for file inputs:
 * - file:border-0: Removes border
 * - file:bg-transparent: Transparent background
 * - file:text-sm: Small text
 * - file:font-medium: Medium font weight
 * 
 * USAGE:
 * ```tsx
 * import { Input } from '@/components/ui/input'
 * 
 * <Input type="email" placeholder="Enter your email" />
 * <Input type="password" placeholder="Password" />
 * <Input type="file" />
 * ```
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * INPUT PROPS INTERFACE
 * 
 * Extends HTML input attributes.
 * All standard input props are supported (type, placeholder, value, etc.).
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * INPUT COMPONENT
 * 
 * Forwarded ref component for input element.
 * 
 * HOW IT WORKS:
 * 1. Merges default classes with className prop
 * 2. Supports all HTML input types
 * 3. Forwards ref for imperative handle access
 * 4. Spreads all other props to input element
 * 
 * BASE CLASSES:
 * - flex: Display as flex
 * - h-10: Height 40px
 * - w-full: Full width
 * - rounded-md: Rounded corners
 * - border: Border
 * - border-input: Border color from design system
 * - bg-background: Background color from design system
 * - px-3: Horizontal padding
 * - py-2: Vertical padding
 * - text-sm: Small text size
 * - ring-offset-background: Ring offset color
 * - file:border-0: Remove border on file inputs
 * - file:bg-transparent: Transparent background for file inputs
 * - file:text-sm: Small text for file inputs
 * - file:font-medium: Medium font weight for file inputs
 * - placeholder:text-muted-foreground: Placeholder text color
 * - focus-visible:outline-none: Remove default outline
 * - focus-visible:ring-2: Focus ring
 * - focus-visible:ring-ring: Ring color
 * - focus-visible:ring-offset-2: Ring offset
 * - disabled:cursor-not-allowed: Disabled cursor
 * - disabled:opacity-50: Disabled opacity
 * 
 * @param className - Additional CSS classes
 * @param type - Input type (text, email, password, file, etc.)
 * @param props - All other HTML input attributes
 * @param ref - Ref forwarded to input element
 * 
 * DISPLAY NAME:
 * Required for React DevTools debugging.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
