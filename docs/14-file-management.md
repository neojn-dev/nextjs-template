# File Management System

This document explains the file upload and management system.

## 📁 File Management Overview

The application includes a comprehensive file management system that handles:
- File uploads
- File storage
- File validation
- File organization
- File retrieval

## 🏗️ File System Architecture

### Components

| Component | Purpose |
|-----------|---------|
| **File Upload API** | Handles file uploads |
| **File Manager API** | Manages file operations |
| **Upload Model** | Stores file metadata |
| **File Storage** | Stores files on disk |
| **File Validation** | Validates file types and sizes |

## 📁 File Structure

```
uploads/
├── avatars/           # User profile images
├── files/              # General file uploads
│   ├── Alpha/         # Organized by folder
│   └── ...
└── ...
```

## 🗄️ Database Schema

### Upload Model

```prisma
model Upload {
  id           String   @id @default(cuid())
  filename     String
  originalName String
  mimeType     String
  size         Int
  path         String
  userId       String
  createdAt    DateTime @default(now())

  user        User                 @relation(fields: [userId])
  attachments TransferAttachment[] @relation("UploadAttachment")
}
```

## 🔧 File Upload API

### Upload Endpoint

**File**: `app/api/upload/route.ts`

```typescript
// POST /api/upload
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File

  // Validate file size
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 5MB limit" },
      { status: 400 }
    )
  }

  // Validate file type
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ]
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type" },
      { status: 400 }
    )
  }

  // Generate safe filename
  const fileExtension = path.extname(file.name)
  const safeFileName = `${generateRandomString(16)}_${Date.now()}${fileExtension}`
  const filePath = path.join(UPLOAD_DIR, safeFileName)

  // Save file
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(filePath, buffer)

  // Save metadata
  const upload = await db.upload.create({
    data: {
      filename: safeFileName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `uploads/${safeFileName}`,
      userId: session.user.id,
    }
  })

  return NextResponse.json({ data: upload }, { status: 201 })
}
```

## 📤 File Upload Component

### File Input Component

**File**: `components/forms/file-input.tsx`

```typescript
import { FileInput } from "@/components/forms/file-input"

<FileInput
  onFileSelect={(file) => {
    // Handle file selection
  }}
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

### Usage Example

```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  })

  if (response.ok) {
    const { data } = await response.json()
    // File uploaded successfully
    console.log("Upload ID:", data.id)
  }
}
```

## 📂 File Manager API

### File Manager Endpoints

**File**: `app/api/file-manager/route.ts`

```typescript
// GET /api/file-manager
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get("path") || "/"

  // List files in directory
  const files = await listFiles(path, session.user.id)

  return NextResponse.json({ data: files })
}
```

### File Operations

**Create Folder**:
```typescript
// POST /api/file-manager/folder
export async function POST(request: NextRequest) {
  const { path, name } = await request.json()
  
  await createFolder(path, name)
  
  return NextResponse.json({ success: true })
}
```

**Delete File**:
```typescript
// DELETE /api/file-manager/file
export async function DELETE(request: NextRequest) {
  const { path } = await request.json()
  
  await deleteFile(path)
  
  return NextResponse.json({ success: true })
}
```

**Download File**:
```typescript
// GET /api/file-manager/[path]
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  const filePath = path.join(UPLOAD_DIR, params.path)
  
  const fileBuffer = await readFile(filePath)
  
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${params.path}"`,
    },
  })
}
```

## 🔒 File Security

### Security Features

| Feature | Implementation |
|---------|----------------|
| **File Type Validation** | Whitelist allowed file types |
| **File Size Validation** | Maximum file size limit |
| **User Authentication** | Only authenticated users can upload |
| **Safe Filenames** | Generated safe filenames |
| **Path Validation** | Prevent directory traversal |

### File Validation

```typescript
// Validate file type
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
]

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error("Invalid file type")
}

// Validate file size
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
if (file.size > MAX_SIZE) {
  throw new Error("File too large")
}
```

## 📊 File Organization

### Folder Structure

Files are organized in folders:

```
uploads/
├── avatars/           # Profile images
│   ├── user1.jpg
│   └── user2.png
├── files/              # General files
│   ├── Alpha/         # Organized by folder
│   │   ├── file1.pdf
│   │   └── file2.pdf
│   └── Beta/
│       └── file3.pdf
└── ...
```

## 🖼️ Profile Image Upload

### Profile Image Uploader

**File**: `components/ui/profile-image-uploader.tsx`

```typescript
import { ProfileImageUploader } from "@/components/ui/profile-image-uploader"

<ProfileImageUploader
  currentImage={user.profileImage}
  onImageUploaded={(imagePath) => {
    // Update user profile image
    updateUserProfile({ profileImage: imagePath })
  }}
/>
```

### Profile Image API

**File**: `app/api/users/profile-image/route.ts`

```typescript
// POST /api/users/profile-image
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const formData = await request.formData()
  const file = formData.get("file") as File

  // Upload file
  const upload = await uploadFile(file, session.user.id)

  // Update user profile image
  await db.user.update({
    where: { id: session.user.id },
    data: { profileImage: upload.path }
  })

  return NextResponse.json({ data: upload })
}
```

## 📋 File Management Features

### Features

| Feature | Description |
|---------|-------------|
| **Upload** | Upload files to server |
| **Download** | Download files from server |
| **Delete** | Delete files from server |
| **List** | List files in directory |
| **Create Folder** | Create new folders |
| **Organize** | Organize files in folders |
| **Search** | Search for files |
| **Preview** | Preview files (images, PDFs) |

## 📝 Best Practices

### 1. Validate Files

Always validate file type and size before saving.

### 2. Use Safe Filenames

Generate safe filenames to prevent security issues.

### 3. Store Metadata

Store file metadata in database for easy retrieval.

### 4. Organize Files

Organize files in folders for better management.

### 5. Clean Up Files

Delete unused files to save storage space.

### 6. Use Transactions

Use database transactions when saving file metadata.

## 🔗 Related Documentation

- [Database](./07-database.md) - Upload model
- [API Routes](./08-api-routes.md) - File APIs
- [Components](./09-components-overview.md) - File components

---

**Next**: [Dashboard](./15-dashboard-analytics.md)

