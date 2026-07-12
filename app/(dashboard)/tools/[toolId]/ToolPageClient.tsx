'use client'
// /app/(dashboard)/tools/[toolId]/ToolPageClient.tsx
// Client boundary between the server route and the interactive ToolPage.
// Handles: idea prefill from localStorage, coin balance refresh after generation.

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ToolDefinition } from '@/lib/tools/registry'
import ToolPage from '@/components/tools/ToolPage'
import { useCoinBalance } from '@/app/(dashboard)/DashboardShell'

interface Props {
  tool:        ToolDefinition
  coinBalance: number
}

export default function ToolPageClient({ tool, coinBalance: initialBalance }: Props) {
  const params      = useSearchParams()
  const [balance, setBalance]   = useState(initialBalance)
  const [prefill, setPrefill]   = useState<Record<string, string> | null>(null)
  const { deduct }  = useCoinBalance()

 

  // Load idea prefill from localStorage (set by ideas page "Use This Idea")
  useEffect(() => {
    const fromIdea = params.get('from') === 'idea'
    if (fromIdea) {
      try {
        const stored = localStorage.getItem(`cerebre_idea_prefill_${tool.id}`)
        if (stored) {
          setPrefill(JSON.parse(stored))
          localStorage.removeItem(`cerebre_idea_prefill_${tool.id}`)
        }
      } catch {}
    }
  }, [tool.id, params])

  const handleCoinDeducted = useCallback((cost: number) => {
    setBalance((prev) => Math.max(0, prev - cost))
    deduct(cost)
    // Track in localStorage for offline display
    try {
      localStorage.setItem('cerebre_last_coin_update', String(Date.now()))
    } catch {}
  }, [deduct])



  return (
    <ToolPage
      tool={tool}
      coinBalance={balance}
      prefill={prefill}
      onCoinDeducted={handleCoinDeducted}
    />
  )
}
