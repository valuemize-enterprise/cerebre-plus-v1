'use client'
// /app/global-error.tsx — Catches errors in root layout
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0B1F3A', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
            Cerebre Plus encountered a critical error
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 24px', maxWidth: 300 }}>
            Something went very wrong. Our team has been notified. Your data is safe.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: '#E09818', color: '#0B1F3A', border: 'none',
                padding: '12px 24px', borderRadius: 12, fontWeight: 700,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="https://cerebreplus.com"
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#ffffff',
                padding: '12px 24px', borderRadius: 12, fontWeight: 600,
                fontSize: 14, textDecoration: 'none',
              }}
            >
              Go to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
