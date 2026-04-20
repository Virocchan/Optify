import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { systemPrompt, userMessage } = body

    if (!systemPrompt || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'MISSING_FIELDS' },
        { status: 400 }
      )
    }

    const project = process.env.GOOGLE_CLOUD_PROJECT
    const location = process.env.VERTEX_LOCATION || 'us-central1'
    const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash'

    if (!project || project === 'your-project-id') {
      return NextResponse.json(
        { error: 'GOOGLE_CLOUD_PROJECT not configured', code: 'CONFIG_MISSING' },
        { status: 500 }
      )
    }

    let token = null

    // Try google-auth-library for local development (ADC)
    try {
      const { GoogleAuth } = await import('google-auth-library')
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      })
      const client = await auth.getClient()
      const tokenResponse = await client.getAccessToken()
      token = tokenResponse.token || null
    } catch (authError) {
      console.error('google-auth-library error:', authError)
    }

    // If no token from ADC, try metadata service (for GCP environments)
    if (!token) {
      try {
        const tokenRes = await fetch(
          'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
          {
            headers: { 'Metadata-Flavor': 'Google' },
            signal: AbortSignal.timeout(2000)
          }
        )
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          token = tokenData.access_token
        }
      } catch (metaError) {
        console.error('Metadata service error:', metaError)
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Failed to get access token. Run "gcloud auth application-default login" to set up credentials.', code: 'AUTH_FAILED' },
        { status: 500 }
      )
    }

    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${project}/locations/${location}/publishers/google/models/${modelName}:generateContent`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: userMessage }]
        }],
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
          topP: 0.95,
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vertex AI error:', response.status, errorText)
      throw new Error(`Vertex AI API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Gemini error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response', code: 'GEMINI_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}