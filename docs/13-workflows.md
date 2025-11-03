# Workflows System

This document explains the workflow system, specifically the Transfer Requests workflow.

## 🔄 Workflows Overview

The application includes a **workflow system** for managing approval processes. The main workflow is the **Transfer Requests** workflow, which handles the approval process for transfer requests.

## 🏗️ Workflow Architecture

### Components

| Component | Purpose |
|-----------|---------|
| **Workflow State Machine** | Manages workflow states and transitions |
| **Approval Steps** | Tracks approval steps and decisions |
| **Transfer Request Model** | Stores workflow data |
| **Workflow APIs** | Handles workflow operations |
| **Email Notifications** | Sends notifications on state changes |

## 📊 Transfer Requests Workflow

### Workflow States

```
Draft
    ↓
Submitted
    ↓
SupervisorApproved | SupervisorChangesRequested | SupervisorRejected
    ↓
ManagerApproved | ManagerChangesRequested | ManagerRejected
    ↓
Completed
```

### State Transitions

| From State | To State | Description |
|-----------|----------|-------------|
| `Draft` | `Submitted` | User submits request |
| `Submitted` | `SupervisorApproved` | Supervisor approves |
| `Submitted` | `SupervisorChangesRequested` | Supervisor requests changes |
| `Submitted` | `SupervisorRejected` | Supervisor rejects |
| `SupervisorApproved` | `ManagerApproved` | Manager approves |
| `SupervisorApproved` | `ManagerChangesRequested` | Manager requests changes |
| `SupervisorApproved` | `ManagerRejected` | Manager rejects |
| `SupervisorChangesRequested` | `Submitted` | User resubmits after changes |
| `ManagerChangesRequested` | `Submitted` | User resubmits after changes |

### Workflow Roles

| Role | Responsibilities |
|------|------------------|
| **User** | Creates and submits requests |
| **Supervisor** | First-level approval |
| **Manager** | Final approval |

## 📁 Workflow File Structure

```
lib/
└── workflows/
    └── transfer.ts           # Transfer workflow logic

app/
├── (app)/
│   └── workflows/
│       └── transfer-requests/
│           └── page.tsx     # Transfer requests page
└── api/
    └── workflows/
        ├── transfer-requests/
        │   ├── route.ts      # GET, POST /api/workflows/transfer-requests
        │   ├── [id]/
        │   │   ├── route.ts   # GET /api/workflows/transfer-requests/:id
        │   │   ├── approve/
        │   │   │   └── route.ts # POST /api/workflows/transfer-requests/:id/approve
        │   │   ├── reject/
        │   │   │   └── route.ts # POST /api/workflows/transfer-requests/:id/reject
        │   │   └── request-changes/
        │   │       └── route.ts # POST /api/workflows/transfer-requests/:id/request-changes
        │   └── stats/
        │       └── route.ts   # GET /api/workflows/transfer-requests/stats
        └── approvers/
            └── route.ts       # GET /api/workflows/approvers
```

## 🗄️ Database Schema

### TransferRequest Model

```prisma
model TransferRequest {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  title        String
  purpose      String?
  fromLocation String
  toLocation   String
  itemsJson    String?
  status       RequestStatus @default(Draft)
  
  createdById  String
  supervisorId String?
  managerId    String?

  createdBy  User  @relation("CreatedByUser", fields: [createdById])
  supervisor User? @relation("SupervisorUser", fields: [supervisorId])
  manager    User? @relation("ManagerUser", fields: [managerId])

  steps       ApprovalStep[]
  attachments TransferAttachment[]
  comments    TransferComment[]

  @@index([status])
  @@index([createdById])
}
```

### ApprovalStep Model

```prisma
model ApprovalStep {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  decidedAt DateTime?

  requestId  String
  role       ApprovalRole
  approverId String?
  status     StepStatus @default(Pending)
  comment    String?

  request  TransferRequest @relation(fields: [requestId])
  approver User?           @relation("ApproverUser", fields: [approverId])
}
```

### Enums

```prisma
enum RequestStatus {
  Draft
  Submitted
  SupervisorApproved
  SupervisorChangesRequested
  SupervisorRejected
  ManagerApproved
  ManagerChangesRequested
  ManagerRejected
}

enum StepStatus {
  Pending
  Approved
  ChangesRequested
  Rejected
}

enum ApprovalRole {
  Supervisor
  Manager
}
```

## 🔧 Workflow Logic

### State Transition Function

**File**: `lib/workflows/transfer.ts`

```typescript
export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'SupervisorApproved'
  | 'SupervisorChangesRequested'
  | 'SupervisorRejected'
  | 'ManagerApproved'
  | 'ManagerChangesRequested'
  | 'ManagerRejected'

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  const allowed: Record<RequestStatus, RequestStatus[]> = {
    Draft: ['Submitted'],
    Submitted: [
      'SupervisorApproved',
      'SupervisorChangesRequested',
      'SupervisorRejected'
    ],
    SupervisorApproved: [
      'ManagerApproved',
      'ManagerChangesRequested',
      'ManagerRejected'
    ],
    SupervisorChangesRequested: ['Submitted'],
    SupervisorRejected: [],
    ManagerApproved: [],
    ManagerChangesRequested: ['Submitted'],
    ManagerRejected: [],
  }
  return allowed[from]?.includes(to) ?? false
}
```

