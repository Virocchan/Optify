# Optify — AI-Powered Glaucoma Diagnosis Tool

## Concept & Vision

Optify is a clinical-grade AI diagnostic workspace for ophthalmologists, combining a CNN-powered glaucoma classifier with explainability (Grad-CAM) and a Gemini-powered chat layer for clinical reasoning. The experience feels like a high-end medical instrument — precise, trustworthy, and calm — not flashy or consumer-y. Every interaction reinforces clinical confidence while maintaining transparency about AI limitations.

---

## Design Language

### Aesthetic Direction
Medical-precision minimalism. Inspired by high-end diagnostic equipment (Zeiss, Topcon) and modern EHR interfaces. Clean white surfaces, subtle shadows, precise typography, and deliberate use of color only for clinical signal (risk indicators, confidence levels). The interface should feel like a tool that saves vision, not a startup dashboard.

### Color Palette
- **Primary / Teal**: `#1D9E75` — clinical trust, safe/normal outcomes
- **Primary Light**: `#E8F5F0` — subtle backgrounds
- **Danger / Red**: `#E24B4A` — high-risk indicators, glaucoma detected
- **Danger Light**: `#FCEAEA`
- **Warning / Amber**: `#EF9F27` — uncertain results, borderline values
- **Warning Light**: `#FFF5E6`
- **Background**: `#F5F5F3` — warm off-white, not sterile
- **Surface**: `#FFFFFF` — cards and panels
- **Border**: `rgba(0,0,0,0.06)`
- **Text Primary**: `#1A1A1A`
- **Text Secondary**: `#6B7280`
- **Text Muted**: `#9CA3AF`

### Typography
- **Font**: `Inter` (Google Fonts), fallback: `system-ui, -apple-system, sans-serif`
- **Headings**: 600 weight, tracking -0.02em
- **Body**: 400 weight, 1.5 line-height
- **Mono / Metrics**: `JetBrains Mono` for numeric values and confidence scores

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 12px (cards), 8px (inputs), 6px (badges)

### Motion Philosophy
- **Loading states**: Skeleton shimmer (1.5s ease-in-out infinite)
- **Panel reveals**: 300ms fade + 8px translateY, ease-out
- **Hover interactions**: 150ms color/shadow transitions
- **Chat streaming**: Token-by-token with subtle fade-in per chunk
- **Drag feedback**: Scale 1.02 on drag-over, 200ms spring

### Visual Assets
- Icons: Lucide React (consistent 1.5px stroke)
- No emoji — use SVG icons for all indicators
- Grad-CAM heatmap: teal→amber→red colormap
- Custom confidence circle (SVG arc, not a library)

---

## Layout & Structure

### Desktop (≥1024px)
Two-column fixed layout:
- **Left sidebar** (340px): upload zone, patient metadata, run button — sticky, scrollable if content overflows
- **Right main area**: result banner, metric cards, XAI grid, Gemini chat — scrollable

### Tablet (768px–1023px)
Sidebar collapses to 280px, main area adjusts.

### Mobile (<768px)
Single column. Sidebar becomes a bottom sheet triggered by a floating action button. Main area stacks vertically.

### Page Flow
1. Empty state: sidebar prompts upload, main area shows placeholder instructions
2. Upload → preview appears in sidebar with CDR badge overlay
3. Run diagnosis → loading skeleton in main area
4. Results arrive → banner + cards + XAI + chat all reveal with stagger animation
5. Error state → inline error with retry option

---

## Features & Interactions

### Fundus Image Upload
- Drag-and-drop zone with dashed border
- Click-to-browse fallback
- Accepted: JPEG, PNG, max 10MB
- On drag-over: border turns teal, background lightens
- On invalid file: shake animation + error toast
- On success: preview thumbnail (200px height), filename, resolution badge, CDR overlay badge (if available)

### Patient Metadata Form
- Age: number input, range 18–120, optional
- Eye side: toggle pills (OS | OD), default none selected
- IOP: number input, range 5–60, step 0.1, optional
- MD: number input, range -35 to +10, step 0.1, optional
- Visual field pattern: dropdown with options (None, Arcuate scotoma, Nasal step, Generalized depression, Central scotoma, Paracentral scotoma) + free text fallback

### Run AI Diagnosis Button
- Disabled until image uploaded
- On click: POST to `/api/diagnose` with base64 image + metadata
- Shows spinner + "Analyzing fundus..." text
- Timeout: 60 seconds with user-friendly timeout message
- On success: triggers result display
- On API error: shows error banner with retry

### Result Banner
- Confidence circle: SVG arc showing 0–100%, color-coded (red <70%, amber 70–85%, teal >85%)
- Diagnosis label: large text, color-coded
- Description: one-line summary
- Two buttons: "Generate Report" (primary), "Flag for Review" (ghost/danger)
- Positive result: red theme border-left 4px solid
- Normal result: teal theme

### Metric Cards (3-column grid)
- **CDR**: value + label, flag red if >0.5, amber if >0.4
- **IOP**: value + label, flag amber if >21
- **MD**: value + label, flag red if <−6

### XAI Panel — Two Column
- **Left: Grad-CAM heatmap**
  - Original image as base layer
  - Semi-transparent heatmap overlay (opacity 0.6)
  - Colormap: teal (0) → amber (0.5) → red (1.0)
  - Dashed circle annotation on optic disc region
  - Color scale legend bar below

