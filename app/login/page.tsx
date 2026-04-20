'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simple validation for demo
    if (!email || !password) {
      setError('Please enter both email and password')
      setIsLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    // Store auth state (in production, this would be a real auth system)
    // Set cookie for server-side auth check
    document.cookie = 'optify_auth=true; path=/; max-age=86400; samesite=strict'
    sessionStorage.setItem('optify_auth', 'true')
    sessionStorage.setItem('optify_user', email)

    setIsLoading(false)
    router.push('/')
  }, [email, password, router])

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary-light p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <img src="/optify-logo.png" alt="Optify" className="w-14 h-14 rounded-2xl shadow-lg object-contain bg-white/10 backdrop-blur" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Optify</h1>
              <p className="text-white/70 text-sm">AI-Powered Healthcare</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Clinical-grade AI<br />diagnostic workspace
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Empowering ophthalmologists with CNN-powered glaucoma detection and Gemini-powered clinical explanations.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">95%+</div>
              <div className="text-white/60 text-sm">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">&lt;3s</div>
              <div className="text-white/60 text-sm">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/60 text-sm">Availability</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          Advanced glaucoma screening technology
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/optify-logo.png" alt="Optify" className="w-12 h-12 rounded-xl shadow-lg object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Optify</h1>
              <p className="text-xs text-text-muted">AI-Powered Glaucoma Diagnosis</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-xl shadow-primary/5 border border-border p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-text-primary">Welcome back</h2>
              <p className="text-text-muted mt-2">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-danger-light border border-danger/20 flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                <span className="text-sm text-danger">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-text-primary">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-text-muted" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-text-muted" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={clsx(
                    'w-5 h-5 rounded-md border transition-all flex items-center justify-center',
                    rememberMe
                      ? 'bg-primary border-primary'
                      : 'border-border group-hover:border-primary/50'
                  )}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-text-secondary">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  'w-full py-3.5 rounded-xl font-semibold text-white transition-all relative overflow-hidden',
                  isLoading
                    ? 'bg-primary/70 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-surface text-xs text-text-muted">or continue with</span>
              </div>
            </div>

            {/* SSO buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-background hover:bg-background/80 transition-colors text-sm font-medium text-text-primary">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-background hover:bg-background/80 transition-colors text-sm font-medium text-text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.421 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-text-muted mt-6">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  )
}