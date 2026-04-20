'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import clsx from 'clsx'
import { Send, Bot, User, Info } from 'lucide-react'
import { ChatMessage } from '@/lib/types'

interface ChatPanelProps {
  diagnosisContext: {
    diagnosis: string
    confidence: number
    cdr: number
    iop?: number
    md?: number
    gradcamRegion?: string
    featureImportance: Record<string, number>
    patientAge?: number
    eyeSide?: string
  }
  initialExplanation?: string
}

const SYSTEM_PROMPT = `You are GlaucoSight AI's clinical explainability assistant. You help ophthalmologists and medical staff understand AI-generated glaucoma diagnoses. Your role is to:
1. Explain in clear, clinical language why the model made its decision
2. Reference specific features from the feature importance scores
3. Describe what the Grad-CAM heatmap attention regions mean
4. Provide relevant clinical context about glaucoma without giving personal medical advice
5. Be honest about model limitations and confidence levels

Always be concise, evidence-referenced, and avoid alarmist language.`

function buildContextMessage(context: ChatPanelProps['diagnosisContext']): string {
  return `Diagnosis Result:
- Prediction: ${context.diagnosis}
- Confidence: ${context.confidence}%
- Cup-to-disc ratio: ${context.cdr}
- IOP: ${context.iop ?? 'not provided'} mmHg
- Mean Deviation: ${context.md ?? 'not provided'} dB
- Grad-CAM attention region: ${context.gradcamRegion ?? 'optic disc'}
- Patient age: ${context.patientAge ?? 'not provided'}
- Eye side: ${context.eyeSide ?? 'not specified'}

Feature Importance Scores:
${Object.entries(context.featureImportance)
  .map(([k, v]) => `- ${k}: ${v.toFixed(1)}%`)
  .join('\n')}`
}

export function ChatPanel({ diagnosisContext, initialExplanation }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initial: ChatMessage[] = []
    if (initialExplanation) {
      initial.push({
        id: 'initial',
        role: 'assistant',
        content: initialExplanation,
        timestamp: new Date(),
      })
    }
    return initial
  })
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Build context for streaming
    setIsStreaming(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT,
          context: buildContextMessage(diagnosisContext),
          history: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage: input.trim(),
        }),
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullContent += chunk
        setStreamingContent(fullContent)
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [input, isStreaming, messages, diagnosisContext])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  return (
    <div className="bg-surface rounded-card border border-border flex flex-col animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">AI Explanation</h3>
          <p className="text-xs text-text-muted">GlaucoSight Clinical Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 400 }}>
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-start gap-3 text-text-muted">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Ask questions about this diagnosis, such as treatment implications or result reliability.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              'flex items-start gap-3',
              msg.role === 'assistant' && 'pr-8'
            )}
          >
            {msg.role === 'user' ? (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            )}
            <div className={clsx(
              'rounded-card px-4 py-3 text-sm leading-relaxed',
              msg.role === 'assistant'
                ? 'bg-primary-light text-text-primary border-l-2 border-l-primary'
                : 'bg-background text-text-primary'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && streamingContent && (
          <div className="flex items-start gap-3 pr-8">
            <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-primary" />
            </div>
            <div className="bg-primary-light text-text-primary rounded-card rounded-tl-none px-4 py-3 text-sm leading-relaxed border-l-2 border-l-primary">
              {streamingContent}
              <span className="animate-stream-cursor inline-block ml-1">▊</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this diagnosis..."
            rows={2}
            disabled={isStreaming}
            className="flex-1 px-3 py-2 rounded-input border border-border bg-background text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-input bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          AI-assisted screening only. Not a substitute for clinical diagnosis.
        </p>
      </form>
    </div>
  )
}