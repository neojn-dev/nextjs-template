/**
 * PASSWORD INPUT COMPONENT
 * 
 * A password input component with show/hide password toggle.
 * 
 * WHAT IT DOES:
 * - Provides password input with toggle visibility feature
 * - Shows/hides password on button click
 * - Maintains accessibility with screen reader support
 * - Provides visual feedback for password visibility state
 * 
 * FEATURES:
 * - Toggle password visibility (show/hide)
 * - Eye icon indicator (Eye/EyeOff from lucide-react)
 * - Screen reader support (sr-only text)
 * - Disabled state handling
 * - Customizable via className prop
 * - Forward ref support
 * 
 * ACCESSIBILITY:
 * - Screen reader text for toggle button
 * - Proper button type (prevents form submission)
 * - Disabled state propagated to toggle button
 * 
 * USAGE:
 * ```tsx
 * import { PasswordInput } from '@/components/forms/password-input'
 * 
 * <PasswordInput 
 *   placeholder="Enter password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 * ```
 * 
 * OR with React Hook Form:
 * ```tsx
 * <PasswordInput {...register("password")} />
 * ```
 */

"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * PASSWORD INPUT PROPS INTERFACE
 * 
 * Extends HTML input attributes.
 * All standard input props are supported (type, placeholder, value, etc.).
 * 
 * NOTE: type prop is overridden internally (always password/text).
 */
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

/**
 * PASSWORD INPUT COMPONENT
 * 
 * Forwarded ref component for password input with visibility toggle.
 * 
 * HOW IT WORKS:
 * 1. Maintains internal state for password visibility (showPassword)
 * 2. Renders Input component with dynamic type (password/text)
 * 3. Renders toggle button with Eye/EyeOff icon
 * 4. Toggles visibility on button click
 * 5. Forwards ref to input element
 * 
 * VISIBILITY TOGGLE:
 * - Clicking button toggles showPassword state
 * - Input type changes between "password" and "text"
 * - Icon changes between Eye and EyeOff
 * 
 * STYLING:
 * - Input has right padding (pr-10) for button space
 * - Button positioned absolutely in right side
 * - Button styled as ghost variant (transparent background)
 * - Button disabled when input is disabled
 * 
 * @param className - Additional CSS classes for input
 * @param props - All HTML input attributes
 * @param ref - Ref forwarded to input element
 * 
 * DISPLAY NAME:
 * Required for React DevTools debugging.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    /**
     * PASSWORD VISIBILITY STATE
     * 
     * Controls whether password is visible or hidden.
     * - false: Password is hidden (type="password")
     * - true: Password is visible (type="text")
     */
    const [showPassword, setShowPassword] = useState(false)

    return (
      /**
       * CONTAINER WRAPPER
       * 
       * Relative positioning allows absolute positioning of toggle button.
       */
      <div className="relative">
        {
          /**
           * PASSWORD INPUT
           * 
           * Input component with dynamic type based on visibility state.
           * 
           * STYLING:
           * - pr-10: Right padding for toggle button space
           * - className: Merged with additional classes
           */
        }
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        {
          /**
           * TOGGLE BUTTON
           * 
           * Button to toggle password visibility.
           * 
           * STYLING:
           * - absolute: Absolute positioning
           * - right-0: Aligned to right edge
           * - top-0: Aligned to top edge
           * - h-full: Full height of input
           * - px-3 py-2: Padding for icon
           * - hover:bg-transparent: No background on hover (ghost style)
           * 
           * ACCESSIBILITY:
           * - type="button": Prevents form submission
           * - disabled: Disabled when input is disabled
           * - sr-only: Screen reader text for accessibility
           */
        }
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={props.disabled}
        >
          {
            /**
             * ICON CONDITIONAL RENDERING
             * 
             * Shows EyeOff icon when password is visible (to hide it).
             * Shows Eye icon when password is hidden (to show it).
             */
          }
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {
            /**
             * SCREEN READER TEXT
             * 
             * Provides accessible label for screen readers.
             * Hidden visually but accessible to assistive technologies.
             */
          }
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"
