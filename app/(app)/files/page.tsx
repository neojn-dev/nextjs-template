"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { 
  Button 
} from "@/components/ui/button"
import { 
  Card, CardContent 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  FolderPlus, Upload, Grid, List, SortAsc, SortDesc, RefreshCw, Info, Trash2, Pencil, ArrowRightLeft, ChevronRight,
  Folder as FolderIcon, File as FileIcon, Image as ImageIcon, FileText as FileTextIcon, Code as CodeIcon,
  Music as MusicIcon, Video as VideoIcon, Archive as ArchiveIcon, FileSpreadsheet as SpreadsheetIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { formatFileSize } from "@/lib/utils"

type Item = {
  name: string
  path: string
  type: "file" | "folder"
  size: number
  modifiedAt: number
}

type SortKey = "name" | "size" | "modifiedAt" | "type"

export default function FileManagerPage() {
  const [cwd, setCwd] = useState<string>("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc")
  const [filter, setFilter] = useState("")
  const [selected, setSelected] = useState<Item|null>(null)
  const [textPreview, setTextPreview] = useState<string>("")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number>(15)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [itemToMove, setItemToMove] = useState<Item|null>(null)
  const [targetPath, setTargetPath] = useState("")
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadSelectedFile, setUploadSelectedFile] = useState<File | null>(null)
  const [uploadFilename, setUploadFilename] = useState("")
  const [isUploadingModal, setIsUploadingModal] = useState(false)
  const [isUploadDragging, setIsUploadDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchList = async (pathStr: string) => {
    setLoading(true)
    try {
      const q = pathStr ? `?path=${encodeURIComponent(pathStr)}` : ""
      const res = await fetch(`/api/file-manager${q}`)
      const data = await res.json()
      setItems(data.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList(cwd) }, [cwd])

  const sortedFiltered = useMemo(() => {
    const f = filter.trim().toLowerCase()
    let list = items.filter(i => i.name.toLowerCase().includes(f))
    list = list.sort((a,b) => {
      const dir = sortDir === "asc" ? 1 : -1
      let av: any = a[sortKey]
      let bv: any = b[sortKey]
      if (sortKey === "name" || sortKey === "type") {
        av = String(av).toLowerCase(); bv = String(bv).toLowerCase()
      }
      if (av < bv) return -1*dir
      if (av > bv) return 1*dir
      return 0
    })
    // Keep folders first
    list = list.sort((a,b) => a.type === b.type ? 0 : a.type === "folder" ? -1 : 1)
    return list
  }, [items, filter, sortKey, sortDir])

  const displayedItems = useMemo(() => {
    return sortedFiltered.slice(0, visibleCount)
  }, [sortedFiltered, visibleCount])

  // Reset pagination window when dependencies change
  useEffect(() => {
    setVisibleCount(15)
  }, [cwd, filter, sortKey, sortDir])

  // Infinite scroll via intersection observer
  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        setVisibleCount((c) => {
          if (c >= sortedFiltered.length) return c
          return Math.min(c + 15, sortedFiltered.length)
        })
      }
    }, { root: null, rootMargin: "400px", threshold: 0 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [sortedFiltered.length])

  const breadcrumbs = useMemo(() => {
    const parts = cwd.split("/").filter(Boolean)
    const crumbs: { name: string, path: string }[] = [{ name: "Drive", path: "" }]
    let acc = ""
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part
      crumbs.push({ name: part, path: acc })
    }
    return crumbs
  }, [cwd])

  const openFolder = (item: Item) => {
    if (item.type === "folder") setCwd(item.path)
  }

  const handleCreateFolder = async () => {
    const name = folderName.trim()
    if (!name) return
    
    const res = await fetch("/api/file-manager/folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentPath: cwd, name })
    })
    if (res.ok) {
      setFolderName("")
      setCreateFolderOpen(false)
      await fetchList(cwd)
    }
  }

  const renameEntry = async (item: Item) => {
    const newName = prompt("New name", item.name)
    if (!newName || newName === item.name) return
    const to = `${cwd ? cwd + "/" : ""}${newName}`
    const endpoint = item.type === "folder" ? "/api/file-manager/folder" : "/api/file-manager/file"
    const res = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: item.path, to }) })
    if (res.ok) fetchList(cwd)
  }

  const deleteEntry = async (item: Item) => {
    if (!confirm(`Delete ${item.name}?`)) return
    const endpoint = item.type === "folder" 
      ? `/api/file-manager/folder?path=${encodeURIComponent(item.path)}`
      : `/api/file-manager/file?path=${encodeURIComponent(item.path)}`
    const res = await fetch(endpoint, { method: "DELETE" })
    if (res.ok) fetchList(cwd)
  }

  const handleMoveClick = (item: Item) => {
    setItemToMove(item)
    setTargetPath(cwd)
    setMoveDialogOpen(true)
  }

  const handleMoveEntry = async () => {
    if (!itemToMove || !targetPath.trim()) return
    
    const normalizedTarget = targetPath.replace(/^\/+|\/+$/g, "")
    const newPath = normalizedTarget ? `${normalizedTarget}/${itemToMove.name}` : itemToMove.name
    const endpoint = itemToMove.type === "folder" ? "/api/file-manager/folder" : "/api/file-manager/file"
    const res = await fetch(endpoint, { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ from: itemToMove.path, to: newPath }) 
    })
    if (res.ok) {
      setMoveDialogOpen(false)
      setItemToMove(null)
      setTargetPath("")
      await fetchList(cwd)
    }
  }

  const handleUploadClick = () => setUploadDialogOpen(true)

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setUploadSelectedFile(file)
    setUploadFilename(file.name)
    setUploadDialogOpen(true)
    // Clear the input using the ref to avoid null reference errors
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    const file = files[0]
    setUploadSelectedFile(file)
    setUploadFilename(file.name)
    setUploadDialogOpen(true)
  }

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault()

  const getItemThumb = (item: Item) => {
    if (item.type === "folder") {
      return {
        Icon: FolderIcon,
        bg: "bg-yellow-100 border-yellow-200",
        fg: "text-yellow-700"
      }
    }
    const name = item.name.toLowerCase()
    const ext = name.includes(".") ? name.split(".").pop() || "" : ""
    if (/(png|jpe?g|gif|webp|bmp|svg)$/.test(ext)) {
      return { Icon: ImageIcon, bg: "bg-pink-100 border-pink-200", fg: "text-pink-700" }
    }
    if (/(mp4|webm|ogg|mov|mkv)$/.test(ext)) {
      return { Icon: VideoIcon, bg: "bg-purple-100 border-purple-200", fg: "text-purple-700" }
    }
    if (/(mp3|wav|ogg|m4a)$/.test(ext)) {
      return { Icon: MusicIcon, bg: "bg-indigo-100 border-indigo-200", fg: "text-indigo-700" }
    }
    if (/(zip|rar|7z|tar|gz)$/.test(ext)) {
      return { Icon: ArchiveIcon, bg: "bg-amber-100 border-amber-200", fg: "text-amber-700" }
    }
    if (/(csv|xls|xlsx)$/.test(ext)) {
      return { Icon: SpreadsheetIcon, bg: "bg-emerald-100 border-emerald-200", fg: "text-emerald-700" }
    }
    if (/(js|ts|tsx|jsx|json|py|rb|go|java|php|c|cpp|cs|md)$/.test(ext)) {
      return { Icon: CodeIcon, bg: "bg-blue-100 border-blue-200", fg: "text-blue-700" }
    }
    if (/(pdf|txt|doc|docx)$/.test(ext)) {
      return { Icon: FileTextIcon, bg: "bg-red-100 border-red-200", fg: "text-red-700" }
    }
    return { Icon: FileIcon, bg: "bg-gray-100 border-gray-200", fg: "text-gray-700" }
  }

  const toggleSelect = (path: string, checked: boolean) => {
    setSelectedPaths(prev => {
      const next = new Set(prev)
      if (checked) next.add(path)
      else next.delete(path)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectAll(v => {
      const nv = !v
      if (nv) {
        setSelectedPaths(new Set(sortedFiltered.map(i => i.path)))
      } else {
        setSelectedPaths(new Set())
      }
      return nv
    })
  }

  const handleDownloadFile = (item: Item) => {
    if (item.type !== "file") return
    const url = `/api/file-manager/${encodeURIComponent(item.path)}?download=1`
    window.open(url, "_blank")
  }

  const handleDownloadZip = async () => {
    if (selectedPaths.size === 0) return
    try {
      const res = await fetch("/api/file-manager/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: Array.from(selectedPaths) })
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `selection-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {}
  }

  // Load text preview for supported types
  useEffect(() => {
    const loadText = async () => {
      if (!selected || selected.type !== "file") {
        setTextPreview("")
        return
      }
      const isText = /\.(txt|csv|json|md|log)$/i.test(selected.name)
      if (!isText) {
        setTextPreview("")
        return
      }
      // Avoid loading very large files in preview
      if (selected.size > 200 * 1024) {
        setTextPreview("File too large to preview. Download to view full content.")
        return
      }
      try {
        setIsLoadingPreview(true)
        const res = await fetch(`/api/file-manager/${encodeURIComponent(selected.path)}`)
        const contentType = res.headers.get("content-type") || ""
        if (!res.ok) {
          setTextPreview("Failed to load preview.")
          return
        }
        if (contentType.includes("application/json")) {
          const obj = await res.json()
          setTextPreview(JSON.stringify(obj, null, 2))
        } else {
          const txt = await res.text()
          setTextPreview(txt)
        }
      } catch (e) {
        setTextPreview("Failed to load preview.")
      } finally {
        setIsLoadingPreview(false)
      }
    }
    loadText()
  }, [selected])

  return (
    <div className="p-6 space-y-4">
      {/* Top toolbar */}
      <Card className="sticky top-0 z-20 border-gray-200/80 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <CardContent className="py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {breadcrumbs.map((c, i) => (
                <div key={c.path} className="flex items-center gap-2">
                  <button className={cn("hover:underline hover:text-gray-900", i === breadcrumbs.length-1 && "font-semibold text-gray-900")}
                    onClick={() => setCwd(c.path)}>
                    {c.name}
                  </button>
                  {i < breadcrumbs.length-1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 pr-3 mr-2 border-r">
                <input id="select-all" type="checkbox" className="h-4 w-4" checked={selectAll} onChange={toggleSelectAll} />
                <label htmlFor="select-all" className="text-xs text-gray-600">Select All</label>
              </div>
              <Button size="sm" variant="outline" onClick={() => fetchList(cwd)}>
                <RefreshCw className="h-4 w-4 mr-2"/> Refresh
              </Button>
              <Button size="sm" variant="outline" onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <List className="h-4 w-4 mr-2"/> : <Grid className="h-4 w-4 mr-2"/>}
                {viewMode === "grid" ? "List" : "Grid"}
              </Button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
                  {sortDir === "asc" ? <SortAsc className="h-4 w-4 mr-2"/> : <SortDesc className="h-4 w-4 mr-2"/>}
                  {sortDir.toUpperCase()}
                </Button>
                <select className="border rounded px-2 py-1 text-sm" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                  <option value="size">Size</option>
                  <option value="modifiedAt">Modified</option>
                </select>
                <Input placeholder="Filter" className="w-44" value={filter} onChange={e => setFilter(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setCreateFolderOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-2"/> New Folder
                </Button>
                <Button size="sm" onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2"/> Upload
                </Button>
                <Button size="sm" variant="outline" disabled={selectedPaths.size === 0} onClick={handleDownloadZip}>
                  Download ZIP
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInputChange} />
              </div>

              {/* Counts */}
              <div className="ml-auto pl-3 text-xs text-gray-500">
                {sortedFiltered.length} items • {selectedPaths.size} selected
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div 
        className="border-2 border-dashed rounded-lg p-4 min-h-[300px] bg-white"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : sortedFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 gap-2 py-16">
            <div className="text-base font-medium">No items to display</div>
            <div className="text-xs">Try clearing filters or uploading files.</div>
          </div>
        ) : viewMode === "list" ? (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedItems.map((item) => {
                  const t = getItemThumb(item)
                  const IconComp = t.Icon
                  return (
                    <TableRow key={item.path} className={cn(
                      selectedPaths.has(item.path) && "bg-blue-50/50",
                      item.type === "folder" && "bg-[#c0cefa]"
                    )}
                      onClick={() => item.type === "folder" ? openFolder(item) : setSelected(item)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedPaths.has(item.path)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(item.path, e.target.checked) }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${t.bg}`}>
                            <IconComp className={`h-4 w-4 ${t.fg}`} />
                          </div>
                          <div>
                            <div className="font-medium truncate max-w-[18rem]">{item.name}</div>
                            <div className="text-xs text-gray-500 md:hidden">{item.type} • {formatFileSize(item.size)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell capitalize">{item.type}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatFileSize(item.size)}</TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(item.modifiedAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); renameEntry(item) }}>
                            <Pencil className="h-4 w-4"/>
                          </Button>
                          {item.type === "file" && (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadFile(item) }}>
                              Download
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleMoveClick(item) }}>
                            <ArrowRightLeft className="h-4 w-4"/>
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); deleteEntry(item) }} className="text-red-600">
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(item) }}>
                            <Info className="h-4 w-4"/>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {sortedFiltered.length > visibleCount && (
              <div ref={sentinelRef} className="flex items-center justify-center py-4">
                <span className="text-xs text-gray-500">Loading more...</span>
              </div>
            )}
          </div>
        ) : (
          <div className={cn("gap-3", "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4") }>
            {displayedItems.map(item => (
              <Card key={item.path} className={cn(
                "cursor-pointer group border-gray-200 hover:border-gray-300 transition-colors",
                selectedPaths.has(item.path) && "ring-2 ring-blue-200"
              )}
                onClick={() => item.type === "folder" ? openFolder(item) : setSelected(item)}
              >
                <CardContent className={cn("p-4", item.type === "folder" && "bg-[#c0cefa] rounded-xl") }>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedPaths.has(item.path)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(item.path, e.target.checked) }}
                    />
                    {(() => {
                      const t = getItemThumb(item)
                      const IconComp = t.Icon
                      return (
                        <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${t.bg}`}>
                          <IconComp className={`h-5 w-5 ${t.fg}`} />
                        </div>
                      )
                    })()}
                    <div>
                      <div className="font-medium truncate max-w-[14rem]">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.type} • {formatFileSize(item.size)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {sortedFiltered.length > visibleCount && (
              <div ref={sentinelRef} className="col-span-full flex items-center justify-center py-4">
                <span className="text-xs text-gray-500">Loading more...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Details</div>
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Close</Button>
          </div>
          <div className="mt-3 text-sm">
            <div><span className="text-gray-500">Name:</span> {selected.name}</div>
            <div><span className="text-gray-500">Path:</span> {selected.path}</div>
            <div><span className="text-gray-500">Type:</span> {selected.type}</div>
            <div><span className="text-gray-500">Size:</span> {selected.size} bytes</div>
            <div><span className="text-gray-500">Modified:</span> {new Date(selected.modifiedAt).toLocaleString()}</div>
          </div>
          {selected.type === "file" && (
            <div className="mt-4 space-y-4">
              {/* Image Preview */}
              {selected.name.match(/\.(png|jpe?g|gif|webp|bmp|svg)$/i) && (
                <img
                  src={`/api/file-manager/${encodeURIComponent(selected.path)}`}
                  alt={selected.name}
                  className="max-h-96 rounded border"
                />
              )}

              {/* PDF Preview */}
              {selected.name.match(/\.(pdf)$/i) && (
                <iframe
                  src={`/api/file-manager/${encodeURIComponent(selected.path)}`}
                  className="w-full h-[600px] rounded border"
                />
              )}

              {/* Video Preview */}
              {selected.name.match(/\.(mp4|webm|ogg)$/i) && (
                <video
                  controls
                  src={`/api/file-manager/${encodeURIComponent(selected.path)}`}
                  className="w-full max-h-[500px] rounded border bg-black"
                />
              )}

              {/* Audio Preview */}
              {selected.name.match(/\.(mp3|wav|ogg|m4a)$/i) && (
                <audio
                  controls
                  src={`/api/file-manager/${encodeURIComponent(selected.path)}`}
                  className="w-full"
                />
              )}

              {/* Text Preview */}
              {selected.name.match(/\.(txt|csv|json|md|log)$/i) && (
                <div className="rounded border bg-gray-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">Preview</div>
                  <pre className="p-3 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
{isLoadingPreview ? "Loading preview..." : textPreview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder. It will be created in the current directory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="My New Folder"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && folderName.trim()) {
                    handleCreateFolder()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateFolderOpen(false)
                setFolderName("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!folderName.trim()}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Item Dialog */}
      <Dialog 
        open={moveDialogOpen} 
        onOpenChange={(open) => {
          setMoveDialogOpen(open)
          if (!open) {
            setItemToMove(null)
            setTargetPath("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move {itemToMove?.type === "folder" ? "Folder" : "File"}</DialogTitle>
            <DialogDescription>
              Enter the destination path where you want to move <strong>{itemToMove?.name}</strong>. 
              Leave empty to move to the Drive.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Moving:</div>
              <div className="font-medium text-gray-900">{itemToMove?.name}</div>
              <div className="text-xs text-gray-500 mt-1">From: {itemToMove?.path || "Drive"}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-path">Destination Path</Label>
              <Input
                id="target-path"
                placeholder="folder/subfolder (leave empty for Drive)"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && itemToMove) {
                    handleMoveEntry()
                  }
                }}
                autoFocus
              />
              <div className="text-xs text-gray-500">
                Relative path from Drive. Example: "documents/2024" or leave empty for Drive.
              </div>
            </div>
            {/* Show available folders as quick select */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Quick Select (Click to choose):</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetPath("")}
                  className="text-xs"
                >
                  Drive
                </Button>
                {sortedFiltered
                  .filter(item => item.type === "folder")
                  .slice(0, 5)
                  .map(folder => (
                    <Button
                      key={folder.path}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTargetPath(folder.path)}
                      className="text-xs"
                    >
                      {folder.name}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMoveDialogOpen(false)
                setItemToMove(null)
                setTargetPath("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMoveEntry}
              disabled={!itemToMove}
            >
              Move {itemToMove?.type === "folder" ? "Folder" : "File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        setUploadDialogOpen(open)
        if (!open) {
          setUploadSelectedFile(null)
          setUploadFilename("")
          setIsUploadingModal(false)
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Choose a file to upload to <span className="font-medium">{cwd || "Drive"}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-2xl p-10 md:p-12 text-center cursor-pointer transition-all duration-300 ease-out min-h-[16rem] flex flex-col items-center justify-center",
                isUploadDragging && "border-blue-400 bg-blue-50/70 scale-[1.01] shadow",
                uploadSelectedFile && !isUploadDragging ? "border-blue-300 bg-blue-50/60" : "border-gray-300 hover:border-gray-400 hover:shadow-sm"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsUploadDragging(true) }}
              onDragLeave={() => setIsUploadDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                const files = e.dataTransfer.files
                if (!files || files.length === 0) return
                const file = files[0]
                setUploadSelectedFile(file)
                setUploadFilename(file.name)
                setIsUploadDragging(false)
              }}
            >
              {uploadSelectedFile ? (
                <div className="space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-base font-medium text-gray-900">{uploadSelectedFile.name}</div>
                  <div className="text-sm text-gray-600">{formatFileSize(uploadSelectedFile.size)}</div>
                  <div className="text-xs text-gray-500">Click to choose a different file or drop another one.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-gray-500" />
                  </div>
                  <div className="text-base font-medium text-gray-900">Drop file here or click to browse</div>
                  <div className="text-sm text-gray-600">Max 20MB • Supported images, docs, audio, video, text</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-filename">File name</Label>
              <Input
                id="upload-filename"
                placeholder="filename.ext"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                disabled={!uploadSelectedFile}
              />
              <div className="text-xs text-gray-500">You can change the name before uploading. Extension is preserved if omitted.</div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose File</Button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => {
                const files = e.target.files
                if (!files || files.length === 0) return
                const f = files[0]
                setUploadSelectedFile(f)
                setUploadFilename(f.name)
                // reset
                e.currentTarget.value = ""
              }} />
              <div className="ml-auto" />
              <Button
                onClick={async () => {
                  if (!uploadSelectedFile) return
                  try {
                    setIsUploadingModal(true)
                    const form = new FormData()
                    form.append("file", uploadSelectedFile)
                    form.append("path", cwd)
                    if (uploadFilename.trim()) form.append("name", uploadFilename.trim())
                    const res = await fetch("/api/file-manager/upload", { method: "POST", body: form })
                    if (res.ok) {
                      setUploadDialogOpen(false)
                      await fetchList(cwd)
                    }
                  } finally {
                    setIsUploadingModal(false)
                  }
                }}
                disabled={!uploadSelectedFile || isUploadingModal}
              >
                {isUploadingModal ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


