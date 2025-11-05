/**
 * TRANSFER REQUESTS PAGE COMPONENT
 * 
 * Main page for viewing and managing transfer requests workflow.
 * 
 * ROUTE: /workflows/transfer-requests
 * 
 * WHAT IT DOES:
 * - Lists transfer requests with filtering and pagination
 * - Allows creating new transfer requests (for Users)
 * - Provides role-based access control
 * 
 * FEATURES:
 * - Tab-based filtering (all, new, completed)
 * - Search functionality
 * - Status filtering
 * - Pagination
 * - View Details button to navigate to individual request pages
 * 
 * ROLE-BASED ACCESS:
 * - User: Can create requests, view own requests only
 * - Supervisor: Can view all requests
 * - Manager: Can view all requests
 * 
 * CLIENT-SIDE COMPONENT:
 * Uses "use client" because:
 * - Requires interactive UI (tabs, buttons)
 * - Uses React hooks (useState, useEffect)
 * - Uses session data (useSession)
 * - Handles user interactions
 * 
 * AUTHENTICATION:
 * - Requires authenticated session
 * - Protected by middleware
 */

"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { messages } from "@/lib/i18n"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function TransferRequestsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role || "User"

  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<"all" | "new" | "completed">("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string | null>(null)

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes("Approved")) return "default"
    if (status.includes("Rejected")) return "destructive"
    if (status.includes("ChangesRequested")) return "secondary"
    if (status === "Submitted") return "outline"
    return "outline"
  }

  const getStatusColor = (status: string) => {
    if (status.includes("Approved")) return "text-green-700 bg-green-50 border-green-200"
    if (status.includes("Rejected")) return "text-red-700 bg-red-50 border-red-200"
    if (status.includes("ChangesRequested")) return "text-yellow-700 bg-yellow-50 border-yellow-200"
    if (status === "Submitted") return "text-blue-700 bg-blue-50 border-blue-200"
    return "text-gray-700 bg-gray-50 border-gray-200"
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, limit, search, status])

  const refresh = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ tab, page: String(page), limit: String(limit) })
      if (search) qs.set('search', search)
      if (status) qs.set('status', status)
      const res = await fetch(`/api/workflows/transfer-requests?${qs.toString()}`)
      const j = await res.json()
      if (res.ok) {
        setRows(j.data || [])
        setTotal(j.meta?.total || 0)
        setError(null)
      } else {
        setError(j.error || "Failed to load requests")
      }
    } catch (e) {
      setError("Failed to load requests")
      console.error(e)
    } finally {
      setLoading(false)
    }
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

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Input 
              aria-label="Search requests" 
              className="w-full md:w-72" 
              placeholder={messages.workflows.searchPlaceholder} 
              value={search} 
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }} 
            />
            <select 
              aria-label="Filter by status" 
              className="border rounded-md h-9 px-2" 
              value={status} 
              onChange={e => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">{messages.workflows.filterStatus}</option>
              {(["Draft","Submitted","SupervisorApproved","SupervisorChangesRequested","SupervisorRejected","ManagerApproved","ManagerChangesRequested","ManagerRejected"] as const).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {(role === "Supervisor" || role === "Manager") && (
            <div className="flex items-center gap-2">
              {(["all","new","completed"] as const).map(k => (
                <Button 
                  aria-label={messages.workflows.tabs[k]} 
                  key={k} 
                  variant={tab === k ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => {
                    setTab(k)
                    setPage(1)
                  }}
                >
                  {messages.workflows.tabs[k]}
                </Button>
              ))}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 pr-4 font-medium">{messages.workflows.columns.title}</th>
                  <th className="py-3 pr-4 font-medium">{messages.workflows.columns.from}</th>
                  <th className="py-3 pr-4 font-medium">{messages.workflows.columns.to}</th>
                  <th className="py-3 pr-4 font-medium">{messages.workflows.columns.status}</th>
                  <th className="py-3 pr-4 font-medium">{messages.workflows.columns.created}</th>
                  <th className="py-3 pr-4 font-medium text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-8 text-center text-gray-500" colSpan={6}>
                      <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner className="h-4 w-4" />
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-gray-500" colSpan={6}>
                      No requests found
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <Link className="text-blue-600 hover:underline font-medium" href={`/workflows/transfer-requests/${r.id}`}>
                          {r.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">{r.fromLocation}</td>
                      <td className="py-3 pr-4">{r.toLocation}</td>
                      <td className="py-3 pr-4">
                        <Badge 
                          variant={getStatusBadgeVariant(r.status)}
                          className={getStatusColor(r.status)}
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/workflows/transfer-requests/${r.id}`)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {total > 0 && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div>
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} requests
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={page === 1 || loading} 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs">
                    Page {page} of {Math.max(1, Math.ceil(total / limit))}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={page >= Math.ceil(total / limit) || loading} 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
