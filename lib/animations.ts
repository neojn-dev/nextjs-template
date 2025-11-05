/**
 * ANIMATION UTILITIES MODULE
 * 
 * Provides lightweight animation utilities using Tailwind CSS classes.
 * These replace heavy framer-motion usage for simple animations.
 * 
 * WHY THIS APPROACH?
 * - Lighter than framer-motion (no JavaScript runtime)
 * - Better performance (CSS animations)
 * - Smaller bundle size
 * - Works well for simple animations
 * 
 * WHEN TO USE:
 * - Simple fade/slide animations
 * - Hover effects
 * - Form field animations
 * - Loading states
 * 
 * WHEN NOT TO USE:
 * - Complex animations requiring orchestration
 * - Animations with JavaScript logic
 * - Animations needing precise timing control
 * - Use framer-motion for these cases
 * 
 * USAGE:
 * ```tsx
 * import { fadeInUp, hoverScale } from '@/lib/animations'
 * 
 * <div className={fadeInUp}>
 *   <button className={hoverScale}>Click me</button>
 * </div>
 * ```
 */

/**
 * FADE IN UP ANIMATION
 * 
 * Animates element fading in and sliding up from bottom.
 * 
 * EFFECTS:
 * - Fades in (opacity 0 → 1)
 * - Slides up from bottom (translateY)
 * - Duration: 500ms
 * 
 * USE CASE:
 * Page content, cards, modals appearing
 */
export const fadeInUp = "animate-in fade-in slide-in-from-bottom-4 duration-500"

/**
 * FADE IN ANIMATION
 * 
 * Simple fade in effect (opacity only).
 * 
 * EFFECTS:
 * - Fades in (opacity 0 → 1)
 * - Duration: 500ms
 * 
 * USE CASE:
 * Text appearing, images loading
 */
export const fadeIn = "animate-in fade-in duration-500"

/**
 * SLIDE IN FROM LEFT ANIMATION
 * 
 * Animates element sliding in from left side.
 * 
 * EFFECTS:
 * - Fades in
 * - Slides in from left (translateX)
 * - Duration: 500ms
 * 
 * USE CASE:
 * Sidebars, navigation menus, panels
 */
export const slideInLeft = "animate-in slide-in-from-left-4 duration-500"

/**
 * SLIDE IN FROM RIGHT ANIMATION
 * 
 * Animates element sliding in from right side.
 * 
 * EFFECTS:
 * - Fades in
 * - Slides in from right (translateX)
 * - Duration: 500ms
 * 
 * USE CASE:
 * Sidebars, navigation menus, panels
 */
export const slideInRight = "animate-in slide-in-from-right-4 duration-500"

/**
 * STAGGERED ANIMATION DELAYS
 * 
 * Provides delay classes for staggered animations.
 * Used when animating multiple elements sequentially.
 * 
 * HOW IT WORKS:
 * - animation-delay-100: 100ms delay
 * - animation-delay-200: 200ms delay
 * - animation-delay-300: 300ms delay
 * - animation-delay-400: 400ms delay
 * - animation-delay-500: 500ms delay
 * 
 * USAGE:
 * ```tsx
 * <div className={fadeInUp}>
 *   <div className={staggerDelay[1]}>First item</div>
 *   <div className={staggerDelay[2]}>Second item</div>
 *   <div className={staggerDelay[3]}>Third item</div>
 * </div>
 * ```
 * 
 * EFFECT:
 * Items animate in sequence with increasing delays.
 */
export const staggerDelay = {
  1: "animation-delay-100", // 100ms delay
  2: "animation-delay-200", // 200ms delay
  3: "animation-delay-300", // 300ms delay
  4: "animation-delay-400", // 400ms delay
  5: "animation-delay-500", // 500ms delay
}

/**
 * SPIN ANIMATION
 * 
 * CSS-based spinning animation (infinite rotation).
 * 
 * USE CASE:
 * Loading spinners, loading indicators
 * 
 * EFFECT:
 * Continuous 360-degree rotation
 */
export const spinAnimation = "animate-spin"

/**
 * SCALE IN ANIMATION
 * 
 * Animates element scaling in (growing).
 * 
 * EFFECTS:
 * - Scales from 95% to 100%
 * - Fades in
 * - Duration: 300ms
 * 
 * USE CASE:
 * Buttons, modals, popovers appearing
 */
export const scaleIn = "animate-in zoom-in-95 duration-300"

/**
 * SCALE OUT ANIMATION
 * 
 * Animates element scaling out (shrinking).
 * 
 * EFFECTS:
 * - Scales from 100% to 95%
 * - Fades out
 * - Duration: 200ms
 * 
 * USE CASE:
 * Buttons, modals, popovers disappearing
 */
export const scaleOut = "animate-out zoom-out-95 duration-200"

/**
 * HOVER SCALE EFFECT
 * 
 * Scales element slightly on hover.
 * 
 * EFFECTS:
 * - Scales to 102% on hover
 * - Smooth transition
 * - Duration: 200ms
 * 
 * USE CASE:
 * Buttons, cards, interactive elements
 */
export const hoverScale = "hover:scale-[1.02] transition-transform duration-200"

/**
 * HOVER LIFT EFFECT
 * 
 * Lifts element up with shadow on hover.
 * 
 * EFFECTS:
 * - Moves up (translateY -4px)
 * - Adds shadow on hover
 * - Smooth transition
 * - Duration: 200ms
 * 
 * USE CASE:
 * Cards, buttons, interactive elements
 */
export const hoverLift = "hover:-translate-y-1 hover:shadow-lg transition-all duration-200"

/**
 * FORM FIELD ERROR ANIMATION
 * 
 * Animates error message appearing.
 * 
 * EFFECTS:
 * - Slides in from top
 * - Fades in
 * - Duration: 200ms
 * 
 * USE CASE:
 * Form validation error messages
 */
export const fieldError = "animate-in slide-in-from-top-2 duration-200"

/**
 * FORM FIELD SUCCESS ANIMATION
 * 
 * Animates success message appearing.
 * 
 * EFFECTS:
 * - Slides in from bottom
 * - Fades in
 * - Duration: 200ms
 * 
 * USE CASE:
 * Form validation success messages
 */
export const fieldSuccess = "animate-in slide-in-from-bottom-2 duration-200"
