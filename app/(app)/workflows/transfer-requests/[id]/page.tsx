/**
 * TRANSFER REQUEST DETAILS PAGE COMPONENT
 * 
 * This page displays detailed information about a single transfer request
 * and provides action buttons for workflow operations.
 * 
 * ROUTE: /workflows/transfer-requests/[id]
 * 
 * WORKFLOW OVERVIEW:
 * This is the central page for interacting with transfer requests. It displays:
 * - Request details (title, locations, purpose, items, attachments)
 * - Workflow timeline (horizontal progress visualization)
 * - Approval steps history with comments
 * - Comments thread
 * - Action buttons (Approve, Reject, Request Changes) - role-based
 * - Resubmit form (for users when changes are requested)
 * 
 * ROLE-BASED FEATURES:
 * 
 * USER ROLE:
 * - View request details
 * - Add comments
 * - Resubmit request (when status is ChangesRequested)
 * - Cannot approve/reject/request changes
 * 
 * SUPERVISOR ROLE:
 * - View all request details
 * - Approve requests (must select manager)
 * - Reject requests (with required comment)
 * - Request changes (with required comment)
 * - Add comments
 * - See workflow timeline
 * 
 * MANAGER ROLE:
 * - View all request details
 * - Approve requests (with optional comment)
 * - Reject requests (with required comment)
 * - Request changes (with required comment)
 * - Add comments
 * - See workflow timeline
 * - Can only act on requests assigned to them (if managerId is set)
 * 
 * WORKFLOW TIMELINE:
 * Displays horizontal progress bar showing:
 * - Submitted stage (always completed if request is submitted)
 * - Supervisor Review stage (pending/completed/rejected)
 * - Manager Review stage (pending/completed/rejected)
 * 
 * Each stage shows:
 * - Status icon (clock/checkmark/X)
 * - Stage label
 * - Approver name (if assigned)
 * - Decision date (if decided)
 * - Step comments (if any)
 * 
 * ACTION DIALOGS:
 * - Approve Dialog: Optional comment, manager selection (supervisor only)
 * - Reject Dialog: Required comment (3-2000 characters)
 * - Request Changes Dialog: Required comment (3-2000 characters)
 * 
 * RESUBMISSION:
 * When changes are requested, users can:
 * - Update request details (title, locations, purpose)
 * - Update items list (add/remove/modify items)
 * - Update attachments (replace all attachments)
 * - Resubmit to change status back to "Submitted"
 * 
 * CLIENT-SIDE COMPONENT:
 * Uses "use client" because:
 * - Requires interactive UI (dialogs, forms, buttons)
 * - Uses React hooks (useState, useEffect, useMemo)
 * - Uses session data (useSession)
 * - Handles real-time updates
 * - Manages complex state
 * 
 * AUTHENTICATION:
 * - Requires authenticated session
 * - Protected by middleware
 * - Role-based UI rendering
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileInput } from "@/components/forms/file-input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { messages } from "@/lib/i18n"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, Plus, Trash2, Eye } from "lucide-react"

export default function TransferRequestDetailsPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  
  // REQUEST DATA STATE
  // Stores the loaded transfer request with all related data
  const [item, setItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // SESSION AND ROLE
  // Get current user session and role for authorization
  const { data: session } = useSession()
  const role = session?.user?.role || "User"

  // RESUBMIT FORM STATE
  // Fields for resubmitting request after changes are requested
  const [title, setTitle] = useState("")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [purpose, setPurpose] = useState("")
  const [attachmentIds, setAttachmentIds] = useState<string[]>([])
  const [resubmitItems, setResubmitItems] = useState<Array<{ name: string; quantity: string; unit: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  
  // COMMENT STATE
  // For adding new comments to the request
  const [newComment, setNewComment] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)

  // ACTION DIALOG STATES
  // Control visibility of approve/reject/request changes dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [requestChangesDialogOpen, setRequestChangesDialogOpen] = useState(false)
  const [actionComment, setActionComment] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  
  // MANAGER SELECTION STATE (SUPERVISOR ONLY)
  // Required for supervisor approval - must select manager before approving
  const [selectedManagerId, setSelectedManagerId] = useState<string>("")
  const [managers, setManagers] = useState<Array<{ id: string; name: string }>>([])

  // FETCH REQUEST DATA
  // Loads complete request details including steps, comments, attachments
  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/workflows/transfer-requests/${params.id}`)
      const j = await res.json()
      if (res.ok) {
        setItem(j.data)
        if (j.data) {
          // POPULATE RESUBMIT FORM
          // Pre-fill form fields with current request data
          setTitle(j.data.title || "")
          setFromLocation(j.data.fromLocation || "")
          setToLocation(j.data.toLocation || "")
          setPurpose(j.data.purpose || "")
          
          // PARSE ITEMS JSON
          // Extract items list for resubmit form
          if (j.data.itemsJson) {
            try {
              const parsed = JSON.parse(j.data.itemsJson)
              setResubmitItems(Array.isArray(parsed) ? parsed : [])
            } catch {
              setResubmitItems([])
            }
          } else {
            setResubmitItems([])
          }
        }
      } else {
        setError(j.error || "Failed to load request")
      }
    } catch (e) {
      setError("Failed to load request")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // LOAD REQUEST ON MOUNT
  // Fetch request data when component mounts or ID changes
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  // FETCH MANAGERS FOR SUPERVISOR
  // Load available managers when supervisor views the page
  // Required for supervisor approval (must select manager)
  useEffect(() => {
    if (role === "Supervisor") {
      ;(async () => {
        const res = await fetch('/api/workflows/approvers?role=Manager')
        if (!res.ok) return
        const { data } = await res.json()
        // Format manager names for dropdown display
        setManagers(
          (data || []).map((u: any) => ({ 
            id: u.id, 
            name: (u.firstName && u.lastName) 
              ? `${u.firstName} ${u.lastName}` 
              : (u.username || u.email) 
          }))
        )
      })()
    }
  }, [role])

  // CHECK IF USER CAN RESUBMIT
  // Users can resubmit when status is ChangesRequested
  const canResubmit = role === 'User' && item && (item.status === 'SupervisorChangesRequested' || item.status === 'ManagerChangesRequested')

  // CHECK IF USER CAN PERFORM ACTION
  // Determines if approve/reject/request changes buttons should be shown
  const canPerformAction = (action: 'approve' | 'reject' | 'requestChanges') => {
    if (!item || role !== "Supervisor" && role !== "Manager") return false
    const currentStatus = item.status as string
    
    // SUPERVISOR CAN ACT ON:
    // - Submitted: Initial submission
    // - SupervisorChangesRequested: After requesting changes, can approve/reject/request changes again
    if (role === "Supervisor") {
      return currentStatus === "Submitted" || currentStatus === "SupervisorChangesRequested"
    }
    
    // MANAGER CAN ACT ON:
    // - SupervisorApproved: After supervisor approval
    // - ManagerChangesRequested: After requesting changes, can approve/reject/request changes again
    if (role === "Manager") {
      return currentStatus === "SupervisorApproved" || currentStatus === "ManagerChangesRequested"
    }
    
    return false
  }

  // GET STATUS BADGE VARIANT
  // Returns appropriate badge style based on status
  const getStatusBadgeVariant = (status: string) => {
    if (status.includes("Approved")) return "default"
    if (status.includes("Rejected")) return "destructive"
    if (status.includes("ChangesRequested")) return "secondary"
    if (status === "Submitted") return "outline"
    return "outline"
  }

  // GET STATUS COLOR CLASSES
  // Returns Tailwind CSS classes for status badge styling
  const getStatusColor = (status: string) => {
    if (status.includes("Approved")) return "text-green-700 bg-green-50 border-green-200"
    if (status.includes("Rejected")) return "text-red-700 bg-red-50 border-red-200"
    if (status.includes("ChangesRequested")) return "text-yellow-700 bg-yellow-50 border-yellow-200"
    if (status === "Submitted") return "text-blue-700 bg-blue-50 border-blue-200"
    return "text-gray-700 bg-gray-50 border-gray-200"
  }

  // BUILD WORKFLOW STEPS FOR TIMELINE
  // Creates array of workflow stages for horizontal timeline display
  const workflowSteps = useMemo(() => {
    if (!item) return []
    
    const steps = [
      {
        key: 'Submitted',
        label: 'Submitted',
        // Submitted is completed if request has been submitted or progressed further
        status: item.status === 'Submitted' || item.status.includes('Approved') || item.status.includes('Rejected') || item.status.includes('ChangesRequested') ? 'completed' : 'pending',
        date: item.submittedAt,
        role: null
      },
      {
        key: 'SupervisorApproved',
        label: 'Supervisor Review',
        // Supervisor step is completed if approved and moved to manager, or rejected
        status: item.status === 'SupervisorApproved' || item.status === 'ManagerApproved' || item.status === 'ManagerChangesRequested' || item.status === 'ManagerRejected' ? 'completed' : 
               item.status === 'SupervisorChangesRequested' || item.status === 'SupervisorRejected' ? 'rejected' : 'pending',
        date: item.steps?.find((s: any) => s.role === 'Supervisor')?.decidedAt,
        role: 'Supervisor',
        approver: item.supervisor
      },
      {
        key: 'ManagerApproved',
        label: 'Manager Review',
        // Manager step is completed if approved, rejected if rejected, otherwise pending
        status: item.status === 'ManagerApproved' ? 'completed' : 
               item.status === 'ManagerRejected' ? 'rejected' : 'pending',
        date: item.steps?.find((s: any) => s.role === 'Manager')?.decidedAt,
        role: 'Manager',
        approver: item.manager
      }
    ]

    return steps
  }, [item])

  // PARSE ITEMS FROM JSON
  // Extract items list from JSON string for display
  const items = useMemo(() => {
    if (!item?.itemsJson) return []
    try {
      return JSON.parse(item.itemsJson)
    } catch {
      return []
    }
  }, [item])

  // RESUBMIT REQUEST HANDLER
  // Updates request details and resubmits after changes are requested
  const onResubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      // SERIALIZE ITEMS
      // Filter out empty items before serializing
      const itemsJson = resubmitItems.length > 0 
        ? JSON.stringify(resubmitItems.filter(item => item.name.trim())) 
        : undefined
      
      // CALL RESUBMIT API
      const res = await fetch(`/api/workflows/transfer-requests/${params.id}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, fromLocation, toLocation, purpose, attachmentsIds: attachmentIds, itemsJson })
      })
      if (res.ok) {
        // SUCCESS: REDIRECT TO LIST
        router.push('/workflows/transfer-requests')
      } else {
        const j = await res.json()
        setError(j.error || "Failed to resubmit")
      }
    } catch (e) {
      setError("Failed to resubmit")
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  // APPROVE REQUEST HANDLER
  // Handles approval action with manager selection requirement for supervisors
  const onApprove = async () => {
    // SUPERVISOR VALIDATION
    // Supervisor MUST select a manager before approval
    if (role === "Supervisor" && !selectedManagerId) {
      setError("Please select a manager before approving")
      return
    }
    setActionLoading(true)
    setError(null)
    try {
      // BUILD REQUEST BODY
      // Include comment (optional) and managerId (required for supervisor)
      const body: any = { comment: actionComment || undefined }
      if (role === "Supervisor" && selectedManagerId) {
        body.managerId = selectedManagerId
      }
      
      // CALL APPROVE API
      const res = await fetch(`/api/workflows/transfer-requests/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        // SUCCESS: CLOSE DIALOG AND REFRESH
        setApproveDialogOpen(false)
        setActionComment("")
        setSelectedManagerId("")
        await refresh()
      } else {
        const j = await res.json()
        setError(j.error || "Failed to approve request")
      }
    } catch (e) {
      setError("Failed to approve request")
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  // REJECT REQUEST HANDLER
  // Handles rejection action with required comment validation
  const onReject = async () => {
    // CLIENT-SIDE VALIDATION
    // Comment is required and must be at least 3 characters
    const trimmedComment = actionComment.trim()
    if (!trimmedComment || trimmedComment.length < 3) {
      setError("Please provide a rejection reason (at least 3 characters)")
      return
    }
    setActionLoading(true)
    setError(null)
    try {
      // CALL REJECT API
      const res = await fetch(`/api/workflows/transfer-requests/${params.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: trimmedComment })
      })
      if (res.ok) {
        // SUCCESS: CLOSE DIALOG AND REFRESH
        setRejectDialogOpen(false)
        setActionComment("")
        await refresh()
      } else {
        // ERROR: DISPLAY VALIDATION MESSAGE
        const j = await res.json()
        const errorMsg = j.error || j.details?.[0]?.message || "Failed to reject request"
        setError(errorMsg)
      }
    } catch (e) {
      setError("Failed to reject request")
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  // REQUEST CHANGES HANDLER
  // Handles request changes action with required comment validation
  const onRequestChanges = async () => {
    // CLIENT-SIDE VALIDATION
    // Comment is required and must be at least 3 characters
    const trimmedComment = actionComment.trim()
    if (!trimmedComment || trimmedComment.length < 3) {
      setError("Please describe what changes are needed (at least 3 characters)")
      return
    }
    setActionLoading(true)
    setError(null)
    try {
      // CALL REQUEST CHANGES API
      const res = await fetch(`/api/workflows/transfer-requests/${params.id}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: trimmedComment })
      })
      if (res.ok) {
        // SUCCESS: CLOSE DIALOG AND REFRESH
        setRequestChangesDialogOpen(false)
        setActionComment("")
        await refresh()
      } else {
        // ERROR: DISPLAY VALIDATION MESSAGE
        const j = await res.json()
        const errorMsg = j.error || j.details?.[0]?.message || "Failed to request changes"
        setError(errorMsg)
      }
    } catch (e) {
      setError("Failed to request changes")
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  // ADD COMMENT HANDLER
  // Adds a new comment to the request thread
  const onAddComment = async () => {
    // VALIDATION
    // Comment body cannot be empty
    if (!newComment.trim()) return
    setCommentLoading(true)
    setError(null)
    try {
      // CALL COMMENT API
      const res = await fetch(`/api/workflows/transfer-requests/${params.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment })
      })
      if (res.ok) {
        // SUCCESS: CLEAR COMMENT INPUT AND REFRESH
        setNewComment("")
        await refresh()
      } else {
        const j = await res.json()
        setError(j.error || "Failed to add comment")
      }
    } catch (e) {
      setError("Failed to add comment")
      console.error(e)
    } finally {
      setCommentLoading(false)
    }
  }

  // GET USER NAME HELPER
  // Formats user display name from user object
  const getUserName = (user: any) => {
    if (!user) return "Unknown"
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    return user.username || user.email || "Unknown"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <LoadingSpinner className="h-6 w-6" />
          <span className="text-gray-600">Loading request details...</span>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Request not found</p>
          <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{item.title}</h1>
          <div className="flex items-center gap-2 text-base text-gray-600">
            <span className="font-medium">{item.fromLocation}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium">{item.toLocation}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge 
            variant={getStatusBadgeVariant(item.status)} 
            className={`${getStatusColor(item.status)} text-sm font-semibold px-3 py-1`}
          >
            {item.status}
          </Badge>
          {(canPerformAction('approve') || canPerformAction('reject') || canPerformAction('requestChanges')) && (
            <div className="flex items-center gap-2">
              {canPerformAction('approve') && (
                <Button size="default" onClick={() => setApproveDialogOpen(true)}>Approve</Button>
              )}
              {canPerformAction('requestChanges') && (
                <Button size="default" variant="outline" onClick={() => setRequestChangesDialogOpen(true)}>Request Changes</Button>
              )}
              {canPerformAction('reject') && (
                <Button size="default" variant="destructive" onClick={() => setRejectDialogOpen(true)}>Reject</Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Workflow Timeline - Horizontal */}
      <Card className="p-6">
        <h2 className="font-semibold mb-6 text-xl text-gray-900">Workflow Status</h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ 
                width: `${((workflowSteps.filter(s => s.status === 'completed' || s.status === 'rejected').length - 1) / Math.max(workflowSteps.length - 1, 1)) * 100}%` 
              }}
            />
          </div>
          
          {/* Steps */}
          <div className="relative flex items-start justify-between">
            {workflowSteps.map((step, idx) => {
              const stepData = item.steps?.find((s: any) => s.role === step.role)
              const isActive = step.status === 'completed' || step.status === 'rejected'
              const isRejected = step.status === 'rejected'
              const isPending = step.status === 'pending'
              
              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative">
                  {/* Step Icon */}
                  <div className={`relative z-10 rounded-full p-3 transition-all ${
                    isRejected 
                      ? 'bg-red-100 border-2 border-red-500' 
                      : isActive 
                        ? 'bg-green-100 border-2 border-green-500' 
                        : 'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    {isRejected ? (
                      <XCircle className={`h-6 w-6 ${isRejected ? 'text-red-600' : 'text-gray-400'}`} />
                    ) : isActive ? (
                      <CheckCircle2 className={`h-6 w-6 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    ) : (
                      <Clock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="mt-4 text-center w-full max-w-[200px]">
                    <h3 className={`font-semibold text-sm mb-1 ${
                      isActive ? 'text-gray-900' : isPending ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </h3>
                    {step.approver && (
                      <p className="text-xs text-gray-500 mb-2">
                        {getUserName(step.approver)}
                      </p>
                    )}
                    {stepData && (
                      <div className="mt-2 space-y-1">
                        <p className={`text-xs font-medium ${
                          stepData.status === 'Approved' ? 'text-green-600' :
                          stepData.status === 'Rejected' ? 'text-red-600' :
                          stepData.status === 'ChangesRequested' ? 'text-yellow-600' :
                          'text-gray-500'
                        }`}>
                          {stepData.status === 'Approved' && '✓ Approved'}
                          {stepData.status === 'Rejected' && '✗ Rejected'}
                          {stepData.status === 'ChangesRequested' && '⚠ Changes Requested'}
                          {stepData.status === 'Pending' && '⏳ Pending'}
                        </p>
                        {stepData.decidedAt && (
                          <p className="text-xs text-gray-400">
                            {new Date(stepData.decidedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    {step.date && !stepData && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(step.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Comments Section Below Steps */}
          {workflowSteps.some(s => {
            const stepData = item.steps?.find((st: any) => st.role === s.role)
            return stepData?.comment
          }) && (
            <div className="mt-8 space-y-4 border-t pt-6">
              {workflowSteps.map((step) => {
                const stepData = item.steps?.find((s: any) => s.role === step.role)
                if (!stepData?.comment) return null
                
                return (
                  <div key={step.key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm text-gray-900">{step.label}</span>
                      <Badge variant="outline" className="text-xs">{step.role || 'User'}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{stepData.comment}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Request Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-5 text-lg text-gray-900">Request Details</h2>
          <dl className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created By</dt>
              <dd className="text-base font-medium text-gray-900">{getUserName(item.createdBy)}</dd>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created At</dt>
              <dd className="text-base text-gray-700">{new Date(item.createdAt).toLocaleString()}</dd>
            </div>
            {item.submittedAt && (
              <div className="border-b border-gray-100 pb-3">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Submitted At</dt>
                <dd className="text-base text-gray-700">{new Date(item.submittedAt).toLocaleString()}</dd>
              </div>
            )}
            {item.completedAt && (
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Completed At</dt>
                <dd className="text-base text-gray-700">{new Date(item.completedAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </Card>

        {item.purpose && (
          <Card className="p-6">
            <h2 className="font-semibold mb-5 text-lg text-gray-900">Purpose</h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{item.purpose}</p>
          </Card>
        )}
      </div>

      {/* Items */}
      {items.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold mb-5 text-lg text-gray-900">Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 uppercase tracking-wide">Name</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 uppercase tracking-wide">Quantity</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 uppercase tracking-wide">Unit</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-base font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-base text-gray-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-base text-gray-700">{item.unit || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Attachments */}
      <Card className="p-6">
        <h2 className="font-semibold mb-5 text-lg text-gray-900">Attachments</h2>
        {item.attachments?.length ? (
          <div className="space-y-2">
            {item.attachments.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                <Eye className="h-5 w-5 text-gray-400" />
                <a 
                  className="text-blue-600 hover:text-blue-700 hover:underline flex-1 font-medium text-base" 
                  href={`/api/upload/${a.upload.id}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  {a.upload.originalName}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-base text-gray-500 py-2">No attachments</div>
        )}
      </Card>

      {/* Resubmit Form */}
      {canResubmit && (
        <Card className="p-6 border-2 border-yellow-200 bg-yellow-50/30">
          <h2 className="font-semibold mb-5 text-lg text-gray-900">Resubmit Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">{messages.workflows.form.title}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{messages.workflows.columns.from}</label>
              <Input value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{messages.workflows.columns.to}</label>
              <Input value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <Textarea rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
          </div>
          
          {/* Items Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Items</label>
              <Button type="button" variant="outline" size="sm" onClick={() => setResubmitItems([...resubmitItems, { name: "", quantity: "", unit: "" }])}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            {resubmitItems.length > 0 && (
              <div className="space-y-2 border rounded-md p-4 bg-gray-50">
                {resubmitItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...resubmitItems]
                          newItems[index] = { ...newItems[index], name: e.target.value }
                          setResubmitItems(newItems)
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...resubmitItems]
                          newItems[index] = { ...newItems[index], quantity: e.target.value }
                          setResubmitItems(newItems)
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Unit (e.g., boxes)"
                        value={item.unit}
                        onChange={(e) => {
                          const newItems = [...resubmitItems]
                          newItems[index] = { ...newItems[index], unit: e.target.value }
                          setResubmitItems(newItems)
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setResubmitItems(resubmitItems.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.attachments}</label>
            <FileInput onChange={(_p, id) => id && setAttachmentIds(prev => [...prev, id])} />
            {attachmentIds.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">{attachmentIds.length} file(s) to attach</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onResubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Resubmit'}
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Comments */}
      <Card className="p-6">
        <h2 className="font-semibold mb-5 text-lg text-gray-900">Comments</h2>
        <div className="space-y-4 mb-6">
          {item.comments?.length ? (
            item.comments.map((c: any) => (
              <div key={c.id} className="border-l-4 border-gray-200 pl-4 py-2 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-base text-gray-900">{getUserName(c.author)}</span>
                  <Badge variant="outline" className="text-xs">{c.authorRole}</Badge>
                  <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{c.body}</div>
              </div>
            ))
          ) : (
            <div className="text-base text-gray-500 py-4 text-center">No comments yet</div>
          )}
        </div>
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="text-base"
          />
          <Button onClick={onAddComment} disabled={commentLoading || !newComment.trim()} size="default">
            {commentLoading ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transfer Request</DialogTitle>
            <DialogDescription>
              {role === "Supervisor" 
                ? "Select a manager for review and add an optional comment for this approval."
                : "Add an optional comment for this approval."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {role === "Supervisor" && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Manager *</label>
                <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager..." />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedManagerId && (
                  <p className="text-xs text-red-600 mt-1">Manager selection is required for approval</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <Textarea
                placeholder="Optional comment..."
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setApproveDialogOpen(false)
              setActionComment("")
              setSelectedManagerId("")
              setError(null)
            }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              onClick={onApprove} 
              disabled={actionLoading || (role === "Supervisor" && !selectedManagerId)}
            >
              {actionLoading ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false)
              setActionComment("")
            }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onReject} 
              disabled={actionLoading || !actionComment.trim() || actionComment.trim().length < 3}
            >
              {actionLoading ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={requestChangesDialogOpen} onOpenChange={setRequestChangesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what changes are needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe required changes..."
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRequestChangesDialogOpen(false)
              setActionComment("")
            }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              onClick={onRequestChanges} 
              disabled={actionLoading || !actionComment.trim() || actionComment.trim().length < 3}
            >
              {actionLoading ? "Submitting..." : "Request Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
