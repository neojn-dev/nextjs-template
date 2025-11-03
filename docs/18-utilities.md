# Utilities

This document explains utility functions and helper libraries.

## 🛠️ Utilities Overview

The application includes various utility functions and helpers for common operations.

## 📁 Utility Files

```
lib/
├── utils.ts                  # General utilities
├── config.ts                 # Configuration utilities
├── db.ts                     # Database utilities
├── email.ts                  # Email utilities
├── navigation.ts             # Navigation utilities
├── styles.ts                 # Style utilities
├── debug-utils.ts            # Debug utilities
├── error-handling.ts         # Error handling utilities
├── file-manager.ts           # File management utilities
└── dashboard-data.ts         # Dashboard data utilities
```

## 🔧 Common Utilities

### General Utilities

**File**: `lib/utils.ts`

```typescript
import { cn } from "@/lib/utils"

// Class name utility (clsx + tailwind-merge)
<div className={cn("base-class", condition && "conditional-class")} />

// Generate random string
import { generateRandomString } from "@/lib/utils"
const randomString = generateRandomString(16)
```

### Configuration

**File**: `lib/config.ts`

```typescript
import { config } from "@/lib/config"

// Access configuration
const appName = config.app.name
const dbUrl = config.database.url
```

### Database

**File**: `lib/db.ts`

```typescript
import { db } from "@/lib/db"

// Database operations
const users = await db.user.findMany()
```

### Email

**File**: `lib/email.ts`

```typescript
import { sendVerificationEmail } from "@/lib/email"

await sendVerificationEmail(email, token)
```

## 📝 Best Practices

### 1. Reuse Utilities

Use existing utilities instead of duplicating code.

### 2. Keep Utilities Focused

Each utility file should have a single responsibility.

### 3. Type Everything

Type all utility functions and return values.

---

**Next**: [Error Handling](./19-error-handling.md)

