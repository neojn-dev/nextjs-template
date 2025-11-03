# Animations

This document explains animation implementation using Framer Motion.

## 🎬 Animations Overview

The application uses **Framer Motion** for smooth animations and transitions.

## 📦 Animation Library

### Framer Motion

**Package**: `framer-motion`

**Features**:
- Declarative animations
- Gesture support
- Layout animations
- Shared layout animations

## 🎯 Basic Animations

### Simple Animation

```typescript
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Fade In Animation

```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Slide In Animation

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## 🎨 Common Animation Patterns

### Page Transitions

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Page Content
</motion.div>
```

### Staggered Animations

```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

## 📝 Best Practices

### 1. Use Transitions Sparingly

Use animations to enhance UX, not distract.

### 2. Keep Animations Fast

Keep animation durations short (200-500ms).

### 3. Use Consistent Timing

Use consistent animation timings throughout the app.

### 4. Test Performance

Test animations on different devices.

---

**Next**: [Utilities](./18-utilities.md)

