// ═══════════════════════════════════════════════════════════════
// /lib/supabase/middleware.ts — Session Refresh Helper
// Used exclusively in /middleware.ts
// ═══════════════════════════════════════════════════════════════
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * Refreshes the Supabase session on every request.
 * Returns the response with updated session cookies and the authenticated user.
 *
 * This MUST be called before any route protection logic so that
 * getUser() reflects the most recent token state.
 */
export async function updateSession(request: NextRequest) {
  // Create a mutable response so we can write Set-Cookie headers
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Write to response (for browser)
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do NOT use getSession() here — it reads from the cookie
  // without verifying the JWT. Always use getUser() in middleware.
  const { data: { user } } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
