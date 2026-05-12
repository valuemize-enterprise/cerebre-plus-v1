// ═══════════════════════════════════════════════════════════════
// /lib/supabase/client.ts — Browser Supabase Client
// Used in Client Components ('use client')
// ═══════════════════════════════════════════════════════════════
import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

let _client: ReturnType<typeof _createBrowserClient<Database>> | null = null

/**
 * Returns a singleton Supabase browser client.
 * Safe to call multiple times — only one instance is created per page.
 */
export function createBrowserClient() {
  if (_client) return _client
  _client = _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return _client
}

// Convenience alias — the one you import everywhere in client components
export const supabase = createBrowserClient()
