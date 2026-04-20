'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

interface GradCAMViewerProps {
  originalImage: string
  heatmapBase64: string
  discRegion?: { x: number; y: number; radius: number }
}

export function GradCAMViewer({ originalImage, heatmapBase64, discRegion }: GradCAMViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !originalImage || !heatmapBase64) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.onload = () => {
      // Set canvas to image dimensions
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Draw heatmap overlay
      const heatmap = new window.Image()
      heatmap.onload = () => {
        ctx.globalAlpha = 0.6
        ctx.drawImage(heatmap, 0, 0, img.width, img.height)
        ctx.globalAlpha = 1

        // Draw disc annotation if provided
        if (discRegion) {
          ctx.beginPath()
          ctx.arc(discRegion.x * img.width, discRegion.y * img.height, discRegion.radius * img.width, 0, 2 * Math.PI)
          ctx.setLineDash([8, 8])
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.lineWidth = 3
          ctx.stroke()
          ctx.setLineDash([])
        }

        setLoaded(true)
      }
      heatmap.src = heatmapBase64
    }
    img.src = originalImage
  }, [originalImage, heatmapBase64, discRegion])

  return (
    <div className="space-y-3">
      <div className="relative rounded-card overflow-hidden bg-background border border-border">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-background animate-shimmer" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={clsx(
            'w-full h-auto',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{ minHeight: 280 }}
        />
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Low attention</span>
        <div className="flex-1 h-2 rounded-full gradcam-legend" />
        <span className="text-xs text-text-muted">High attention</span>
      </div>
    </div>
  )
}

interface FeatureBarChartProps {
  features: {
    cup_disc_ratio: number
    rim_thinning: number
    visual_field_md: number
    iop_level: number
    rnfl_thickness: number
    disc_haemorrhage: number
  }
}

const FEATURE_LABELS = {
  cup_disc_ratio: 'Cup-disc ratio',
  rim_thinning: 'Rim thinning',
  visual_field_md: 'Visual field MD',
  iop_level: 'IOP level',
  rnfl_thickness: 'RNFL thickness',
  disc_haemorrhage: 'Disc haemorrhage',
}

const MAX_WEIGHT = 100

function getFeatureColor(weight: number): string {
  if (weight >= 60) return 'bg-danger'
  if (weight >= 30) return 'bg-warning'
  return 'bg-primary'
}

export function FeatureBarChart({ features }: FeatureBarChartProps) {
  const entries = Object.entries(features).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-3">
      {entries.map(([key, weight], index) => (
        <div key={key} className="animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">
              {FEATURE_LABELS[key as keyof typeof FEATURE_LABELS]}
            </span>
            <span className={clsx(
              'text-xs font-mono font-medium',
              weight >= 60 && 'text-danger',
              weight >= 30 && weight < 60 && 'text-warning',
              weight < 30 && 'text-primary'
            )}>
              {weight.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full animate-bar-fill', getFeatureColor(weight))}
              style={{
                width: `${(weight / MAX_WEIGHT) * 100}%`,
                animationDelay: `${index * 80 + 200}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface XAIPanelProps {
  originalImage: string
  heatmapBase64: string
  features: FeatureBarChartProps['features']
}

export function XAIPanel({ originalImage, heatmapBase64, features }: XAIPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
      <div className="bg-surface rounded-card border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Grad-CAM Heatmap
        </h3>
        <GradCAMViewer
          originalImage={originalImage}
          heatmapBase64={heatmapBase64}
          discRegion={{ x: 0.5, y: 0.5, radius: 0.15 }}
        />
      </div>
      <div className="bg-surface rounded-card border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Feature Importance
        </h3>
        <FeatureBarChart features={features} />
      </div>
    </div>
  )
}