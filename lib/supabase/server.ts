// ═══════════════════════════════════════════════════════════════
// /lib/supabase/server.ts — Server-Side Supabase Client
// Used in Server Components, Route Handlers, Server Actions
// ═══════════════════════════════════════════════════════════════
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

/**
 * Creates a Supabase client that reads/writes cookies via next/headers.
 * Must be called inside a Server Component, Route Handler, or Server Action.
 * Creates a fresh instance per request (Next.js server components are per-request).
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — cookie writes are not supported
            // in SC context; middleware handles session refresh instead.
          }
        },
      },
    },
  )
}

/**
 * Gets the currently authenticated user from the server.
 * Returns null if no session exists.
 */
export async function getServerUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

/**
 * Gets the user's profile from the database.
 * Returns null if no session or no profile found.
 */
export async function getServerProfile(userId?: string) {
  const supabase = await createServerClient()

  const id = userId ?? (await getServerUser())?.id
  if (!id) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

/**
 * Gets the user's coin balance from the database.
 */
export async function getServerCoinBalance(userId?: string) {
  const supabase = await createServerClient()

  const id = userId ?? (await getServerUser())?.id
  if (!id) return null

  const { data, error } = await supabase
    .from('coin_balances')
    .select('*')
    .eq('user_id', id)
    .single()

  if (error) return null
  return data
}
