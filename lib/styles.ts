/**
 * SHARED UI STYLE TOKENS MODULE
 * 
 * Centralized Tailwind CSS class names for consistent styling.
 * 
 * WHY THIS APPROACH?
 * - DRY (Don't Repeat Yourself): Define styles once, reuse everywhere
 * - Consistency: Same styles used across components
 * - Maintainability: Change styles in one place
 * - Type safety: TypeScript ensures correct usage
 * 
 * HOW IT WORKS:
 * Objects contain Tailwind class strings organized by component.
 * Import and use: `className={sidebar.rowBase}`
 * 
 * BENEFITS:
 * - Consistent spacing, colors, transitions
 * - Easy to update design system
 * - Less typos in class names
 * - Better IDE autocomplete
 * 
 * USAGE:
 * ```typescript
 * import { sidebar } from '@/lib/styles'
 * 
 * <div className={sidebar.rowBase}>
 *   <div className={sidebar.iconBoxSm}>...</div>
 * </div>
 * ```
 */

/**
 * SIDEBAR STYLE TOKENS
 * 
 * Styles for sidebar navigation component.
 * 
 * ORGANIZATION:
 * - Base styles: Common styles for all states
 * - State variants: Active vs inactive styles
 * - Icon styles: Icon container and icon variants
 * - Section styles: Header and caret styles
 * 
 * TRANSITION NOTES:
 * - transition-colors: Smooth color changes
 * - duration-200: 200ms transition (fast, responsive)
 * - group: Allows parent hover to affect children
 */
export const sidebar = {
  /**
   * BASE ROW STYLE
   * 
   * Applied to all sidebar navigation items.
   * 
   * CLASSES EXPLAINED:
   * - group: Enables group-hover for child elements
   * - relative: For absolute positioning of child elements
   * - flex items-center: Vertical center alignment
   * - rounded-lg: Rounded corners
   * - transition-colors duration-200: Smooth color transitions
   * - cursor-pointer: Pointer cursor on hover
   * - h-10: Fixed height (40px)
   */
  rowBase: "group relative flex items-center rounded-lg transition-colors duration-200 cursor-pointer h-10",
  
  /**
   * ACTIVE ROW VARIANT
   * 
   * Styles for currently active navigation item.
   * 
   * DESIGN:
   * - Dark background (bg-gray-900)
   * - White text (text-white)
   * - Provides clear visual indication of active page
   */
  rowActive: "bg-gray-900 text-white",
  
  /**
   * INACTIVE ROW VARIANT
   * 
   * Styles for non-active navigation items.
   * 
   * DESIGN:
   * - White background (bg-white)
   * - Hover effect (hover:bg-gray-100)
   * - Dark gray text (text-gray-800)
   */
  rowInactive: "bg-white hover:bg-gray-100 text-gray-800",

  /**
   * ICON CONTAINER STYLES
   * 
   * Small and medium icon container sizes.
   * 
   * iconBoxSm: Small icons (7x7 = 28px)
   * iconBoxMd: Medium icons (8x8 = 32px)
   * 
   * CLASSES EXPLAINED:
   * - flex items-center justify-center: Centers icon
   * - flex-shrink-0: Prevents icon from shrinking
   * - w-7 h-7 / w-8 h-8: Fixed width and height
   */
  iconBoxSm: "flex items-center justify-center flex-shrink-0 w-7 h-7",
  iconBoxMd: "flex items-center justify-center flex-shrink-0 w-8 h-8",
  
  /**
   * ICON STYLES
   * 
   * Base icon styles and state variants.
   * 
   * icon: Base icon style (size, transitions)
   * iconActive: White icon for active state
   * iconInactive: Gray icon for inactive state (with hover effect)
   */
  icon: "transition-colors duration-200 h-5 w-5",
  iconActive: "text-white",
  iconInactive: "text-gray-500 group-hover:text-gray-700",

  /**
   * SECTION HEADER STYLES
   * 
   * Styles for collapsible section headers in sidebar.
   * 
   * headerButton: Container for section header
   * headerCaret: Caret icon for expand/collapse
   */
  headerButton: "w-full h-10 flex items-center justify-between px-3 text-xs font-semibold tracking-wide text-gray-700 uppercase rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors",
  headerCaret: "h-4 w-4 text-gray-500 transition-transform",
}

