'use client'

import { useState, useCallback, useRef } from 'react'
import clsx from 'clsx'
import { UploadZone } from '@/components/upload/UploadZone'
import { PatientForm } from '@/components/form/PatientForm'
import { ResultBanner } from '@/components/results/ResultBanner'
import { MetricCardsRow } from '@/components/results/MetricCards'
import { XAIPanel } from '@/components/xai/XAIPanel'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { DiagnosisButton } from '@/components/Sidebar'
import { DiagnoseResponse, PatientMetadata, FeatureImportance } from '@/lib/types'
import { Loader2, Menu, X, LogOut } from 'lucide-react'

// Skeleton component for loading states
function ResultSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Result banner skeleton */}
      <div className="rounded-2xl bg-surface border shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent animate-shimmer" />
        <div className="p-6 flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-background" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-background rounded-lg" />
            <div className="h-4 w-full bg-background rounded-lg" />
            <div className="h-4 w-3/4 bg-background rounded-lg" />
            <div className="flex gap-3 mt-4">
              <div className="h-10 w-36 bg-background rounded-xl" />
              <div className="h-10 w-28 bg-background rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-surface rounded-2xl border shadow-sm" />
        ))}
      </div>

      {/* XAI panel skeleton */}
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-surface rounded-2xl border shadow-sm" />
        <div className="h-80 bg-surface rounded-2xl border shadow-sm" />
      </div>

      {/* Chat panel skeleton */}
      <div className="h-72 bg-surface rounded-2xl border shadow-sm" />
    </div>
  )
}

