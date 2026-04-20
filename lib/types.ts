// ============================================================
// Optify — Type Definitions
// ============================================================

export type Prediction = 'glaucoma' | 'normal'

export interface FeatureImportance {
  cup_disc_ratio: number
  rim_thinning: number
  visual_field_md: number
  iop_level: number
  rnfl_thickness: number
  disc_haemorrhage: number
  [key: string]: number
}

export interface DiagnosisResult {
  prediction: Prediction
  confidence: number        // 0–100
  cdr: number               // 0–1
  gradcam_heatmap_base64: string
  shap_values: FeatureImportance
  timestamp: string
}

export interface PatientMetadata {
  age?: number
  eye_side?: 'OS' | 'OD'
  iop?: number
  md?: number
  visual_field_pattern?: string
}

export interface DiagnoseRequest {
  image_base64: string
  metadata: PatientMetadata
}

export interface DiagnoseResponse {
  prediction: Prediction
  confidence: number
  cdr: number
  gradcam_heatmap_base64: string
  shap_values: FeatureImportance
}

export interface ApiError {
  error: string
  code: string
}

// Chat types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Report types
export interface ReportData {
  diagnosis: DiagnoseResponse
  patient: PatientMetadata
  gradcam_image: string
  gemini_explanation: string
}

// Feature display config
export const FEATURE_LABELS: Record<keyof FeatureImportance, string> = {
  cup_disc_ratio: 'Cup-disc ratio',
  rim_thinning: 'Rim thinning',
  visual_field_md: 'Visual field MD',
  iop_level: 'IOP level',
  rnfl_thickness: 'RNFL thickness',
  disc_haemorrhage: 'Disc haemorrhage',
}

export const FEATURE_THRESHOLDS = {
  red: 60,
  amber: 30,
} as const

export function getFeatureColor(weight: number): string {
  if (weight >= FEATURE_THRESHOLDS.red) return 'danger'
  if (weight >= FEATURE_THRESHOLDS.amber) return 'warning'
  return 'primary'
}

// CDR thresholds
export const CDR_THRESHOLD_RED = 0.5
export const CDR_THRESHOLD_AMBER = 0.4

// IOP thresholds
export const IOP_THRESHOLD_AMBER = 21

// MD thresholds
export const MD_THRESHOLD_RED = -6

// Visual field pattern options
export const VISUAL_FIELD_PATTERNS = [
  'None',
  'Arcuate scotoma',
  'Nasal step',
  'Generalized depression',
  'Central scotoma',
  'Paracentral scotoma',
] as const

export type VisualFieldPattern = typeof VISUAL_FIELD_PATTERNS[number]