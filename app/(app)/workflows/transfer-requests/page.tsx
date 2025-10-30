"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { messages } from "@/lib/i18n"

export default function TransferRequestsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const role = session?.user?.role || "User"
  const [tab, setTab] = useState("all")
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [managers, setManagers] = useState<Array<{ id: string; name: string }>>([])
  const canAct = useMemo(() => role === "Supervisor" || role === "Manager", [role])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams({ tab, page: String(page), limit: String(limit) })
        if (search) qs.set('search', search)
        if (status) qs.set('status', status)
        const res = await fetch(`/api/workflows/transfer-requests?${qs.toString()}`)
        const j = await res.json()
        setRows(j.data || [])
        setTotal(j.meta?.total || 0)
      } finally {
        setLoading(false)
      }
    })()
  }, [tab, page, limit, search, status])

  useEffect(() => {
    if (role === "Supervisor") {
      ;(async () => {
        const res = await fetch('/api/workflows/approvers?role=Manager')
        if (!res.ok) return
        const { data } = await res.json()
        setManagers(
          (data || []).map((u: any) => ({ id: u.id, name: (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : (u.username || u.email) }))
        )
      })()
    }
  }, [role])

  const refresh = async () => {
    const qs = new URLSearchParams({ tab, page: String(page), limit: String(limit) })
    if (search) qs.set('search', search)
    if (status) qs.set('status', status)
    const res = await fetch(`/api/workflows/transfer-requests?${qs.toString()}`)
    const j = await res.json()
    setRows(j.data || [])
    setTotal(j.meta?.total || 0)
  }

  const onApprove = async (id: string) => {
    const res = await fetch(`/api/workflows/transfer-requests/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    if (res.ok) refresh()
  }
  const onReject = async (id: string) => {
    const comment = window.prompt('Reason for rejection:')
    if (!comment) return
    const res = await fetch(`/api/workflows/transfer-requests/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) })
    if (res.ok) refresh()
  }
  const onRequestChanges = async (id: string) => {
    const comment = window.prompt('Describe required changes:')
    if (!comment) return
    const res = await fetch(`/api/workflows/transfer-requests/${id}/request-changes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) })
    if (res.ok) refresh()
  }
  const onAssignManager = async (id: string, managerId: string) => {
    if (!managerId) return
    const res = await fetch(`/api/workflows/transfer-requests/${id}/assign-manager`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ managerId }) })
    if (res.ok) refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{messages.workflows.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Create and track medicine transfer requests</p>
        </div>
        {role && (
          <div className="flex items-center gap-2">
            {role === "User" && (
              <Button aria-label={messages.workflows.newRequest} onClick={() => router.push("/workflows/transfer-requests/new")}>{messages.workflows.newRequest}</Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <input aria-label="Search requests" className="border rounded-md h-9 px-3 w-full md:w-72" placeholder={messages.workflows.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
            <select aria-label="Filter by status" className="border rounded-md h-9 px-2" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">{messages.workflows.filterStatus}</option>
              {(["Draft","Submitted","SupervisorApproved","SupervisorChangesRequested","SupervisorRejected","ManagerApproved","ManagerChangesRequested","ManagerRejected"] as const).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {(role === "Supervisor" || role === "Manager") && (
            <div className="flex items-center gap-2">
              {(["all","new","completed"] as const).map(k => (
                <Button aria-label={messages.workflows.tabs[k]} key={k} variant={tab === k ? "default" : "outline"} size="sm" onClick={() => setTab(k)}>
                  {messages.workflows.tabs[k]}
                </Button>
              ))}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">{messages.workflows.columns.title}</th>
                  <th className="py-2 pr-4">{messages.workflows.columns.from}</th>
                  <th className="py-2 pr-4">{messages.workflows.columns.to}</th>
                  <th className="py-2 pr-4">{messages.workflows.columns.status}</th>
                  <th className="py-2 pr-4">{messages.workflows.columns.created}</th>
                  {canAct && <th className="py-2 pr-4">{messages.workflows.columns.actions}</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="py-4 text-gray-500" colSpan={5}>Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td className="py-4 text-gray-500" colSpan={5}>No requests found</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-4">
                        <Link className="text-blue-600 hover:underline" href={`/workflows/transfer-requests/${r.id}`}>{r.title}</Link>
                      </td>
                      <td className="py-2 pr-4">{r.fromLocation}</td>
                      <td className="py-2 pr-4">{r.toLocation}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{r.status}</Badge>
                      </td>
                      <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleString()}</td>
                      {canAct && (
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" onClick={() => onApprove(r.id)}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => onRequestChanges(r.id)}>Request changes</Button>
                            <Button size="sm" variant="destructive" onClick={() => onReject(r.id)}>Reject</Button>
                            {role === "Supervisor" && (
                              <div className="flex items-center gap-2">
                                <select className="border rounded-md h-9 px-2" defaultValue="" onChange={(e) => onAssignManager(r.id, e.target.value)}>
                                  <option value="">Assign manager...</option>
                                  {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
              <div>
                Page {page} of {Math.max(1, Math.ceil(total / limit))}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


