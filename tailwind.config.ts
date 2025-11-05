/**
 * TAILWIND CSS CONFIGURATION FILE
 * 
 * This file configures Tailwind CSS for the application.
 * 
 * WHAT IT DOES:
 * - Configures content paths (where Tailwind looks for classes)
 * - Defines theme extensions (colors, fonts, spacing, etc.)
 * - Configures plugins
 * - Sets up dark mode
 * 
 * CONTENT PATHS:
 * Tailwind scans these paths for class names and generates CSS.
 * Only classes found in these files are included in the final CSS.
 * 
 * THEME EXTENSIONS:
 * Extends Tailwind's default theme with custom:
 * - Colors (using CSS variables)
 * - Fonts (Inter, JetBrains Mono)
 * - Font sizes
 * - Border radius
 * - Spacing
 * - Keyframes (animations)
 * - Shadows
 * - Gradients
 * 
 * PLUGINS:
 * - tailwindcss-animate: Animation utilities
 * - @tailwindcss/typography: Typography plugin
 */

import type { Config } from "tailwindcss"

/**
 * TAILWIND CSS CONFIGURATION
 * 
 * Main configuration object for Tailwind CSS.
 */
const config = {
  /**
   * DARK MODE CONFIGURATION
   * 
   * "class": Uses class-based dark mode.
   * Toggle dark mode by adding/removing .dark class.
   * 
   * ALTERNATIVE:
   * "media": Uses prefers-color-scheme media query (automatic)
   * 
   * CURRENT SETTING: ["class"]
   * - More control over dark mode
   * - User preference can be saved
   * - Can toggle manually
   */
  darkMode: ["class"],

  /**
   * CONTENT PATHS
   * 
   * Tells Tailwind where to look for class names.
   * Only classes found in these files are included in the final CSS.
   * 
   * PATTERNS:
   * - './pages/**/*.{ts,tsx}': Pages directory
   * - './components/**/*.{ts,tsx}': Components directory
   * - './app/**/*.{ts,tsx}': App directory (Next.js App Router)
   * - './src/**/*.{ts,tsx}': Source directory (if using src folder)
   * 
   * WHY IMPORTANT?
   * - Reduces CSS bundle size
   * - Only includes used classes
   * - Faster build times
   */
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],

  /**
   * CSS PREFIX
   * 
   * Optional prefix for all Tailwind classes.
   * Empty string means no prefix (default).
   * 
   * EXAMPLE:
   * If prefix: "tw-"
   * Then: "tw-flex" instead of "flex"
   */
  prefix: "",

  /**
   * THEME CONFIGURATION
   * 
   * Extends Tailwind's default theme with custom values.
   */
  theme: {
    /**
     * CONTAINER CONFIGURATION
     * 
     * Configures default container component.
     */
    container: {
      center: true, // Centers container horizontally
      padding: "2rem", // Default padding
      screens: {
        "2xl": "1400px", // Breakpoint for 2xl screens
      },
    },

    /**
     * THEME EXTENSIONS
     * 
     * Adds custom values to Tailwind's theme.
     * These extend (don't replace) default values.
     */
    extend: {
      /**
       * FONT FAMILIES
       * 
       * Defines custom font families.
       * Uses CSS variables from globals.css.
       */
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"], // Primary font
        mono: ["JetBrains Mono", "ui-monospace", "monospace"], // Monospace font
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"], // Display font
      },

      /**
       * FONT SIZES
       * 
       * Defines custom font sizes with line heights.
       * Format: [fontSize, { lineHeight }]
       */
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      /**
       * COLOR SYSTEM
       * 
       * Uses CSS variables from globals.css.
       * Colors are defined in HSL format for theming.
       * 
       * FORMAT:
       * color: "hsl(var(--variable-name))"
       * 
       * COLORS INCLUDED:
       * - border, input, ring: UI element colors
       * - background, foreground: Base colors
       * - primary: Brand color (with light/dark variants)
       * - secondary: Supporting color
       * - destructive: Error/danger color
       * - muted: Muted/subtle color
       * - accent: Accent colors (blue, green, purple, orange)
       * - popover, card: Component colors
       * - success, warning: Semantic colors
       */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          blue: "hsl(var(--accent-blue))",
          green: "hsl(var(--accent-green))",
          purple: "hsl(var(--accent-purple))",
          orange: "hsl(var(--accent-orange))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },

      /**
       * BORDER RADIUS
       * 
       * Custom border radius values.
       * Uses CSS variables for consistency.
       */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-xl)",
        "3xl": "var(--radius-2xl)",
      },

      /**
       * SPACING
       * 
       * Custom spacing values.
       * Extends Tailwind's default spacing scale.
       */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      /**
       * KEYFRAMES (ANIMATIONS)
       * 
       * Defines custom animation keyframes.
       * Used with animation utilities.
       * 
       * ANIMATIONS INCLUDED:
       * - accordion-down/up: Accordion expand/collapse
       * - fade-in/out: Fade animations
       * - slide-in-*: Slide animations (top, bottom, left, right)
       * - scale-in/out: Scale animations
       * - bounce-in: Bounce animation
       * - float: Floating animation
       * - pulse-glow: Pulsing glow effect
       * - shimmer: Shimmer effect
       * - wiggle: Wiggle animation
       */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },

      /**
       * ANIMATION UTILITIES
       * 
       * Maps keyframes to animation utilities.
       * Usage: className="animate-fade-in"
       */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.5s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.5s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.5s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "scale-out": "scale-out 0.3s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
      },

      /**
       * BACKDROP BLUR
       * 
       * Custom backdrop blur values.
       */
      backdropBlur: {
        xs: '2px',
      },

      /**
       * BOX SHADOWS
       * 
       * Custom shadow utilities.
       * Includes glow effects for different colors.
       */
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.8)',
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.5)',
      },

      /**
       * BACKGROUND IMAGES
       * 
       * Custom gradient utilities.
       * Uses CSS variables from globals.css.
       */
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-warm': 'var(--gradient-warm)',
      },

      /**
       * TRANSITION TIMING FUNCTIONS
       * 
       * Custom easing functions.
       * Provides smooth, natural animations.
       */
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },

  /**
   * PLUGINS
   * 
   * Tailwind CSS plugins that extend functionality.
   * 
   * PLUGINS INCLUDED:
   * - tailwindcss-animate: Animation utilities (animate-in, animate-out)
   * - @tailwindcss/typography: Typography plugin for prose styles
   */
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

/**
 * EXPORT CONFIGURATION
 * 
 * Exports the Tailwind configuration.
 * Tailwind reads this file and applies the configuration.
 */
export default config
