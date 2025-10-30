"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileInput } from "@/components/forms/file-input"
import { useSession } from "next-auth/react"
import { messages } from "@/lib/i18n"

export default function TransferRequestDetailsPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [item, setItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const role = session?.user?.role || "User"

  const [title, setTitle] = useState("")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [purpose, setPurpose] = useState("")
  const [attachmentIds, setAttachmentIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const steps = useMemo(() => [
    { key: 'Submitted', label: 'Submitted' },
    { key: 'SupervisorApproved', label: 'Supervisor Approved' },
    { key: 'ManagerApproved', label: 'Manager Approved' }
  ], [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/workflows/transfer-requests/${params.id}`)
        const j = await res.json()
        setItem(j.data)
        if (j.data) {
          setTitle(j.data.title || "")
          setFromLocation(j.data.fromLocation || "")
          setToLocation(j.data.toLocation || "")
          setPurpose(j.data.purpose || "")
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id])

  const canResubmit = role === 'User' && item && (item.status === 'SupervisorChangesRequested' || item.status === 'ManagerChangesRequested')

  const onResubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/workflows/transfer-requests/${params.id}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, fromLocation, toLocation, purpose, attachmentsIds: attachmentIds })
      })
      if (res.ok) {
        router.push('/workflows/transfer-requests')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!item) return <div>Not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{item.fromLocation} → {item.toLocation}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{item.status}</Badge>
          <Button aria-label={messages.workflows.details.back} variant="outline" onClick={() => router.back()}>{messages.workflows.details.back}</Button>
        </div>
      </div>

      <Card className="p-4">
        <h2 className="font-medium mb-3">{messages.workflows.details.status}</h2>
        <div className="flex items-center gap-4">
          {steps.map((s, idx) => {
            const reached = [
              'Submitted',
              'SupervisorApproved', 'ManagerApproved',
              'SupervisorChangesRequested', 'ManagerChangesRequested',
              'SupervisorRejected', 'ManagerRejected'
            ].includes(item.status) && (s.key === 'Submitted' || (s.key === 'SupervisorApproved' && ['SupervisorApproved','ManagerApproved','ManagerChangesRequested'].includes(item.status)) || (s.key === 'ManagerApproved' && ['ManagerApproved'].includes(item.status)))
            return (
              <div key={s.key} className="flex items-center">
                <div className={`h-2 w-2 rounded-full ${reached ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <span className={`ml-2 text-sm ${reached ? 'text-green-700' : 'text-gray-500'}`}>{s.label}</span>
                {idx < steps.length - 1 && <div className="mx-4 h-px w-10 bg-gray-200" />}
              </div>
            )
          })}
        </div>
      </Card>

      {canResubmit && (
        <Card className="p-4">
          <h2 className="font-medium mb-3">{messages.workflows.details.resubmit}</h2>
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
              <label className="block text-sm font-medium mb-1">{messages.workflows.details.purpose}</label>
              <Textarea rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{messages.workflows.form.attachments}</label>
            <FileInput onChange={(_p, id) => id && setAttachmentIds(prev => [...prev, id])} />
            {attachmentIds.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">{attachmentIds.length} file(s) to attach</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button aria-label={messages.workflows.details.resubmit} onClick={onResubmit} disabled={submitting}>{submitting ? 'Submitting...' : messages.workflows.details.resubmit}</Button>
            <Button aria-label={messages.workflows.details.cancel} variant="ghost" onClick={() => router.back()}>{messages.workflows.details.cancel}</Button>
          </div>
        </Card>
      )}

      {item.purpose && (
        <Card className="p-4">
          <h2 className="font-medium mb-2">{messages.workflows.details.purpose}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.purpose}</p>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="font-medium mb-3">{messages.workflows.details.attachments}</h2>
        {item.attachments?.length ? (
          <ul className="list-disc pl-5 text-sm">
            {item.attachments.map((a: any) => (
              <li key={a.id} className="mb-1">
                <a className="text-blue-600 hover:underline" href={`/api/upload/${a.upload.id}`} target="_blank" rel="noreferrer">
                  {a.upload.originalName}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No attachments</div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-medium mb-3">{messages.workflows.details.comments}</h2>
        {item.comments?.length ? (
          <ul className="space-y-3">
            {item.comments.map((c: any) => (
              <li key={c.id}>
                <div className="text-sm">
                  <span className="font-medium">{c.author?.firstName && c.author?.lastName ? `${c.author.firstName} ${c.author.lastName}` : (c.author?.username || c.author?.email)}</span>
                  <span className="ml-2 text-gray-500">({c.authorRole})</span>
                  <span className="ml-2 text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.body}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No comments yet</div>
        )}
      </Card>
    </div>
  )
}


