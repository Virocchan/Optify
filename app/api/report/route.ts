import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { DiagnosisReport } from '@/lib/pdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { diagnosis, patient, gradcamImage, geminiExplanation, featureImportance } = body

    if (!diagnosis || !patient) {
      return NextResponse.json(
        { error: 'Missing required report data', code: 'MISSING_DATA' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      DiagnosisReport({
        diagnosis,
        patient,
        gradcamImage: gradcamImage || '',
        geminiExplanation: geminiExplanation || 'No explanation available.',
        featureImportance: featureImportance || {},
      })
    )

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="optify-report-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', code: 'REPORT_ERROR' },
      { status: 500 }
    )
  }
}