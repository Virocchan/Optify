import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Optify — AI-Powered Glaucoma Diagnosis',
  description: 'Clinical-grade AI diagnostic workspace for ophthalmologists powered by Vertex AI CNN and Gemini 2.0 Flash explainability.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%231D9E75'/><circle cx='16' cy='16' r='6' fill='white'/><circle cx='16' cy='16' r='3' fill='%231D9E75'/></svg>" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}