/**
 * LAYOUT STYLE TOKENS
 * 
 * Styles for page layout containers.
 * 
 * container: Responsive container with padding
 * - max-w-full: No max width constraint
 * - mx-auto: Center horizontally
 * - px-4 sm:px-6 lg:px-8: Responsive horizontal padding
 */
export const layout = {
  container: "max-w-full mx-auto px-4 sm:px-6 lg:px-8",
}

/**
 * HEADER STYLE TOKENS
 * 
 * Styles for application header component.
 * 
 * STRUCTURE:
 * - shell: Outer container (background, shadow, border)
 * - bar: Inner flex container (content layout)
 * - brandTitle/brandSubtitle: Logo/brand text styles
 * - brandIconBox: Logo icon container
 * - userText: User menu text style
 */
export const header = {
  shell: "bg-white shadow-sm border-b border-gray-200 flex-shrink-0",
  bar: "flex justify-between items-center h-16",
  brandTitle: "text-base font-semibold text-gray-900 group-hover:underline",
  brandSubtitle: "text-xs text-gray-500",
  brandIconBox: "w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white",
  userText: "text-sm font-medium text-gray-700",
}

/**
 * FOOTER STYLE TOKENS
 * 
 * Styles for application footer component.
 * 
 * STRUCTURE:
 * - shell: Outer container (background, border)
 * - bar: Inner flex container (responsive layout)
 * - left/center/right: Footer sections
 * - link: Link hover styles
 * - smallMuted: Small muted text style
 * 
 * RESPONSIVE DESIGN:
 * - flex-col sm:flex-row: Stack vertically on mobile, horizontal on desktop
 * - space-y-2 sm:space-y-0: Vertical spacing on mobile only
 */
export const footer = {
  shell: "bg-gray-50 border-t border-gray-200 flex-shrink-0",
  bar: "flex flex-col sm:flex-row justify-between items-center py-4 space-y-2 sm:space-y-0",
  left: "flex items-center space-x-2",
  center: "flex items-center space-x-4 text-sm text-gray-500",
  right: "flex items-center space-x-4 text-sm text-gray-500",
  link: "hover:text-blue-600 transition-colors",
  smallMuted: "text-sm text-gray-600",
}

/**
 * AUTHENTICATION PAGE STYLE TOKENS
 * 
 * Styles for authentication pages (signin, signup, etc.).
 * 
 * STRUCTURE:
 * - page: Full page container
 * - main: Main content area
 * - card: Form card container
 * - titleWrap/title: Heading styles
 * - error/success: Message alert styles
 * - dividerWrap/dividerLine/dividerHr/dividerTextWrap/dividerText: Divider styles
 * - split: Two-column layout container
 * - graphicPane: Left column (graphic/illustration)
 * - formPane: Right column (form)
 * - formCenter/formMax: Form centering and max width
 * 
 * RESPONSIVE DESIGN:
 * - grid-cols-1 lg:grid-cols-2: Single column on mobile, two columns on large screens
 * - hidden lg:block: Hide graphic on mobile, show on desktop
 */
export const auth = {
  // Full page container
  page: "min-h-screen bg-gray-50 flex flex-col",
  
  // Main content area
  main: "h-screen flex overflow-hidden",
  
  // Form card container
  card: "w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6",
  
  // Title section
  titleWrap: "mb-6 text-center",
  title: "text-2xl font-semibold text-gray-900",
  
  // Message alerts
  error: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700",
  success: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700",
  
  // Divider (for "Or continue with" section)
  dividerWrap: "relative my-6",
  dividerLine: "absolute inset-0 flex items-center",
  dividerHr: "w-full border-t border-gray-200",
  dividerTextWrap: "relative flex justify-center text-xs",
  dividerText: "px-2 bg-white text-gray-500",

  // 50/50 split layout for auth pages
  split: "w-full grid grid-cols-1 lg:grid-cols-2 min-h-full",
  graphicPane: "hidden lg:block relative h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700",
  formPane: "flex items-center justify-center w-full overflow-hidden",
  formCenter: "w-full flex items-center justify-center py-10",
  formMax: "w-full max-w-md",
}