- **Right: Feature importance bar chart**
  - Horizontal bars, sorted by weight descending
  - 6 features: Cup-disc ratio, Rim thinning, Visual field MD, IOP level, RNFL thickness, Disc haemorrhage
  - Color coding by weight: red (>60%), amber (30–60%), teal (<30%)
  - Animated bar fill on load (600ms stagger)

### Gemini 2.0 Flash Chat Panel
- Auto-sends diagnosis context on load (system message)
- Initial AI response displayed in a distinct "AI explanation" card (teal left-border)
- User input: textarea with send button, Enter to submit (Shift+Enter for newline)
- Streaming: tokens appear one-by-one with 20ms delay simulation
- Disclaimer badge at bottom: "AI-assisted screening only. Not a substitute for clinical diagnosis."

### Report Generation (PDF)
- Uses `@react-pdf/renderer`
- Contents: patient metadata, fundus image, Grad-CAM, diagnosis, confidence, feature importance table, Gemini explanation, footer disclaimer
- Triggers browser download

---

## Component Inventory

### UploadZone
- **Default**: Dashed border, upload icon, "Drop fundus image or click to browse" text
- **Drag-over**: Teal border, lighter background, scale 1.02
- **With image**: Preview thumbnail, filename, resolution badge, remove button
- **Error**: Red border, shake, error message

### PatientForm
- Standard inputs with floating labels
- Toggle pills for eye side
- All fields optional

### DiagnosisButton
- **Disabled**: Gray, cursor-not-allowed
- **Ready**: Teal background, white text
- **Loading**: Spinner + "Analyzing..." text
- **Error/Retry**: Outline style

### ConfidenceCircle
- SVG arc, stroke-dasharray animation
- Color from palette based on confidence level
- Percentage text in center (mono font)

### MetricCard
- Icon + label + value
- Border-left indicator for flag status (teal/amber/red)
- Subtle background tint when flagged

### GradCAMViewer
- Canvas-based image overlay
- Draggable annotation circle
- Color legend bar

### FeatureBarChart
- Horizontal bars with animated fill
- Color-coded by weight threshold
- Value labels at bar end

### ChatPanel
- Message bubble list (AI: teal bg, User: white bg)
- Streaming cursor (blinking underscore)
- Input area with send button
- Disclaimer footer

### ReportButton
- Primary: teal filled
- Loading: spinner replacement

---

## Technical Approach

### Authentication
- **Session-based auth** using cookies for server-side route protection
- **Login page** at `/login` with email/password form
- **Middleware** (`middleware.ts`) protects main route, redirects unauthenticated users to login

### Framework
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** with custom design tokens
- **Inter** + **JetBrains Mono** fonts via `next/font`

### Project Structure
```
/app
  /layout.tsx
  /page.tsx          — Diagnosis workspace
  /api
    /diagnose/route.ts  — Proxy to Vertex AI
    /report/route.ts    — PDF generation endpoint
/components
  /upload
  /form
  /results
  /xai
  /chat
/lib
  /vertex-ai.ts      — Vertex AI client
  /gemini.ts         — Gemini client
  /pdf.ts            — Report generation
  /types.ts          — TypeScript interfaces
/styles
  /globals.css       — Tailwind base + custom properties
```

### API Design

**POST /api/diagnose**
```
Request: { image_base64: string, metadata: { age?, eye_side?, iop?, md?, visual_field_pattern? } }
Response: {
  prediction: "glaucoma" | "normal",
  confidence: number,       // 0–100
  cdr: number,             // 0–1
  gradcam_heatmap_base64: string,
  shap_values: { cup_disc_ratio: number, rim_thinning: number, ... }
}
Error: { error: string, code: string }
```

**POST /api/report**
```
Request: { diagnosis_result: object, patient_metadata: object }
Response: PDF binary stream
```

### AI Integration
- **Vertex AI**: CNN model endpoint — called server-side via `@google-cloud/aiplatform`
- **TensorFlow.js**: Alternative client-side CNN inference for browser-based prediction (see `/lib/cnn-model.ts`)
- **Gemini 2.0 Flash**: via `generative-ai` Vertex AI SDK — streaming enabled
- **Grad-CAM**: Generated server-side using the CNN's last conv layer weights, or client-side via TensorFlow.js gradients

### Data Model
```typescript
interface DiagnosisResult {
  prediction: 'glaucoma' | 'normal';
  confidence: number;
  cdr: number;
  gradcam_heatmap_base64: string;
  shap_values: FeatureImportance;
  timestamp: string;
}

interface PatientMetadata {
  age?: number;
  eye_side?: 'OS' | 'OD';
  iop?: number;
  md?: number;
  visual_field_pattern?: string;
}

interface FeatureImportance {
  cup_disc_ratio: number;
  rim_thinning: number;
  visual_field_md: number;
  iop_level: number;
  rnfl_thickness: number;
  disc_haemorrhage: number;
}
```

### Auth (Optional/Future)
- Firebase Auth placeholder — scaffolded but not enforced in v1

### Environment Variables
```
GOOGLE_CLOUD_PROJECT=your-project
VERTEX_ENDPOINT=your-endpoint-name
VERTEX_LOCATION=us-central1
GEMINI_MODEL_NAME=gemini-2.0-flash
```