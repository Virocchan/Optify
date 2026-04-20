import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const project = process.env.GOOGLE_CLOUD_PROJECT
    const location = process.env.VERTEX_LOCATION || 'us-central1'
    const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash'

    const result: any = {
      env: {
        GOOGLE_CLOUD_PROJECT: project,
        VERTEX_LOCATION: location,
        GEMINI_MODEL_NAME: modelName,
      }
    }

    if (!project || project === 'your-project-id') {
      return NextResponse.json({
        status: 'error',
        message: 'GOOGLE_CLOUD_PROJECT not configured',
        ...result
      }, { status: 500 })
    }

    // Try to get token from metadata service (works on GCP)
    // Fallback to ADC for local development
    let token = null

    try {
      const tokenRes = await fetch(
        'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
        {
          headers: { 'Metadata-Flavor': 'Google' },
          signal: AbortSignal.timeout(3000)
        }
      )

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        token = tokenData.access_token
        result.tokenSource = 'metadata-service'
      }
    } catch (e) {
      result.tokenSource = 'metadata-service-failed'
      result.tokenError = e instanceof Error ? e.message : 'Unknown error'
    }

    // If no token from metadata, try google-auth-library
    if (!token) {
      try {
        const { GoogleAuth } = await import('google-auth-library')
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        })
        const client = await auth.getClient()
        const tokenResponse = await client.getAccessToken()
        token = tokenResponse.token
        result.tokenSource = 'google-auth-library'
      } catch (e) {
        result.tokenError = e instanceof Error ? e.message : 'Unknown error'
      }
    }

    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to get access token',
        ...result
      }, { status: 500 })
    }

    result.token = token ? 'obtained (' + token.length + ' chars)' : 'null'

    // Test Vertex AI API
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
          parts: [{ text: 'Say "Hello! Connection successful!" in exactly those words.' }]
        }],
        generationConfig: {
          maxOutputTokens: 100
        }
      }),
    })

    result.apiStatus = response.status

    if (!response.ok) {
      const errorText = await response.text()
      result.apiError = errorText
      return NextResponse.json({
        status: 'error',
        message: `API Error: ${response.status}`,
        ...result
      }, { status: 500 })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'

    return NextResponse.json({
      status: 'success',
      message: text,
      ...result
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}