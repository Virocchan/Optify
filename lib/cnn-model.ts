/**
 * CNN Model for Glaucoma Detection
 * Browser-based inference using TensorFlow.js
 *
 * Model architecture matches the trained Keras model:
 * - Input: 224x224x3 RGB fundus image
 * - Output: Probability of glaucoma (0-1)
 */

import * as tf from '@tensorflow/tfjs'

// Model configuration
const IMAGE_SIZE = 224
const MODEL_URL = '/models/glaucoma_cnn_model/model.json'

// Feature thresholds (matching the backend)
const CDR_THRESHOLD_RED = 0.5
const CDR_THRESHOLD_AMBER = 0.4

export interface PredictionResult {
  prediction: 'glaucoma' | 'normal'
  confidence: number
  cdr: number
  gradcam_heatmap_base64: string
  shap_values: {
    cup_disc_ratio: number
    rim_thinning: number
    visual_field_md: number
    iop_level: number
    rnfl_thickness: number
    disc_haemorrhage: number
  }
}

export interface ModelLoadResult {
  success: boolean
  model?: tf.LayersModel
  error?: string
}

let cachedModel: tf.LayersModel | null = null

/**
 * Load the CNN model from the public directory
 */
export async function loadGlaucomaModel(): Promise<ModelLoadResult> {
  if (cachedModel) {
    return { success: true, model: cachedModel }
  }

  try {
    // Set up TensorFlow.js backend
    await tf.ready()

    // Load model from public directory
    const model = await tf.loadLayersModel(MODEL_URL)
    cachedModel = model

    console.log('Glaucoma CNN model loaded successfully')
    return { success: true, model }
  } catch (error) {
    console.error('Failed to load glaucoma model:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Preprocess image for model prediction
 * Converts base64 to normalized tensor
 */
function preprocessImage(base64: string): tf.Tensor {
  // Extract image data from base64
  const img = new Image()
  img.src = base64

  // Create canvas and resize to 224x224
  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_SIZE
  canvas.height = IMAGE_SIZE
  const ctx = canvas.getContext('2d')!

  // Draw and resize image
  ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE)

  // Get image data and convert to tensor
  const imageData = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)
  let tensor = tf.browser.fromPixels(imageData)

  // Convert to float and normalize to [0, 1]
  tensor = tensor.toFloat().div(255.0)

  // Add batch dimension: [224, 224, 3] -> [1, 224, 224, 3]
  tensor = tensor.expandDims(0)

  return tensor
}

/**
 * Generate a simplified Grad-CAM heatmap
 * Note: Full Grad-CAM requires access to intermediate layers
 */
function generateGradCAMHeatmap(
  model: tf.LayersModel,
  base64: string
): string {
  // For production, implement proper Grad-CAM
  // This is a placeholder that returns the original image with overlay
  return base64 // In real implementation, compute conv layer activations
}

/**
 * Estimate CDR from image features
 * This is a simplified estimation - real CDR requires specialized models
 */
function estimateCDR(confidence: number): number {
  // Estimate CDR based on model confidence
  // Higher confidence of glaucoma typically correlates with higher CDR
  const baseCDR = 0.3
  const adjustedCDR = baseCDR + (confidence / 100) * 0.4
  return Math.min(0.9, Math.max(0.1, adjustedCDR))
}

/**
 * Generate feature importance estimates
 * In production, these would come from SHAP or integrated gradients
 */
function generateFeatureImportance(
  confidence: number
): PredictionResult['shap_values'] {
  // Simulated feature importance based on confidence
  // In production, use SHAP values or integrated gradients
  const intensity = confidence / 100
  return {
    cup_disc_ratio: 45 + intensity * 35,
    rim_thinning: 20 + intensity * 30,
    visual_field_md: 10 + intensity * 25,
    iop_level: 5 + intensity * 20,
    rnfl_thickness: 3 + intensity * 15,
    disc_haemorrhage: 1 + intensity * 10,
  }
}

/**
 * Make prediction on a fundus image
 */
export async function predict(
  model: tf.LayersModel,
  imageBase64: string
): Promise<PredictionResult> {
  const tensor = preprocessImage(imageBase64)

  // Run inference
  const prediction = model.predict(tensor) as tf.Tensor
  const confidenceArray = await prediction.data()
  const confidence = confidenceArray[0]

  // Clean up tensors
  tensor.dispose()
  prediction.dispose()

  // Convert confidence to percentage
  const confidencePercent = confidence * 100

  // Determine prediction class
  const isGlaucoma = confidence > 0.5
  const predictionClass = isGlaucoma ? 'glaucoma' : 'normal'

  // Generate additional outputs
  const cdr = estimateCDR(confidencePercent)
  const gradcam = generateGradCAMHeatmap(model, imageBase64)
  const shapValues = generateFeatureImportance(confidencePercent)

  return {
    prediction: predictionClass,
    confidence: confidencePercent,
    cdr,
    gradcam_heatmap_base64: gradcam,
    shap_values: shapValues,
  }
}

/**
 * Clean up model from cache
 */
export function disposeModel(): void {
  if (cachedModel) {
    cachedModel.dispose()
    cachedModel = null
  }
}