## 🔄 Workflow Operations

### Create Request

```typescript
// POST /api/workflows/transfer-requests
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const body = await request.json()
  
  const transferRequest = await db.transferRequest.create({
    data: {
      title: body.title,
      fromLocation: body.fromLocation,
      toLocation: body.toLocation,
      createdById: session.user.id,
      status: 'Draft',
    }
  })
  
  return NextResponse.json({ data: transferRequest })
}
```

### Submit Request

```typescript
// User submits draft request
await db.transferRequest.update({
  where: { id: requestId },
  data: {
    status: 'Submitted',
    submittedAt: new Date(),
  }
})
```

### Approve Request

```typescript
// POST /api/workflows/transfer-requests/:id/approve
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = session.user.role
  
  // Get current request
  const transferRequest = await db.transferRequest.findUnique({
    where: { id: params.id }
  })
  
  // Determine new status based on role
  let newStatus: RequestStatus
  if (role === 'Supervisor') {
    newStatus = 'SupervisorApproved'
  } else if (role === 'Manager') {
    newStatus = 'ManagerApproved'
  }
  
  // Update request
  await db.transferRequest.update({
    where: { id: params.id },
    data: {
      status: newStatus,
      completedAt: role === 'Manager' ? new Date() : undefined,
    }
  })
  
  // Create approval step
  await db.approvalStep.create({
    data: {
      requestId: params.id,
      role: role === 'Supervisor' ? 'Supervisor' : 'Manager',
      approverId: session.user.id,
      status: 'Approved',
      decidedAt: new Date(),
    }
  })
  
  // Send notification
  await sendWorkflowNotification(...)
  
  return NextResponse.json({ success: true })
}
```

### Request Changes

```typescript
// POST /api/workflows/transfer-requests/:id/request-changes
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const { comment } = await request.json()
  
  const role = session.user.role
  const newStatus = role === 'Supervisor' 
    ? 'SupervisorChangesRequested' 
    : 'ManagerChangesRequested'
  
  await db.transferRequest.update({
    where: { id: params.id },
    data: { status: newStatus }
  })
  
  await db.approvalStep.create({
    data: {
      requestId: params.id,
      role: role === 'Supervisor' ? 'Supervisor' : 'Manager',
      approverId: session.user.id,
      status: 'ChangesRequested',
      comment,
      decidedAt: new Date(),
    }
  })
  
  return NextResponse.json({ success: true })
}
```

## 📧 Email Notifications

### Notification Flow

Workflow state changes trigger email notifications:

1. **Request Submitted**: Notify supervisor
2. **Supervisor Approved**: Notify manager
3. **Supervisor Requested Changes**: Notify requester
4. **Manager Approved**: Notify requester (completed)
5. **Manager Requested Changes**: Notify requester
6. **Rejected**: Notify requester

### Notification Function

```typescript
// lib/email.ts
export async function sendWorkflowNotification(
  toEmail: string,
  subject: string,
  html: string
) {
  await transporter.sendMail({
    from: config.email.from,
    to: toEmail,
    subject,
    html,
  })
}
```

## 📋 API Endpoints

### Transfer Requests APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workflows/transfer-requests` | GET | List transfer requests |
| `/api/workflows/transfer-requests` | POST | Create transfer request |
| `/api/workflows/transfer-requests/:id` | GET | Get transfer request details |
| `/api/workflows/transfer-requests/:id/approve` | POST | Approve request |
| `/api/workflows/transfer-requests/:id/reject` | POST | Reject request |
| `/api/workflows/transfer-requests/:id/request-changes` | POST | Request changes |
| `/api/workflows/transfer-requests/:id/resubmit` | POST | Resubmit request |
| `/api/workflows/transfer-requests/stats` | GET | Get workflow statistics |
| `/api/workflows/approvers` | GET | Get approvers list |

## 🎯 Workflow Features

### Features

| Feature | Description |
|---------|-------------|
| **State Management** | Tracks workflow states |
| **Approval Steps** | Records approval decisions |
| **Comments** | Allows comments on requests |
| **Attachments** | Supports file attachments |
| **Email Notifications** | Sends notifications on state changes |
| **Role-Based Access** | Different access for different roles |
| **Statistics** | Provides workflow statistics |

## 📝 Best Practices

### 1. Validate State Transitions

Always validate state transitions before updating status.

### 2. Record Approval Steps

Record all approval decisions in ApprovalStep model.

### 3. Send Notifications

Send email notifications on all state changes.

### 4. Handle Errors

Handle errors gracefully and provide clear error messages.

### 5. Use Transactions

Use database transactions for multi-step operations.

## 🔗 Related Documentation

- [Database](./07-database.md) - Workflow models
- [API Routes](./08-api-routes.md) - Workflow APIs
- [Authentication](./06-authentication.md) - Role-based access

---

**Next**: [File Management](./14-file-management.md) | [Dashboard](./15-dashboard-analytics.md)

