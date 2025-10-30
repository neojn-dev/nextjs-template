"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type Props = {
  initialUrl?: string | null
  onUpdated?: (url: string) => void
}

export function ProfileImageUploader({ initialUrl, onUpdated }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState<number>(1)
  const [offsetX, setOffsetX] = useState<number>(0)
  const [offsetY, setOffsetY] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [processing, setProcessing] = useState<boolean>(false)
  
  // Track if we're editing (have a new file uploaded)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const openPicker = () => fileInputRef.current?.click()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsEditing(true)
    setZoom(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  const handleSave = async () => {
    if (!imageEl) return
    setProcessing(true)
    try {
      // Create square canvas 512x512 with zoom and offset support
      const size = 512
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")!

      const iw = imageEl.naturalWidth
      const ih = imageEl.naturalHeight
      const minSide = Math.min(iw, ih)
      const scaledSide = minSide * zoom

      // Compute source rect with offset support for cropping
      const sx = (iw - scaledSide) / 2 + offsetX
      const sy = (ih - scaledSide) / 2 + offsetY
      const sSize = scaledSide

      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(imageEl, sx, sy, sSize, sSize, 0, 0, size, size)

      // Export blob
      const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b as Blob), "image/jpeg", 0.92)!)
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/users/profile-image", { method: "POST", body: form })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      const url = data?.url as string
      
      // Close the preview and show the new saved image
      setIsEditing(false)
      setPreviewUrl(url)
      setZoom(1)
      setOffsetX(0)
      setOffsetY(0)
      
      onUpdated?.(url)
    } finally {
      setProcessing(false)
    }
  }
  
  const handleCancel = () => {
    setIsEditing(false)
    setPreviewUrl(initialUrl || null)
    setZoom(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  const circularMaskUrl = useMemo(() => {
    if (!previewUrl) return null
    // If it's a blob URL (local preview), use it directly
    if (previewUrl.startsWith('blob:')) {
      return previewUrl
    }
    // If it's already a full URL, use it as is
    if (previewUrl.startsWith('http://') || previewUrl.startsWith('https://')) {
      return previewUrl
    }
    // If it's the API endpoint itself (from API response), use it
    if (previewUrl === '/api/users/profile-image') {
      return previewUrl
    }
    // For database file paths (uploads/avatars/...), use the API endpoint
    if (previewUrl.includes('avatars/')) {
      return '/api/users/profile-image'
    }
    // For any other non-empty value, use the API endpoint
    return '/api/users/profile-image'
  }, [previewUrl])
  
  // Handle mouse/touch drag for cropping
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !imageEl) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    // Calculate image dimensions in display
    // The image is displayed at max 400px, so calculate actual displayed size
    const iw = imageEl.naturalWidth
    const ih = imageEl.naturalHeight
    const minSide = Math.min(iw, ih)
    const maxDisplaySize = 400
    const displayScale = maxDisplaySize / minSide
    
    // Convert pixel movement to image coordinate movement
    // Invert the movement - dragging left should move image right
    const scale = zoom * displayScale
    const maxOffset = (minSide * zoom - minSide) / 2
    
    // Add opposite direction delta to simulate dragging the image
    setOffsetX(prev => Math.max(-maxOffset, Math.min(maxOffset, prev + deltaX / scale)))
    setOffsetY(prev => Math.max(-maxOffset, Math.min(maxOffset, prev + deltaY / scale)))
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }
  
  // Sync preview URL with initial URL when it changes
  useEffect(() => {
    if (!isEditing && initialUrl) {
      // Set the initial URL as is - it could be a blob URL, full URL, or local path
      setPreviewUrl(initialUrl)
    } else if (!isEditing && !initialUrl) {
      // Clear preview if there's no initial URL
      setPreviewUrl(null)
    }
  }, [initialUrl, isEditing])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 relative">
          {circularMaskUrl ? (
            <Image 
              src={circularMaskUrl} 
              alt="Avatar" 
              fill 
              className="object-cover"
              unoptimized={true}
              onError={(e) => {
                // Silently handle error - likely no image uploaded
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" className="h-9" onClick={openPicker}>Upload</Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      </div>

      {isEditing && previewUrl && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center relative cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Image preview with crop overlay */}
              <div className="relative" style={{ transform: `scale(${zoom}) translate(${-offsetX / zoom}px, ${-offsetY / zoom}px)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="preview"
                  className="max-h-[400px] max-w-[400px]"
                  style={{ display: 'block' }}
                  ref={el => setImageEl(el)}
                />
              </div>
              {/* Crop overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent calc(50% - 1px), rgba(0,0,0,0.3) calc(50% - 1px), rgba(0,0,0,0.3) calc(50% + 1px), transparent calc(50% + 1px), transparent 100%)',
                }}
              >
                <div 
                  className="absolute border-2 border-white"
                  style={{
                    top: '25%',
                    left: '25%',
                    width: '50%',
                    height: '50%',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </div>
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-transparent">
                  <p className="text-white font-medium drop-shadow-lg">Dragging to adjust...</p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">Zoom</div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Drag the image to adjust position. Use zoom to crop. The avatar is displayed as a circle.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button type="button" variant="outline" className="h-9" onClick={handleCancel}>Cancel</Button>
                <Button type="button" className="h-9" disabled={processing} onClick={handleSave}>{processing ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


