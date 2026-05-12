// ═══════════════════════════════════════════════════════════════
// /lib/performance/low-bandwidth.ts
// Detects 2G/3G connections on Nigerian Android devices.
// Exports a hook and utility for toggling animations and assets.
// ═══════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect } from 'react'

export type NetworkQuality = 'fast' | 'slow' | 'unknown'

export interface BandwidthInfo {
  quality:       NetworkQuality
  is3GOrSlower:  boolean
  effectiveType: string | null
  rtt:           number | null
  downlink:      number | null
}

// ─────────────────────────────────────────────────────────────
// DETECT NETWORK QUALITY
// ─────────────────────────────────────────────────────────────

export function detectNetworkQuality(): BandwidthInfo {
  if (typeof window === 'undefined') {
    return { quality: 'unknown', is3GOrSlower: false, effectiveType: null, rtt: null, downlink: null }
  }

  const connection = (navigator as any).connection
    || (navigator as any).mozConnection
    || (navigator as any).webkitConnection

  if (!connection) {
    return { quality: 'unknown', is3GOrSlower: false, effectiveType: null, rtt: null, downlink: null }
  }

  const effectiveType = connection.effectiveType as string | null
  const rtt           = connection.rtt     as number | null
  const downlink      = connection.downlink as number | null

  // Classify: 2G/slow-2G/3G = slow. 4G+ = fast.
  const is3GOrSlower = (
    effectiveType === '2g'       ||
    effectiveType === 'slow-2g'  ||
    effectiveType === '3g'       ||
    (rtt    !== null && rtt    > 400)   ||   // > 400ms RTT
    (downlink !== null && downlink < 1.5)    // < 1.5 Mbps
  )

  return {
    quality:      is3GOrSlower ? 'slow' : 'fast',
    is3GOrSlower,
    effectiveType,
    rtt,
    downlink,
  }
}

// ─────────────────────────────────────────────────────────────
// REACT HOOK
// ─────────────────────────────────────────────────────────────

export function useBandwidth(): BandwidthInfo {
  const [info, setInfo] = useState<BandwidthInfo>(() => detectNetworkQuality())

  useEffect(() => {
    const connection = (navigator as any).connection
      || (navigator as any).mozConnection
      || (navigator as any).webkitConnection

    if (!connection) return

    const handleChange = () => setInfo(detectNetworkQuality())
    connection.addEventListener('change', handleChange)
    return () => connection.removeEventListener('change', handleChange)
  }, [])

  return info
}

// ─────────────────────────────────────────────────────────────
// ANIMATION CONFIG
// Returns Framer Motion config optimised for connection quality
// ─────────────────────────────────────────────────────────────

export function getMotionConfig(quality: NetworkQuality) {
  if (quality === 'slow') {
    return {
      // Disable animations on slow connections
      initial:    { opacity: 1 },
      animate:    { opacity: 1 },
      transition: { duration: 0 },
    }
  }
  return {
    initial:    { opacity: 0, y: 8 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
  }
}

// ─────────────────────────────────────────────────────────────
// SAVE DATA DETECTION
// ─────────────────────────────────────────────────────────────

export function isSaveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false
  return Boolean((navigator as any).connection?.saveData)
}

// ─────────────────────────────────────────────────────────────
// APPLY GLOBAL LOW-BANDWIDTH OPTIMISATIONS
// Call once in the root layout
// ─────────────────────────────────────────────────────────────

export function applyLowBandwidthOptimisations() {
  if (typeof document === 'undefined') return

  const { is3GOrSlower } = detectNetworkQuality()
  const saveData         = isSaveDataEnabled()

  if (is3GOrSlower || saveData) {
    // Disable CSS animations platform-wide
    document.documentElement.classList.add('low-bandwidth')

    // Add inline style to kill transitions
    const style = document.createElement('style')
    style.setAttribute('data-cerebre', 'low-bandwidth')
    style.textContent = `
      .low-bandwidth * {
        animation-duration:    0.01ms !important;
        animation-delay:       0.01ms !important;
        transition-duration:   0.01ms !important;
        transition-delay:      0.01ms !important;
      }
      .low-bandwidth .motion-safe\\:animate-pulse { animation: none !important; }
      .low-bandwidth video { display: none !important; }
      .low-bandwidth [data-non-critical] { display: none !important; }
    `
    document.head.appendChild(style)
  }
}
