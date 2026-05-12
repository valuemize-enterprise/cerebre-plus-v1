// ═══════════════════════════════════════════════════════════════
// next.config.js
// Production configuration for Cerebre Plus.
// PWA via next-pwa, security headers, image optimisation,
// edge runtime for AI routes, aggressive caching.
// ═══════════════════════════════════════════════════════════════

const withPWA = require('next-pwa')({
  dest:            'public',
  register:        true,
  skipWaiting:     true,
  disable:         process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // Static assets — cache first
    {
      urlPattern:  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler:     'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern:  /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
      handler:     'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern:  /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
      handler:     'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern:  /\/_next\/image\?url=.+$/i,
      handler:     'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern:  /\.(?:mp3|mp4|ogg|flac|aac)$/i,
      handler:     'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName:     'static-media-assets',
        expiration:    { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern:  /\.(?:js)$/i,
      handler:     'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern:  /\.(?:css|less)$/i,
      handler:     'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // API routes — network first (fresh data critical)
    {
      urlPattern:  /^https:\/\/[^/]+\/api\/.*/i,
      handler:     'NetworkFirst',
      method:      'GET',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 16, maxAgeSeconds: 5 * 60 },
        cacheableResponse: { statuses: [200] },
      },
    },
    // Dashboard pages — stale while revalidate
    {
      urlPattern:  /^https:\/\/[^/]+\/dashboard.*/i,
      handler:     'NetworkFirst',
      options: {
        cacheName: 'dashboard-pages',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 8, maxAgeSeconds: 60 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ── Image optimisation ──────────────────────────────────────
  images: {
    formats:    ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,  // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',  // Google OAuth avatars
      },
    ],
  },

  // ── Experimental ────────────────────────────────────────────
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', 'mixpanel'],
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
    ],
  },

  // ── Compiler ────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ── Security & performance headers ─────────────────────────
  async headers() {
    const securityHeaders = [
      {
        key:   'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key:   'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key:   'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key:   'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key:   'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key:   'Referrer-Policy',
        value: 'origin-when-cross-origin',
      },
      {
        key:   'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self)',
      },
      {
        key:   'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co https://checkout.paystack.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https: https://lh3.googleusercontent.com",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.upstash.io https://api.paystack.co",
          "frame-src https://checkout.paystack.com",
          "worker-src 'self' blob:",
        ].join('; '),
      },
    ]

    return [
      // Apply security headers to all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache-control for static assets
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ── Redirects ────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source:      '/',
        destination: '/demo',
        permanent:   true,
        has: [{ type: 'header', key: 'x-cerebre-unauthenticated' }],
      },
      {
        source:      '/home',
        destination: '/dashboard',
        permanent:   true,
      },
    ]
  },

  // ── Webpack customisation ────────────────────────────────────
  webpack(config, { isServer }) {
    // Ignore node-specific modules in browser bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:     false,
        net:    false,
        tls:    false,
        crypto: false,
      }
    }
    return config
  },
}

module.exports = withPWA(nextConfig)
