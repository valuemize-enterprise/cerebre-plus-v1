// ═══════════════════════════════════════════════════════════════
// /app/layout.tsx — Root Layout
// ═══════════════════════════════════════════════════════════════
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.cerebreplus.com'),
  title: {
    template: '%s — Cerebre Plus',
    default:  'Cerebre Plus — Africa\'s Premier AI Marketing Platform',
  },
  description:
    '40 AI marketing tools built for Nigerian and African business owners. Get your 90-day marketing strategy, WhatsApp campaigns, ad copy, and more — in seconds.',
  keywords: [
    'AI marketing Nigeria',
    'Nigerian marketing platform',
    'WhatsApp marketing tool',
    'Lagos marketing AI',
    'African business marketing',
    'Cerebre Plus',
  ],
  authors: [{ name: 'Cerebre Media Africa', url: 'https://cerebre.plus' }],
  creator:     'Cerebre Media Africa',
  publisher:   'Cerebre Media Africa',
  openGraph: {
    type:        'website',
    locale:      'en_NG',
    url:         'https://www.cerebreplus.com',
    siteName:    'Cerebre Plus',
    title:       'Cerebre Plus — Africa\'s Premier AI Marketing Platform',
    description: '40 AI tools for Nigerian business owners. Strategy, WhatsApp campaigns, ad copy, and more in seconds.',
    images: [{
      url:    '/og-image.png',
      width:  1200,
      height: 630,
      alt:    'Cerebre Plus',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Cerebre Plus',
    description: 'AI marketing built for Nigerian businesses.',
    images:      ['/og-image.png'],
  },
  icons: {
    icon:  [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor:    '#0B1F3A',
  colorScheme:   'dark',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  5,   // Allow pinch zoom for accessibility
}

// ═══════════════════════════════════════════════════════════════
// /app/layout.tsx — Root Layout (client providers injected here)
// ═══════════════════════════════════════════════════════════════
import './globals.css'
import { ToastProviderWithHook } from '@/components/ui/ModalToastSelect'
import { InstallPWA }            from '@/components/shared/InstallPWA'
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="google-site-verification" content="googlef047e032ad96533b" />
        <meta name="google-site-verification" content="PF2pHIrdk1s8fpVdCIEDHA4pp-ALuhNZD8HamPm_PNg" />
      </head>
      <body className="bg-cerebre-ink text-cerebre-text font-body antialiased min-h-dvh">
         <Suspense fallback={null}>
        <ToastProviderWithHook>
          {children}
          <InstallPWA />
        </ToastProviderWithHook>
        </Suspense>
      </body>
    </html>
  )
}


// ═══════════════════════════════════════════════════════════════
// /next.config.js — Next.js Configuration
// ═══════════════════════════════════════════════════════════════
/** @type {import('next').NextConfig} */
export const nextConfig = {
  // React strict mode for catching side effects
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Inline server component CSS
    optimizeCss: true,
    // Server Actions (stable in Next 14 but keep for future-proofing)
    serverActions: {
      allowedOrigins: [
        'app.cerebre.plus',
        'localhost:3000',
      ],
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      // Cloudflare R2 for user-uploaded logos
      {
        protocol: 'https',
        hostname:  '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname:  'assets.cerebre.plus',
      },
      // Google OAuth profile pictures
      {
        protocol: 'https',
        hostname:  'lh3.googleusercontent.com',
      },
      // Supabase storage fallback
      {
        protocol: 'https',
        hostname:  '*.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/icons/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  // Redirects for clean URLs
  async redirects() {
    return [
      { source: '/app',       destination: '/dashboard', permanent: false },
      { source: '/signin',    destination: '/login',     permanent: true  },
      { source: '/join',      destination: '/signup',    permanent: true  },
    ]
  },

  // Bundle analyser (set ANALYZE=true to use)
  ...(process.env.ANALYZE === 'true' && {
    webpack(config: any) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }))
      return config
    },
  }),
}


