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
  FolderPlus, Upload, Grid, List, SortAsc, SortDesc, RefreshCw, Info, Trash2, Pencil, ArrowRightLeft, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [itemToMove, setItemToMove] = useState<Item|null>(null)
  const [targetPath, setTargetPath] = useState("")

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

  const breadcrumbs = useMemo(() => {
    const parts = cwd.split("/").filter(Boolean)
    const crumbs: { name: string, path: string }[] = [{ name: "Root", path: "" }]
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

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const form = new FormData()
    form.append("file", file)
    form.append("path", cwd)
    await fetch("/api/file-manager/upload", { method: "POST", body: form })
    await fetchList(cwd)
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
    const form = new FormData()
    form.append("file", file)
    form.append("path", cwd)
    await fetch("/api/file-manager/upload", { method: "POST", body: form })
    await fetchList(cwd)
  }

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault()

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {breadcrumbs.map((c, i) => (
            <div key={c.path} className="flex items-center gap-2">
              <button className={cn("hover:underline", i === breadcrumbs.length-1 && "font-semibold text-gray-900")}
                onClick={() => setCwd(c.path)}>
                {c.name}
              </button>
              {i < breadcrumbs.length-1 && <ChevronRight className="h-4 w-4" />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchList(cwd)}>
            <RefreshCw className="h-4 w-4 mr-2"/> Refresh
          </Button>
          <Button variant="outline" onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4 mr-2"/> : <Grid className="h-4 w-4 mr-2"/>}
            {viewMode === "grid" ? "List" : "Grid"}
          </Button>
          <Button variant="outline" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
            {sortDir === "asc" ? <SortAsc className="h-4 w-4 mr-2"/> : <SortDesc className="h-4 w-4 mr-2"/>}
            {sortDir.toUpperCase()}
          </Button>
          <select className="border rounded px-2 py-1 text-sm" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="size">Size</option>
            <option value="modifiedAt">Modified</option>
          </select>
          <Input placeholder="Filter" className="w-40" value={filter} onChange={e => setFilter(e.target.value)} />
          <Button onClick={() => setCreateFolderOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2"/> New Folder
          </Button>
          <Button onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2"/> Upload
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInputChange} />
        </div>
      </div>

      <div 
        className="border-2 border-dashed rounded-lg p-4 min-h-[300px] bg-white"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : (
          <div className={cn("gap-3", viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4" : "flex flex-col") }>
            {sortedFiltered.map(item => (
              <Card key={item.path} className={cn("cursor-pointer group", viewMode === "list" && "hover:bg-gray-50")}
                onClick={() => item.type === "folder" ? openFolder(item) : setSelected(item)}
              >
                <CardContent className={cn("p-4", viewMode === "list" && "flex items-center justify-between") }>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      {item.type === "folder" ? "📁" : "📄"}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.type} • {item.size} bytes
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); renameEntry(item) }}>
                      <Pencil className="h-4 w-4"/>
                    </Button>
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
                </CardContent>
              </Card>
            ))}
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
          {selected.type === "file" && selected.name.match(/\.(png|jpe?g|gif|webp|bmp)$/i) && (
            <div className="mt-4">
              <img 
                src={`/api/file-manager/${encodeURIComponent(selected.path)}`} 
                alt={selected.name} 
                className="max-h-96 rounded border"
              />
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
              Leave empty to move to root directory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Moving:</div>
              <div className="font-medium text-gray-900">{itemToMove?.name}</div>
              <div className="text-xs text-gray-500 mt-1">From: {itemToMove?.path || "root"}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-path">Destination Path</Label>
              <Input
                id="target-path"
                placeholder="folder/subfolder (leave empty for root)"
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
                Relative path from root. Example: "documents/2024" or leave empty for root.
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
                  Root
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
    </div>
  )
}


