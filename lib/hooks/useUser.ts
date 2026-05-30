// ═══════════════════════════════════════════════════════════════
// /lib/hooks/useUser.ts
// Returns the current authenticated user, their profile, and auth state.
// Syncs with Zustand for cross-component access.
// ═══════════════════════════════════════════════════════════════
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

// ─────────────────────────────────────────────────────────────
// ADMIN EMAIL CHECK (client-safe — just checks the env var)
// ─────────────────────────────────────────────────────────────

function checkIsAdmin(email: string | undefined): boolean {
  if (!email) return false
  // SECURITY NOTE: This is a UI-only hint (shows/hides admin nav link).
  // Real admin authorization is enforced server-side in /app/admin/page.tsx
  // using the CEREBRE_ADMIN_EMAILS server env var (NOT NEXT_PUBLIC).
  // Do NOT put CEREBRE_ADMIN_EMAILS in NEXT_PUBLIC_ — only use NEXT_PUBLIC_ADMIN_EMAILS
  // for this non-sensitive UI hint if you want the admin link to appear in the nav.
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

// ─────────────────────────────────────────────────────────────
// HOOK RETURN TYPE
// ─────────────────────────────────────────────────────────────

export interface UseUserReturn {
  user:     User | null
  profile:  Profile | null
  loading:  boolean
  isAdmin:  boolean
  signOut:  () => Promise<void>
  refetch:  () => Promise<void>
}

// ─────────────────────────────────────────────────────────────
// useUser
// ─────────────────────────────────────────────────────────────

export function useUser(): UseUserReturn {
  const supabase = createBrowserClient()
  const router   = useRouter()

  const [user,    setUser]    = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState(true)


  const fetchProfile = React.useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      // Snake_case → camelCase mapping (simplified — use a mapper in production)
      setProfile(data as unknown as Profile)
    }
  }, [supabase])

  const fetchUser = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) await fetchProfile(u.id)
    } catch {
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchProfile])

  // Initial fetch
  React.useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Listen for auth state changes (login, logout, token refresh)
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          if (session?.user) await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      },
    )
    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/login')
    router.refresh()
  }, [supabase, router])

  return {
    user,
    profile,
    loading,
    isAdmin: checkIsAdmin(user?.email),
    signOut,
    refetch: fetchUser,
  }
}

// ═══════════════════════════════════════════════════════════════
// /lib/hooks/useProfile.ts
// Full CRUD operations on the user's profile with optimistic updates.
// ═══════════════════════════════════════════════════════════════

import type { ProfileUpdatePayload } from '@/types'

export interface UseProfileReturn {
  profile:           Profile | null
  loading:           boolean
  saving:            boolean
  error:             string | null
  completeness:      number
  update:            (data: ProfileUpdatePayload) => Promise<boolean>
  uploadLogo:        (file: File) => Promise<string | null>
  refetch:           () => Promise<void>
  clearError:        () => void
}

export function useProfile(initialProfile?: Profile | null): UseProfileReturn {
  const supabase = createBrowserClient()

  const [profile,  setProfile]  = React.useState<Profile | null>(initialProfile ?? null)
  const [loading,  setLoading]  = React.useState(!initialProfile)
  const [saving,   setSaving]   = React.useState(false)
  const [error,    setError]    = React.useState<string | null>(null)

  // Fetch profile from DB
  const fetchProfile = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (dbError) throw dbError
      setProfile(data as unknown as Profile)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  React.useEffect(() => {
    if (!initialProfile) fetchProfile()
  }, [initialProfile, fetchProfile])

  // Optimistic update
  const update = React.useCallback(
    async (data: ProfileUpdatePayload): Promise<boolean> => {
      setSaving(true)
      setError(null)

      // Optimistic update — apply immediately
      const previous = profile
      setProfile((p) => p ? { ...p, ...data } : null)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Convert camelCase → snake_case for DB
        const dbPayload = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [
            k.replace(/([A-Z])/g, '_$1').toLowerCase(),
            v,
          ]),
        )

        const { error: dbError } = await supabase
          .from('profiles')
          .update({ ...dbPayload, updated_at: new Date().toISOString() })
          .eq('id', user.id)

        if (dbError) throw dbError

        // Recalculate completeness score server-side
        await supabase.rpc('get_profile_completeness', { p_user_id: user.id })

        // Refetch to get server-computed fields
        await fetchProfile()
        return true
      } catch (e: any) {
        // Rollback optimistic update
        setProfile(previous)
        setError(e.message ?? 'Failed to save profile')
        return false
      } finally {
        setSaving(false)
      }
    },
    [supabase, profile, fetchProfile],
  )

  // Upload logo to Cloudflare R2 via our API route
  const uploadLogo = React.useCallback(async (file: File): Promise<string | null> => {
    setSaving(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/profile/upload-logo', {
        method: 'POST',
        body:   formData,
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Upload failed')
      }

      const { url } = await res.json()

      // Save logo URL to profile
      await update({ logoUrl: url } as any)

      return url
    } catch (e: any) {
      setError(e.message ?? 'Failed to upload logo')
      return null
    } finally {
      setSaving(false)
    }
  }, [update])

  const completeness = React.useMemo(() => {
    return (profile as any)?.profile_completeness_score ?? 0
  }, [profile])

  return {
    profile,
    loading,
    saving,
    error,
    completeness,
    update,
    uploadLogo,
    refetch: fetchProfile,
    clearError: () => setError(null),
  }
}
