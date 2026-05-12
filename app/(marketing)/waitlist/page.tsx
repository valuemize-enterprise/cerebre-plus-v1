// ═══════════════════════════════════════════════════════════════
// /app/(marketing)/waitlist/page.tsx
// THE most important page in Cerebre Plus.
// Built on all 10 Cerebre Plus laws. Every section is a law.
// This is the conversion engine for the entire product.
// ═══════════════════════════════════════════════════════════════

import type { Metadata }  from 'next'
import WaitlistClient     from './WaitlistClient'

export const metadata: Metadata = {
  title: 'Cerebre Plus — AI Marketing for Nigerian Businesses',
  description: 'Stop spending ₦1.2M/month on a marketing agency that delivers ₦50,000 worth of results. Cerebre Plus gives you 40 AI marketing tools for ₦18,000/month.',
  openGraph: {
    title: 'Cerebre Plus — Africa\'s Premier AI Marketing Platform',
    description: 'Join 1,000+ Nigerian business owners who use AI to market smarter. From ₦18,000/month.',
    images: ['/og-image.png'],
  },
}

export default function WaitlistPage() {
  return <WaitlistClient />
}
