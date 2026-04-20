'use client'

import clsx from 'clsx'
import { Loader2, Activity, Brain, Zap } from 'lucide-react'

interface DiagnosisButtonProps {
  onDiagnose: () => Promise<void>
  isLoading: boolean
  hasImage: boolean
}

export function DiagnosisButton({ onDiagnose, isLoading, hasImage }: DiagnosisButtonProps) {
  const isDisabled = !hasImage || isLoading

  return (
    <button
      onClick={onDiagnose}
      disabled={isDisabled}
      className={clsx(
        'w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group',
        isDisabled
          ? 'bg-background text-text-muted cursor-not-allowed border-2 border-border/50'
          : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]'
      )}
    >
      {/* Shimmer effect for enabled state */}
      {!isDisabled && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      {isLoading ? (
        <>
          <div className="relative">
            <Loader2 className="w-5 h-5 animate-spin" />
            <div className="absolute inset-0 animate-ping opacity-30">
              <Loader2 className="w-5 h-5" />
            </div>
          </div>
          <span className="relative">Analyzing Fundus Image...</span>
        </>
      ) : (
        <>
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            isDisabled ? 'bg-background/50' : 'bg-white/20'
          )}>
            {isDisabled ? (
              <Activity className="w-5 h-5" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
          </div>
          <div className="text-left relative">
            <div className="flex items-center gap-2">
              <span>Run AI Diagnosis</span>
              {!isDisabled && <Zap className="w-4 h-4" />}
            </div>
            {!isDisabled && (
              <span className="text-xs opacity-70 font-normal">Powered by CNN + Grad-CAM</span>
            )}
          </div>
        </>
      )}
    </button>
  )
}

// Sidebar component combining upload, form, and diagnosis button
interface SidebarProps {
  imageBase64: string | null
  previewUrl: string | null
  patientMetadata: any
  isLoading: boolean
  onImageUpload: (file: File, base64: string) => void
  onClearImage: () => void
  onMetadataChange: (metadata: any) => void
  onDiagnose: () => Promise<void>
}

export function Sidebar({
  imageBase64,
  previewUrl,
  patientMetadata,
  isLoading,
  onImageUpload,
  onClearImage,
  onMetadataChange,
  onDiagnose,
}: SidebarProps) {
  return (
    <aside className="w-[360px] flex-shrink-0 bg-surface/50 backdrop-blur-sm border-r border-border/50 flex flex-col h-screen sticky top-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upload Zone */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Fundus Image
          </h3>
        </div>

        {/* Patient Form */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Patient Data
          </h3>
        </div>
      </div>

      {/* Diagnosis Button */}
      <div className="p-6 pt-0">
        <DiagnosisButton
          onDiagnose={onDiagnose}
          isLoading={isLoading}
          hasImage={!!imageBase64}
        />
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-text-muted">
          <svg className="w-4 h-4 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Results require verification by a licensed ophthalmologist
        </div>
      </div>
    </aside>
  )
}