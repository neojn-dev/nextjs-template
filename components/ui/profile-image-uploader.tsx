"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Camera, ZoomIn, ZoomOut, Move } from "lucide-react"

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const openPicker = () => fileInputRef.current?.click()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsModalOpen(true)
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
      
      // Close the modal and show the new saved image
      setIsModalOpen(false)
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
    setIsModalOpen(false)
    setPreviewUrl(initialUrl || null)
    setZoom(1)
    setOffsetX(0)
    setOffsetY(0)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleModalClose = (open: boolean) => {
    if (!open && !processing) {
      handleCancel()
    }
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
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !imageEl) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    // Calculate image dimensions in display
    const iw = imageEl.naturalWidth
    const ih = imageEl.naturalHeight
    const minSide = Math.min(iw, ih)
    
    // Get the container dimensions (should be about 400px based on 50vw)
    const containerSize = 400
    const displayScale = containerSize / minSide
    
    // Convert pixel movement to image coordinate movement
    const scale = zoom * displayScale
    const maxOffset = (minSide * zoom - minSide) / 2
    
    // Add opposite direction delta to simulate dragging the image
    setOffsetX(prev => Math.max(-maxOffset, Math.min(maxOffset, prev - deltaX / scale)))
    setOffsetY(prev => Math.max(-maxOffset, Math.min(maxOffset, prev - deltaY / scale)))
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !imageEl) return
    const touch = e.touches[0]
    
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    
    const iw = imageEl.naturalWidth
    const ih = imageEl.naturalHeight
    const minSide = Math.min(iw, ih)
    const containerSize = 400
    const displayScale = containerSize / minSide
    const scale = zoom * displayScale
    const maxOffset = (minSide * zoom - minSide) / 2
    
    setOffsetX(prev => Math.max(-maxOffset, Math.min(maxOffset, prev - deltaX / scale)))
    setOffsetY(prev => Math.max(-maxOffset, Math.min(maxOffset, prev - deltaY / scale)))
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.1))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(1, prev - 0.1))
  }
  
  // Sync preview URL with initial URL when it changes
  useEffect(() => {
    if (!isModalOpen && initialUrl) {
      setPreviewUrl(initialUrl)
    } else if (!isModalOpen && !initialUrl) {
      setPreviewUrl(null)
    }
  }, [initialUrl, isModalOpen])

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* Profile Image Display */}
        <div className="relative group">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-4 border-white shadow-lg ring-2 ring-gray-100 relative">
            {circularMaskUrl ? (
              <Image 
                src={circularMaskUrl} 
                alt="Avatar" 
                fill 
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                unoptimized={true}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                <Camera className="h-12 w-12 text-blue-400" />
              </div>
            )}
          </div>
          {/* Overlay on hover */}
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Upload Button */}
        <Button 
          type="button" 
          variant="outline"
          onClick={openPicker}
          className="gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <Camera className="h-4 w-4" />
          {circularMaskUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      {/* Crop Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="w-full sm:w-[480px] max-w-[480px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-lg font-semibold text-gray-900">Crop Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="p-5">
            {/* Image Preview Area with Gridlines */}
            <div 
              className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden flex items-center justify-center relative cursor-move border border-gray-200 shadow-inner group"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Grid lines overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity">
                {/* Vertical lines */}
                <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/60" style={{ transform: 'translateX(-50%)' }} />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/80" style={{ transform: 'translateX(-50%)' }} />
                <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/60" style={{ transform: 'translateX(-50%)' }} />
                {/* Horizontal lines */}
                <div className="absolute left-0 right-0 top-1/4 h-px bg-white/60" style={{ transform: 'translateY(-50%)' }} />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/80" style={{ transform: 'translateY(-50%)' }} />
                <div className="absolute left-0 right-0 top-3/4 h-px bg-white/60" style={{ transform: 'translateY(-50%)' }} />
                {/* Circular grid overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="rounded-full border-2 border-dashed border-white/40" style={{ width: '70%', height: '70%' }} />
                </div>
              </div>

              {/* Image preview with crop overlay */}
              <div className="relative transition-all duration-100 ease-out" style={{ 
                transform: `scale(${isDragging ? zoom * 1.01 : zoom}) translate(${-offsetX / zoom}px, ${-offsetY / zoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                filter: isDragging ? 'brightness(1.05)' : 'brightness(1)'
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || undefined}
                  alt="preview"
                  className="max-h-full max-w-full select-none"
                  style={{ display: 'block' }}
                  ref={el => setImageEl(el)}
                  draggable={false}
                />
              </div>
              
              {/* Crop overlay with better styling */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Darken outside crop area with smooth edges */}
                <div 
                  className="absolute border-4 border-white rounded-full transition-all duration-200"
                  style={{
                    top: '25%',
                    left: '25%',
                    width: '50%',
                    height: '50%',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  }}
                >
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-80" />
                  {/* Corner indicators */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-white rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-white rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-white rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-white rounded-br-lg" />
                </div>
              </div>
              
              {/* Drag indicator with smooth animation */}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-transparent animate-in fade-in duration-200">
                  <div className="bg-white/95 backdrop-blur-md rounded-xl px-6 py-3 shadow-2xl border border-gray-200">
                    <div className="flex items-center gap-3 text-base font-semibold text-gray-900">
                      <Move className="h-5 w-5 animate-pulse text-blue-600" />
                      Dragging to adjust position
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-5">
              {/* Zoom Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-gray-500" />
                    Zoom
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-5 py-4 gap-2 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={processing}
              className="h-9"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={processing}
              className="h-9"
            >
              {processing ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
