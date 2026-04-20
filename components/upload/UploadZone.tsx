'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

interface UploadZoneProps {
  onImageUpload: (file: File, base64: string) => void
  previewUrl?: string | null
  onClear?: () => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function UploadZone({ onImageUpload, previewUrl, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageInfo, setImageInfo] = useState<{ name: string; width: number; height: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG or PNG image.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Image must be under ${MAX_SIZE_MB}MB.`
    }
    return null
  }, [])

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string

      // Get image dimensions
      const img = new window.Image()
      img.onload = () => {
        setImageInfo({
          name: file.name,
          width: img.width,
          height: img.height,
        })
        onImageUpload(file, base64)
      }
      img.src = base64
    }
    reader.readAsDataURL(file)
  }, [validateFile, onImageUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setImageInfo(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onClear?.()
  }, [onClear])

  const hasImage = previewUrl || imageInfo

  return (
    <div className="space-y-3">
      <div
        onClick={hasImage ? undefined : handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'relative flex flex-col items-center justify-center rounded-card border-2 border-dashed transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-primary bg-primary-light scale-[1.02]'
            : hasImage
              ? 'border-transparent bg-transparent cursor-default'
              : 'border-border hover:border-primary/50 hover:bg-surface',
          error && '!border-danger !bg-danger-light'
        )}
        style={{ minHeight: 200 }}
      >
        {hasImage ? (
          <div className="relative w-full p-4">
            {/* Image preview */}
            <div className="relative rounded-input overflow-hidden bg-background">
              <img
                src={previewUrl || ''}
                alt="Fundus preview"
                className="w-full h-48 object-contain"
              />
              {/* CDR Badge overlay */}
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-badge bg-surface/90 backdrop-blur-sm text-xs font-mono font-medium text-text-primary shadow-sm">
                  CDR pending
                </span>
              </div>
            </div>

            {/* Image info */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                <span className="text-sm text-text-secondary truncate">
                  {imageInfo?.name || 'Fundus image'}
                </span>
              </div>
              {imageInfo && (
                <span className="text-xs font-mono text-text-muted flex-shrink-0">
                  {imageInfo.width}×{imageInfo.height}
                </span>
              )}
            </div>

            {/* Clear button */}
            <button
              onClick={handleClear}
              className="absolute top-2 left-2 p-1.5 rounded-badge bg-surface/90 backdrop-blur-sm hover:bg-danger hover:text-white transition-colors shadow-sm"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6">
            <div className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              isDragging ? 'bg-primary text-white' : 'bg-primary-light text-primary'
            )}>
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">
                {isDragging ? 'Drop your image here' : 'Upload fundus image'}
              </p>
              <p className="text-xs text-text-muted mt-1">
                JPEG or PNG, up to {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-danger text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Disclaimer */}
      {!hasImage && (
        <p className="text-xs text-text-muted text-center">
          AI-assisted screening only. Not a substitute for clinical diagnosis.
        </p>
      )}
    </div>
  )
}