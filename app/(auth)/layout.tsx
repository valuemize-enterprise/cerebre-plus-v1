import React from 'react'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title:       'Sign In — Cerebre Plus',
  description: "Sign in to Cerebre Plus, Africa's premier AI marketing platform.",
  robots:      { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cerebre-ink min-h-dvh">
      {children}
    </div>
  )
}