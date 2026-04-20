# Optify — AI-Powered Glaucoma Diagnosis

A clinical-grade AI diagnostic workspace for ophthalmologists, combining a CNN-powered glaucoma classifier with explainability (Grad-CAM) and a Gemini-powered chat layer for clinical reasoning.

![Optify Logo](public/optify-logo.png)

## Features

- **CNN-Powered Detection**: Deep learning model for glaucoma detection from fundus images
- **Grad-CAM Visualization**: AI explainability through attention heatmaps
- **Feature Importance**: SHAP-based feature contribution analysis
- **Gemini AI Chat**: Clinical explanations powered by Google Gemini 2.0 Flash
- **PDF Reports**: Generate comprehensive diagnostic reports
- **Modern UI/UX**: Professional medical-grade interface

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **AI/ML**: TensorFlow.js (browser inference), Vertex AI (cloud inference)
- **API**: Next.js API Routes, Google Cloud AI Platform
- **Auth**: Session-based authentication with cookies
- **PDF**: @react-pdf/renderer

## Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud account with Vertex AI API enabled
- Google Cloud SDK (for local development authentication)

## Environment Setup

1. **Create `.env.local` file** in the project root:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
VERTEX_LOCATION=us-central1
GEMINI_MODEL_NAME=gemini-2.0-flash
```

2. **Authenticate with Google Cloud**:

```bash
# Install Google Cloud SDK if not already installed
# https://cloud.google.com/sdk/docs/install

# Authenticate for local development
gcloud auth application-default login
```

3. **Enable Vertex AI API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services > Library
   - Search for "Vertex AI API" and enable it

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /api
    /diagnose     # CNN model prediction endpoint
    /gemini       # Gemini AI chat endpoint
    /report       # PDF report generation
    /test-vertex  # Vertex AI connection test
  /login          # Authentication page
  page.tsx        # Main diagnosis workspace
  layout.tsx      # Root layout

/components
  /upload         # Image upload component
  /form           # Patient metadata form
  /results        # Diagnosis result display
  /xai            # Grad-CAM & feature importance
  /chat           # Gemini chat panel

/lib
  /cnn-model.ts   # TensorFlow.js model loading & prediction
  /use-cnn-model.ts # React hook for CNN model
  /vertex-ai.ts    # Vertex AI client
  /types.ts       # TypeScript interfaces
  /pdf.tsx        # PDF report template

/models
  /glaucoma_cnn_model/ # TensorFlow.js model files
  convert_model.py     # Script to convert Keras .h5 to TF.js

/middleware.ts    # Route protection
```

## Usage

### Login
Use any email/password combination to log in (demo mode).

### Upload Fundus Image
1. Click the upload zone or drag-and-drop a fundus image
2. Accepted formats: JPEG, PNG (max 10MB)
3. Image preview will appear with metadata

### Enter Patient Data (Optional)
- Age
- Eye side (OS/OD)
- IOP (Intraocular Pressure)
- MD (Mean Deviation)
- Visual field pattern

### Run AI Diagnosis
1. Click "Run AI Diagnosis" button
2. Wait for analysis (typically 2-5 seconds)
3. View results:
   - **Result Banner**: Prediction with confidence circle
   - **Metric Cards**: CDR, IOP, MD values
   - **XAI Panel**: Grad-CAM heatmap and feature importance
   - **Chat Panel**: Ask questions about the diagnosis

### Generate Report
Click "Generate Report" to download a PDF with:
- Patient metadata
- Fundus image
- Diagnosis results
- Grad-CAM visualization
- Feature importance table
- AI explanation

## CNN Model Setup

The project supports both **browser-based** (TensorFlow.js) and **cloud-based** (Vertex AI) inference.

### Browser-Based (TensorFlow.js)

1. Train your model using the provided Python notebook (`final_code_for_data_analysis (1).py`)
2. Convert to TensorFlow.js format:
   ```bash
   pip install tensorflowjs
   tensorflowjs_converter \
     --input_format=keras \
     --output_format=tfjs_graph_model \
     best_custom_model.h5 \
     public/models/glaucoma_cnn_model/
   ```
3. Place the generated files in `/public/models/glaucoma_cnn_model/`

### Cloud-Based (Vertex AI)

1. Deploy your trained model to Vertex AI Endpoint
2. Update the `/api/diagnose/route.ts` to call your endpoint

## API Endpoints

### POST /api/diagnose
```json
Request: {
  "image_base64": "data:image/jpeg;base64,...",
  "metadata": {
    "age": 55,
    "eye_side": "OD",
    "iop": 18.5,
    "md": -2.1
  }
}
Response: {
  "prediction": "glaucoma" | "normal",
  "confidence": 85.4,
  "cdr": 0.45,
  "gradcam_heatmap_base64": "data:image/png;base64,...",
  "shap_values": {
    "cup_disc_ratio": 45.2,
    "rim_thinning": 32.1,
    ...
  }
}
```

### POST /api/gemini
```json
Request: {
  "systemPrompt": "You are a clinical assistant...",
  "userMessage": "Explain the diagnosis"
}
Response: Stream of text tokens
```

### POST /api/report
```json
Request: {
  "diagnosis": {...},
  "patient": {...},
  "gradcamImage": "base64...",
  "geminiExplanation": "...",
  "featureImportance": {...}
}
Response: PDF binary stream
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Authentication

Currently in demo mode - any email/password combination works.

For production, implement:
- Firebase Auth
- Google OAuth
- Or integrate with your existing healthcare auth system

## Troubleshooting

### Vertex AI Connection Issues

1. Ensure `GOOGLE_CLOUD_PROJECT` is set in `.env.local`
2. Run `gcloud auth application-default login`
3. Test connection: visit `/api/test-vertex`

### Model Loading Issues (TensorFlow.js)

1. Check `/public/models/glaucoma_cnn_model/` exists
2. Verify `model.json` and weight files are present
3. Check browser console for errors

### Chat Not Working

1. Check Vertex AI API is enabled
2. Verify authentication is working
3. Check browser console for error details

## License

Private - All rights reserved

## Support

For issues or questions, please refer to the project documentation or contact the development team.