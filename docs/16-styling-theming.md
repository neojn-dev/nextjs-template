# Styling & Theming

This document explains the styling system, TailwindCSS configuration, and theming.

## 🎨 Styling Overview

The application uses **TailwindCSS** for styling, providing a utility-first CSS framework with a comprehensive design system.

## 📁 Styling Structure

```
styles/
└── globals.css                # Global styles with Tailwind imports

tailwind.config.ts             # TailwindCSS configuration
postcss.config.js              # PostCSS configuration

lib/
└── styles.ts                  # Style utilities
```

## 🎨 TailwindCSS Configuration

### Tailwind Config

**File**: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
      fontFamily: {
        // Custom fonts
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}

export default config
```

## 🎯 Utility Classes

### Common Utilities

| Utility | Purpose | Example |
|---------|---------|---------|
| **Layout** | Flex, Grid, Position | `flex`, `grid`, `absolute` |
| **Spacing** | Padding, Margin | `p-4`, `m-4`, `space-x-4` |
| **Typography** | Font, Size, Color | `text-lg`, `font-bold`, `text-gray-900` |
| **Colors** | Background, Text | `bg-blue-600`, `text-white` |
| **Borders** | Border, Radius | `border`, `rounded-lg` |
| **Shadows** | Shadow effects | `shadow-md`, `shadow-lg` |

### Usage Examples

```typescript
// Layout
<div className="flex items-center space-x-4">
  <div className="flex-1">Content</div>
</div>

// Spacing
<div className="p-4 m-4 space-y-4">
  <div className="mb-2">Item 1</div>
  <div className="mb-2">Item 2</div>
</div>

// Typography
<h1 className="text-3xl font-bold text-gray-900">
  Title
</h1>

// Colors
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Button
</button>

// Borders
<div className="border border-gray-200 rounded-lg">
  Content
</div>

// Shadows
<div className="shadow-md rounded-lg p-4">
  Card
</div>
```

## 🎨 Component Styling

### Styled Components

Components use TailwindCSS classes for styling:

```typescript
// Button component
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Click me
</Button>

// Card component
<Card className="shadow-lg rounded-xl border border-gray-200">
  <CardHeader className="bg-gray-50">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    Content
  </CardContent>
</Card>
```

## 🎯 Color System

### Color Palette

The application uses a consistent color palette:

| Color | Usage | Example |
|-------|-------|---------|
| **Primary** | Main brand color | `bg-blue-600` |
| **Secondary** | Secondary actions | `bg-gray-600` |
| **Success** | Success states | `bg-green-600` |
| **Warning** | Warning states | `bg-yellow-600` |
| **Error** | Error states | `bg-red-600` |
| **Info** | Info states | `bg-blue-500` |

### Usage

```typescript
// Primary
<Button className="bg-blue-600 text-white">
  Primary Button
</Button>

// Success
<div className="bg-green-50 text-green-800 border border-green-200">
  Success message
</div>

// Error
<div className="bg-red-50 text-red-800 border border-red-200">
  Error message
</div>
```

## 📐 Layout System

### Container

```typescript
<div className="container mx-auto px-4">
  Content
</div>
```

### Grid System

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Flexbox

```typescript
<div className="flex items-center justify-between space-x-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

## 🎨 Responsive Design

### Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| **sm** | 640px | Small devices |
| **md** | 768px | Tablets |
| **lg** | 1024px | Desktops |
| **xl** | 1280px | Large desktops |
| **2xl** | 1536px | Extra large desktops |

### Usage

```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Content
</div>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Title
</h1>
```

## 🎭 Animations

### Framer Motion

The application uses **Framer Motion** for animations:

```typescript
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Tailwind Animations

TailwindCSS includes built-in animations:

```typescript
<div className="animate-pulse">Loading...</div>
<div className="animate-spin">Spinner</div>
```

## 🎨 Theme Customization

### Custom Colors

Define custom colors in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        50: '#eff6ff',
        100: '#dbeafe',
        // ... more shades
        600: '#2563eb',
      },
    },
  },
}
```

### Custom Fonts

```typescript
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
  },
}
```

## 📝 Best Practices

### 1. Use Utility Classes

Prefer TailwindCSS utility classes over custom CSS.

### 2. Consistent Spacing

Use consistent spacing scale (4, 8, 12, 16, etc.).

### 3. Responsive Design

Always design mobile-first with responsive breakpoints.

### 4. Semantic Colors

Use semantic color names (success, error, warning) over specific colors.

### 5. Reusable Components

Create reusable components with consistent styling.

### 6. Dark Mode Ready

The application is ready for dark mode (can be enabled).

## 🔗 Related Documentation

- [Components Overview](./09-components-overview.md) - Component styling
- [UI Components](./10-ui-components.md) - UI component styling

---

**Next**: [Utilities](./18-utilities.md)

