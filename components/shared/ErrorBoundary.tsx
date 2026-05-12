'use client'
// ═══════════════════════════════════════════════════════════════
// /components/shared/ErrorBoundary.tsx
// React error boundary with Cerebre-branded UI.
// Renders a recovery page with WhatsApp support link.
// ═══════════════════════════════════════════════════════════════

import React from 'react'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error:    Error | null
}

interface ErrorBoundaryProps {
  children:   React.ReactNode
  fallback?:  React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
    // Log to error tracking if available
    try {
      if (typeof window !== 'undefined' && (window as any).__cerebre_track_error) {
        (window as any).__cerebre_track_error(error, info)
      }
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center rounded-xl border border-red-500/20 bg-red-500/5"
        >
          <AlertTriangle className="mb-4 h-10 w-10 text-red-400" />
          <h2 className="text-base font-bold text-white">Something went wrong</h2>
          <p className="mt-2 max-w-xs text-sm text-white/50">
            This section of the page encountered an error.
          </p>
          {this.state.error && process.env.NODE_ENV !== 'production' && (
            <code className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-red-300 max-w-sm overflow-auto">
              {this.state.error.message}
            </code>
          )}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '2348012345678'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 px-3 py-2 text-xs text-[#25D366]"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Get support
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