export default function DiagnosisPage() {
  // Image state
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Patient metadata
  const [metadata, setMetadata] = useState<PatientMetadata>({})

  // Diagnosis state
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnoseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mobile sidebar
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Initial Gemini explanation
  const [geminiExplanation, setGeminiExplanation] = useState<string>('')

  // Logout handler
  const handleLogout = useCallback(() => {
    document.cookie = 'optify_auth=; path=/; max-age=0'
    sessionStorage.removeItem('optify_auth')
    sessionStorage.removeItem('optify_user')
    window.location.href = '/login'
  }, [])

  const handleImageUpload = useCallback((file: File, base64: string) => {
    setImageBase64(base64)
    setPreviewUrl(base64)
    setDiagnosisResult(null)
    setError(null)
  }, [])

  const handleClearImage = useCallback(() => {
    setImageBase64(null)
    setPreviewUrl(null)
    setDiagnosisResult(null)
  }, [])

  const handleDiagnose = useCallback(async () => {
    if (!imageBase64) return

    setIsLoading(true)
    setError(null)
    setDiagnosisResult(null)

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Diagnosis failed')
      }

      const result: DiagnoseResponse = await response.json()
      setDiagnosisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [imageBase64, metadata])

  const handleGenerateReport = useCallback(async () => {
    if (!diagnosisResult) return

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: {
            prediction: diagnosisResult.prediction,
            confidence: diagnosisResult.confidence,
            cdr: diagnosisResult.cdr,
          },
          patient: metadata,
          gradcamImage: diagnosisResult.gradcam_heatmap_base64,
          geminiExplanation,
          featureImportance: diagnosisResult.shap_values,
        }),
      })

      if (!response.ok) throw new Error('Report generation failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `optify-report-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    }
  }, [diagnosisResult, metadata, geminiExplanation])

  const handleFlagForReview = useCallback(() => {
    // In production, this would save to a review queue
    alert('Flagged for specialist review. In production, this would be saved to your review queue.')
  }, [])

  const chatContext = diagnosisResult ? {
    diagnosis: diagnosisResult.prediction,
    confidence: diagnosisResult.confidence,
    cdr: diagnosisResult.cdr,
    iop: metadata.iop,
    md: metadata.md,
    gradcamRegion: 'optic disc region (inferior temporal quadrant)',
    featureImportance: diagnosisResult.shap_values,
    patientAge: metadata.age,
    eyeSide: metadata.eye_side,
  } : null

  return (
    <div className="min-h-screen bg-background flex flex-col neural-bg">
      {/* Page header with logo */}
      <header className="bg-surface/80 backdrop-blur-lg border-b border-border/50 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="relative">
            <img
              src="/optify-logo.png"
              alt="Optify Logo"
              className="w-10 h-10 rounded-xl shadow-lg object-contain bg-white"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">Optify</h1>
            <p className="text-xs text-text-muted">AI-Powered Glaucoma Diagnosis</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow"></div>
              AI-Assisted
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background/80 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/optify-logo.png"
            alt="Optify Logo"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-semibold text-text-primary">Optify</span>
        </div>
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 rounded-badge hover:bg-background transition-colors"
        >
          {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex flex-1 pt-[72px] lg:pt-0">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex w-[360px] flex-shrink-0 bg-surface/50 backdrop-blur-sm border-r border-border/50 flex-col h-screen sticky top-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Upload */}
            <div className="bg-surface rounded-2xl p-5 shadow-card border border-border/50 animate-scale-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Fundus Image</h3>
              </div>
              <UploadZone
                onImageUpload={handleImageUpload}
                previewUrl={previewUrl}
                onClear={handleClearImage}
              />
            </div>

            {/* Patient Form */}
            <div className="bg-surface rounded-2xl p-5 shadow-card border border-border/50 animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Patient Data</h3>
              </div>
              <PatientForm metadata={metadata} onChange={setMetadata} />
            </div>
          </div>

          {/* Diagnosis Button */}
          <div className="p-6 pt-0 bg-surface/50 backdrop-blur-sm border-t border-border/50">
            <DiagnosisButton
              onDiagnose={handleDiagnose}
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

        {/* Mobile sidebar overlay */}
        {showMobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-10 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
        )}

        {/* Mobile sidebar sheet */}
        <div className={clsx(
          'lg:hidden fixed left-0 bottom-0 z-20 w-full max-h-[85vh] bg-surface rounded-t-card transform transition-transform duration-300 ease-out',
          showMobileSidebar ? 'translate-y-0' : 'translate-y-full'
        )}>
          <div className="p-6 space-y-6 overflow-y-auto">
            <UploadZone
              onImageUpload={handleImageUpload}
              previewUrl={previewUrl}
              onClear={handleClearImage}
            />
            <PatientForm metadata={metadata} onChange={setMetadata} />
            <DiagnosisButton
              onDiagnose={handleDiagnose}
              isLoading={isLoading}
              hasImage={!!imageBase64}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-6">
            {error && (
              <div className="p-5 rounded-2xl bg-danger-light border border-danger/20 text-danger text-sm animate-fade-in flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            {!diagnosisResult && !isLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-slide-up">
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-float">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-3 gradient-text">
                  Ready for Diagnosis
                </h2>
                <p className="text-text-secondary max-w-lg text-base leading-relaxed mb-8">
                  Upload a fundus image and click <span className="font-semibold text-primary">Run AI Diagnosis</span> to begin. Our CNN model will analyze the image and provide insights with Grad-CAM visualization.
                </p>
                <div className="flex items-center gap-8 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    CNN Analysis
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Grad-CAM Heatmaps
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    AI Explanations
                  </div>
                </div>
              </div>
            )}

            {isLoading && <ResultSkeleton />}

            {diagnosisResult && !isLoading && (
              <div className="space-y-6">
                {/* Result Banner */}
                <ResultBanner
                  prediction={diagnosisResult.prediction}
                  confidence={diagnosisResult.confidence}
                  cdr={diagnosisResult.cdr}
                  onGenerateReport={handleGenerateReport}
                  onFlagForReview={handleFlagForReview}
                />

                {/* Metric Cards */}
                <MetricCardsRow
                  cdr={diagnosisResult.cdr}
                  iop={metadata.iop}
                  md={metadata.md}
                />

                {/* XAI Panel */}
                <XAIPanel
                  originalImage={previewUrl || ''}
                  heatmapBase64={diagnosisResult.gradcam_heatmap_base64}
                  features={diagnosisResult.shap_values}
                />

                {/* Gemini Chat */}
                {chatContext && (
                  <ChatPanel diagnosisContext={chatContext} initialExplanation={geminiExplanation} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}