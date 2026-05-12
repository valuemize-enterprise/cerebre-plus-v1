// /app/not-found.tsx — Branded 404 page
import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ background: '#0B1F3A' }}
    >
      <div className="mb-6">
        <span className="text-8xl font-black" style={{ color: '#E09818' }}>404</span>
      </div>
      <h1 className="text-2xl font-black text-white">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-white/50">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back to your marketing.
      </p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/dashboard"
          className="flex items-center justify-center rounded-xl bg-[#E09818] py-3.5 text-sm font-bold text-[#0B1F3A] hover:opacity-90"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/tools"
          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          Browse 40 Tools
        </Link>
      </div>
      <div className="mt-12 flex items-center gap-1.5">
        <span className="text-sm font-black text-white">Cerebre</span>
        <span className="text-sm font-black" style={{ color: '#E09818' }}>Plus</span>
      </div>
    </div>
  )
}
