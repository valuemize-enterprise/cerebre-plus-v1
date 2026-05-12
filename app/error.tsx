'use client'
// /app/error.tsx — Segment-level error boundary for Next.js App Router
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, MessageCircle, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error:  Error & { digest?: string }
  reset:  () => void
}) {
  useEffect(() => {
    console.error('[page error]', error)
  }, [error])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: '#0B1F3A' }}
    >
      <div className="text-center max-w-sm">
        <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-xl font-black text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-white/50">
          An unexpected error occurred. Your data is safe.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-white/20">Error: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 py-3 text-sm font-semibold text-white hover:bg-white/15"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#E09818] py-3 text-sm font-bold text-[#0B1F3A] hover:opacity-90"
          >
            <Home className="h-4 w-4" /> Go to Dashboard
          </a>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '2348012345678'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/20 bg-[#25D366]/10 py-3 text-sm text-[#25D366]"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp support
          </a>
        </div>
      </div>
    </div>
  )
}
