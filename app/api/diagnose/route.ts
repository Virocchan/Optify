import { NextRequest, NextResponse } from 'next/server'
import { callVertexPrediction } from '@/lib/vertex-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_base64, metadata } = body

    if (!image_base64) {
      return NextResponse.json(
        { error: 'Image is required', code: 'MISSING_IMAGE' },
        { status: 400 }
      )
    }

    // Validate base64 string
    if (!image_base64.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format', code: 'INVALID_IMAGE' },
        { status: 400 }
      )
    }

    // Call Vertex AI prediction (or mock in development)
    const result = await callVertexPrediction(image_base64, metadata)

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return NextResponse.json(
      { error: 'Failed to process diagnosis', code: 'DIAGNOSIS_ERROR' },
      { status: 500 }
    )
  }
}