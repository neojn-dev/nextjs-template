# UI Components

This document explains the UI component library based on shadcn/ui.

## 🎨 UI Components Overview

The project uses **shadcn/ui**, a collection of accessible React components built on top of Radix UI and TailwindCSS.

## 📦 Available UI Components

### Button Component

**File**: `components/ui/button.tsx`

**Usage**:
```typescript
import { Button } from "@/components/ui/button"

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

**Variants**: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`

**Sizes**: `sm`, `md`, `lg`, `icon`

### Input Component

**File**: `components/ui/input.tsx`

**Usage**:
```typescript
import { Input } from "@/components/ui/input"

<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

### Card Component

**File**: `components/ui/card.tsx`

**Usage**:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**Sub-components**: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### Dialog Component

**File**: `components/ui/dialog.tsx`

**Usage**:
```typescript
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    Content
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Table Component

**File**: `components/ui/table.tsx`

**Usage**:
```typescript
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Select Component

**File**: `components/ui/select.tsx`

**Usage**:
```typescript
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox Component

**File**: `components/ui/checkbox.tsx`

**Usage**:
```typescript
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox checked={checked} onCheckedChange={setChecked} />
<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms</Label>
```

### Badge Component

**File**: `components/ui/badge.tsx`

**Usage**:
```typescript
import { Badge } from "@/components/ui/badge"

<Badge>New</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Deleted</Badge>
```

**Variants**: `default`, `secondary`, `destructive`, `outline`

### Tabs Component

**File**: `components/ui/tabs.tsx`

**Usage**:
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Dropdown Menu Component

**File**: `components/ui/dropdown-menu.tsx`

**Usage**:
```typescript
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Item 3</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Toast Component

**File**: `components/ui/toast-container.tsx`

**Usage**:
```typescript
import { toast } from "@/components/ui/toast-container"

toast.success("Success message")
toast.error("Error message")
toast.info("Info message")
```

## 📋 Complete Component List

| Component | File | Purpose |
|-----------|------|---------|
| **Button** | `button.tsx` | Button component |
| **Input** | `input.tsx` | Text input |
| **Textarea** | `textarea.tsx` | Multi-line input |
| **Select** | `select.tsx` | Dropdown selection |
| **Checkbox** | `checkbox.tsx` | Checkbox input |
| **Radio Group** | `radio-group.tsx` | Radio buttons |
| **Switch** | `switch.tsx` | Toggle switch |
| **Slider** | `slider.tsx` | Range slider |
| **Card** | `card.tsx` | Card container |
| **Dialog** | `dialog.tsx` | Modal dialog |
| **Alert Dialog** | `alert-dialog.tsx` | Alert dialog |
| **Popover** | `popover.tsx` | Popover |
| **Dropdown Menu** | `dropdown-menu.tsx` | Dropdown menu |
| **Table** | `table.tsx` | Table component |
| **Badge** | `badge.tsx` | Badge component |
| **Avatar** | `avatar.tsx` | Avatar image |
| **Tabs** | `tabs.tsx` | Tab component |
| **Progress** | `progress.tsx` | Progress bar |
| **Label** | `label.tsx` | Form label |
| **Separator** | `separator.tsx` | Divider |
| **Toast** | `toast-container.tsx` | Toast notifications |

## 🎨 Styling Components

### TailwindCSS Classes

All components use TailwindCSS for styling:

```typescript
<div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
    Click me
  </Button>
</div>
```

### Component Variants

Components use variants for different styles:

```typescript
// Button variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## ♿ Accessibility

All components are accessible by default:

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper ARIA attributes
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML

## 📝 Best Practices

### 1. Use Consistent Components

Use UI components from `components/ui/` for consistency.

### 2. Follow Patterns

Follow existing component patterns for new components.

### 3. Maintain Accessibility

Ensure all components remain accessible.

### 4. Use TypeScript

Type all component props and state.

### 5. Document Components

Add comments explaining component usage.

## 🔗 Related Documentation

- [Components Overview](./09-components-overview.md) - Component architecture
- [Styling](./16-styling-theming.md) - Styling guide
- [Forms & Validation](./11-forms-validation.md) - Form components

---

**Next**: [Forms & Validation](./11-forms-validation.md)

