/**
 * CREATE NEW TRANSFER REQUEST PAGE COMPONENT
 * 
 * This page allows users to create a new transfer request.
 * 
 * ROUTE: /workflows/transfer-requests/new
 * 
 * WORKFLOW OVERVIEW:
 * Users fill out a form to create a transfer request. When submitted,
 * the request is immediately created with "Submitted" status and enters
 * the approval workflow.
 * 
 * FORM FIELDS:
 * - title: Request title (required, 3-200 characters)
 * - fromLocation: Source location (required, 1-200 characters)
 * - toLocation: Destination location (required, 1-200 characters)
 * - purpose: Request purpose/description (optional, max 2000 characters)
 * - supervisorId: Optional supervisor selection
 * - items: Dynamic list of items to transfer (name, quantity, unit)
 * - attachments: File attachments (max 10 files)
 * 
 * ITEMS MANAGEMENT:
 * - Users can add multiple items dynamically
 * - Each item has: name, quantity, unit
 * - Items are stored as JSON array in itemsJson field
 * - Empty items (no name) are filtered out before submission
 * 
 * SUPERVISOR SELECTION:
 * - Fetches list of active supervisors on component mount
 * - Supervisor selection is optional
 * - If selected, supervisor receives email notification
 * 
 * SUBMISSION FLOW:
 * 1. User fills out form
 * 2. Form validation (client-side and server-side)
 * 3. Items are serialized to JSON
 * 4. POST request to /api/workflows/transfer-requests
 * 5. Request is created with "Submitted" status
 * 6. Attachments are linked to request
 * 7. Audit log entry is created
 * 8. Supervisor is notified (if selected)
 * 9. User is redirected to requests list page
 * 
 * VALIDATION:
 * - Title: Required, 3-200 characters
 * - Locations: Required, 1-200 characters each
 * - Purpose: Optional, max 2000 characters
 * - Items: Optional, but if provided must have valid structure
 * - Attachments: Optional, max 10 files
 * 
 * CLIENT-SIDE COMPONENT:
 * Uses "use client" because:
 * - Requires interactive form (inputs, dynamic items)
 * - Uses React hooks (useState, useEffect)
 * - Handles form submission
 * - Manages dynamic item list
 * 
 * AUTHENTICATION:
 * - Requires authenticated session
 * - Protected by middleware
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileInput } from "@/components/forms/file-input"
import { messages } from "@/lib/i18n"
import { useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"

// ITEM INTERFACE
// Defines structure for transfer items
interface Item {
  name: string      // Item name (e.g., "Bandages")
  quantity: string // Quantity as string (e.g., "100")
  unit: string      // Unit of measurement (e.g., "boxes", "pieces")
}

export default function NewTransferRequestPage() {
  const router = useRouter()
  
  // FORM STATE
  // Basic request fields
  const [title, setTitle] = useState("")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [purpose, setPurpose] = useState("")
  const [attachmentIds, setAttachmentIds] = useState<string[]>([])
  const [supervisorId, setSupervisorId] = useState<string>("")
  
  // SUPERVISOR LIST
  // Fetched from API on component mount
  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string }>>([])
  
  // ITEMS MANAGEMENT
  // Dynamic list of items to transfer
  const [items, setItems] = useState<Item[]>([])
  
  // UI STATE
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // FETCH SUPERVISORS ON MOUNT
  // Load list of available supervisors for selection
  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/workflows/approvers?role=Supervisor')
      if (!res.ok) return
      const { data } = await res.json()
      // Format supervisor names for display
      setSupervisors(
        (data || []).map((u: any) => ({ 
          id: u.id, 
          name: (u.firstName && u.lastName) 
            ? `${u.firstName} ${u.lastName}` 
            : (u.username || u.email) 
        }))
      )
    })()
  }, [])

  // ADD ITEM TO LIST
  // Adds a new empty item row to the form
  const addItem = () => {
    setItems([...items, { name: "", quantity: "", unit: "" }])
  }

  // REMOVE ITEM FROM LIST
  // Removes item at specified index
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // UPDATE ITEM FIELD
  // Updates a specific field of an item at given index
  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // FORM SUBMISSION HANDLER
  // Validates form, serializes items, and submits request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      // SERIALIZE ITEMS TO JSON
      // Filter out empty items (no name) before serializing
      const itemsJson = items.length > 0 
        ? JSON.stringify(items.filter(item => item.name.trim())) 
        : undefined
      
      // SUBMIT REQUEST
      // POST to create endpoint with all form data
      const res = await fetch("/api/workflows/transfer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          fromLocation, 
          toLocation, 
          purpose, 
          supervisorId: supervisorId || undefined, // Only send if selected
          attachmentsIds: attachmentIds,
          itemsJson
        })
      })
      
      // HANDLE ERRORS
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "Failed to create request")
        return
      }
      
      // SUCCESS: REDIRECT TO LIST PAGE
      // Request created successfully, show list of requests
      router.push("/workflows/transfer-requests")
    } catch (e) {
      setError("Failed to create request")
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">{messages.workflows.newRequest}</h1>
      
      {/* ERROR DISPLAY */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TITLE FIELD */}
          <div>
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.title}</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Transfer 50 boxes of medicine" 
              required 
            />
          </div>
          
          {/* LOCATION FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{messages.workflows.form.from}</label>
              <Input 
                value={fromLocation} 
                onChange={(e) => setFromLocation(e.target.value)} 
                placeholder="Warehouse A" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{messages.workflows.form.to}</label>
              <Input 
                value={toLocation} 
                onChange={(e) => setToLocation(e.target.value)} 
                placeholder="Clinic B" 
                required 
              />
            </div>
          </div>

          {/* PURPOSE FIELD */}
          <div>
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.purpose}</label>
            <Textarea 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)} 
              placeholder="Short justification" 
              rows={4} 
            />
          </div>

          {/* ITEMS SECTION */}
          {/* Dynamic list of items to transfer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Items</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            {items.length > 0 && (
              <div className="space-y-2 border rounded-md p-4 bg-gray-50">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    {/* ITEM NAME */}
                    <div className="col-span-5">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                      />
                    </div>
                    {/* QUANTITY */}
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                    </div>
                    {/* UNIT */}
                    <div className="col-span-3">
                      <Input
                        placeholder="Unit (e.g., boxes)"
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                      />
                    </div>
                    {/* REMOVE BUTTON */}
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ATTACHMENTS SECTION */}
          <div>
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.attachments}</label>
            <div className="space-y-2">
              <FileInput
                onChange={(_path, id) => id && setAttachmentIds(prev => [...prev, id])}
              />
              {attachmentIds.length > 0 && (
                <div className="text-xs text-gray-500">{attachmentIds.length} file(s) attached</div>
              )}
            </div>
          </div>

          {/* SUPERVISOR SELECTION */}
          <div>
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.supervisor}</label>
            <select 
              className="w-full border rounded-md h-10 px-3" 
              value={supervisorId} 
              onChange={(e) => setSupervisorId(e.target.value)}
            >
              <option value="">Select supervisor (optional)</option>
              {supervisors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center gap-2">
            <Button 
              aria-label={messages.workflows.form.createSubmit} 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : messages.workflows.form.createSubmit}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
