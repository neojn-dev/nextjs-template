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

export default function NewTransferRequestPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [purpose, setPurpose] = useState("")
  const [attachmentIds, setAttachmentIds] = useState<string[]>([])
  const [supervisorId, setSupervisorId] = useState<string>("")
  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string }>>([])
  
  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/workflows/approvers?role=Supervisor')
      if (!res.ok) return
      const { data } = await res.json()
      setSupervisors(
        (data || []).map((u: any) => ({ id: u.id, name: (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : (u.username || u.email) }))
      )
    })()
  }, [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/workflows/transfer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, fromLocation, toLocation, purpose, supervisorId: supervisorId || undefined, attachmentsIds: attachmentIds })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to create request")
      }
      router.push("/workflows/transfer-requests")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">{messages.workflows.newRequest}</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.title}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Transfer 50 boxes of medicine" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{messages.workflows.form.from}</label>
              <Input value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} placeholder="Warehouse A" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{messages.workflows.form.to}</label>
              <Input value={toLocation} onChange={(e) => setToLocation(e.target.value)} placeholder="Clinic B" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.purpose}</label>
            <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Short justification" rows={4} />
          </div>
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
          <div>
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.supervisor}</label>
            <select className="w-full border rounded-md h-10 px-3" value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
              <option value="">Select supervisor (optional)</option>
              {supervisors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button aria-label={messages.workflows.form.createSubmit} type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : messages.workflows.form.createSubmit}</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


