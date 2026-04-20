'use client'

import clsx from 'clsx'
import { FileText, Flag, AlertTriangle, CheckCircle } from 'lucide-react'

interface ConfidenceCircleProps {
  confidence: number // 0-100
  size?: number
}

export function ConfidenceCircle({ confidence, size = 100 }: ConfidenceCircleProps) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (confidence / 100) * circumference

  const getColor = () => {
    if (confidence < 70) return '#EF9F27'
    if (confidence < 85) return '#EF9F27'
    return '#1D9E75'
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          fill="none"
          stroke={getColor()}
          strokeWidth={1}
          opacity={0.2}
        />
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={8}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 8px ${getColor()}40)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold text-text-primary">
          {Math.round(confidence)}%
        </span>
        <span className="text-xs text-text-muted font-medium">Confidence</span>
      </div>
    </div>
  )
}

interface ResultBannerProps {
  prediction: 'glaucoma' | 'normal'
  confidence: number
  cdr: number
  onGenerateReport: () => void
  onFlagForReview: () => void
}

export function ResultBanner({ prediction, confidence, cdr, onGenerateReport, onFlagForReview }: ResultBannerProps) {
  const isGlaucoma = prediction === 'glaucoma'
  const isUncertain = confidence < 70

  return (
    <div
      className={clsx(
        'rounded-2xl bg-surface border backdrop-blur-sm shadow-lg overflow-hidden animate-scale-in',
        isGlaucoma ? 'border-danger/30' : 'border-primary/30'
      )}
    >
      {/* Top gradient bar */}
      <div className={clsx(
        'h-1',
        isGlaucoma ? 'bg-gradient-to-r from-danger via-danger/50 to-transparent' : 'bg-gradient-to-r from-primary via-primary/50 to-transparent'
      )} />

      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Confidence circle */}
          <div className="flex-shrink-0 bg-gradient-to-br from-background to-surface rounded-2xl p-2 border border-border/50">
            <ConfidenceCircle confidence={confidence} size={100} />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pt-2">
            <div className="flex items-center gap-3 mb-3">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                isGlaucoma ? 'bg-danger-light' : 'bg-primary-light'
              )}>
                {isGlaucoma ? (
                  <AlertTriangle className="w-5 h-5 text-danger" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <h2 className={clsx(
                  'text-xl font-bold tracking-tight',
                  isGlaucoma ? 'text-danger' : 'text-primary'
                )}>
                  {isGlaucoma ? 'Glaucoma Detected' : 'No Glaucoma Detected'}
                </h2>
                <p className="text-sm text-text-muted">CNN Model Analysis Complete</p>
              </div>
              {isUncertain && (
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-light text-warning text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Uncertain Result
                </span>
              )}
            </div>

            <p className={clsx(
              'text-sm leading-relaxed',
              isGlaucoma ? 'text-text-secondary' : 'text-text-secondary'
            )}>
              {isGlaucoma
                ? `Cup-to-disc ratio of ${cdr.toFixed(2)} indicates structural damage consistent with glaucoma. Immediate clinical correlation and further examination recommended.`
                : `CDR of ${cdr.toFixed(2)} within normal limits. No obvious signs of glaucomatous progression detected in the submitted fundus image.`}
            </p>

            {isUncertain && (
              <div className="mt-3 p-3 rounded-xl bg-warning-light/50 border border-warning/20 text-xs text-warning leading-relaxed">
                <strong>Note:</strong> Confidence below 70%. Consider re-uploading a higher quality image or refer to a specialist for comprehensive evaluation.
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={onGenerateReport}
                className={clsx(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all',
                  'bg-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25',
                  'active:scale-95'
                )}
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
              <button
                onClick={onFlagForReview}
                className={clsx(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all',
                  isGlaucoma
                    ? 'bg-danger-light/50 text-danger hover:bg-danger-light border border-danger/20'
                    : 'bg-warning-light/50 text-warning hover:bg-warning-light border border-warning/20',
                  'active:scale-95'
                )}
              >
                <Flag className="w-4 h-4" />
                Flag for Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}