'use client'

import { useState, useCallback, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import {
  loadGlaucomaModel,
  predict,
  disposeModel,
  PredictionResult
} from '@/lib/cnn-model'

export interface UseCNNModelResult {
  loadModel: () => Promise<void>
  makePrediction: (imageBase64: string) => Promise<PredictionResult | null>
  isLoading: boolean
  isModelLoaded: boolean
  isPredicting: boolean
  error: string | null
  modelLoadTime: number | null
}

export function useCNNModel(): UseCNNModelResult {
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelLoadTime, setModelLoadTime] = useState<number | null>(null)
  const [model, setModel] = useState<tf.LayersModel | null>(null)

  // Load model on mount
  useEffect(() => {
    loadModelFn()
    return () => {
      disposeModel()
    }
  }, [])

  const loadModelFn = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const startTime = performance.now()

    const result = await loadGlaucomaModel()

    const endTime = performance.now()
    setModelLoadTime(endTime - startTime)

    if (result.success && result.model) {
      setModel(result.model)
      setIsModelLoaded(true)
    } else {
      setError(result.error || 'Failed to load model')
    }

    setIsLoading(false)
  }, [])

  const makePrediction = useCallback(async (imageBase64: string): Promise<PredictionResult | null> => {
    if (!model) {
      setError('Model not loaded')
      return null
    }

    setIsPredicting(true)
    setError(null)

    try {
      const result = await predict(model, imageBase64)
      setIsPredicting(false)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed')
      setIsPredicting(false)
      return null
    }
  }, [model])

  return {
    loadModel: loadModelFn,
    makePrediction,
    isLoading,
    isModelLoaded,
    isPredicting,
    error,
    modelLoadTime
  }
}

/**
 * Hook for CNN diagnosis with automatic image upload
 */
export interface UseCNNDiagnosisOptions {
  onSuccess?: (result: PredictionResult) => void
  onError?: (error: string) => void
}

export function useCNNDiagnosis(options: UseCNNDiagnosisOptions = {}) {
  const { onSuccess, onError } = options
  const cnn = useCNNModel()

  const diagnose = useCallback(async (imageBase64: string) => {
    const result = await cnn.makePrediction(imageBase64)
    if (result) {
      onSuccess?.(result)
    } else {
      onError?.(cnn.error || 'Diagnosis failed')
    }
    return result
  }, [cnn, onSuccess, onError])

  return {
    ...cnn,
    diagnose
  }
}