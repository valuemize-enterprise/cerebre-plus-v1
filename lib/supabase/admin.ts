// ═══════════════════════════════════════════════════════════════
// /lib/supabase/admin.ts — Service Role Admin Client
// NEVER import this in client components or expose to browser.
// Used only in: API Routes, Server Actions, cron jobs.
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Note: SUPABASE_SERVICE_ROLE_KEY must be set in production environment.
// If missing, operations will fail at runtime with a Supabase auth error.
// During build time, this variable may not be present — that is expected.

/**
 * Admin client with service role key.
 * Bypasses Row Level Security — use with extreme caution.
 * Only for: creating records on behalf of users, webhook handlers,
 * admin operations, cron jobs.
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
    },
  },
)

// ─────────────────────────────────────────────────────────────
// ADMIN HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Verifies a Paystack webhook signature.
 * Called from /api/webhooks/paystack/route.ts
 */
export async function verifyPaystackWebhook(
  signature: string,
  rawBody:   string,
): Promise<boolean> {
  const crypto = await import('crypto')
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')
  return hash === signature
}

/**
 * Grants coins to a user using the admin client (bypasses RLS).
 */
export async function adminCreditCoins(
  userId:      string,
  amount:      number,
  type:        string,
  description: string,
  reference?:  string,
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const { data, error } = await supabaseAdmin.rpc('credit_coins', {
    p_user_id:    userId,
    p_amount:     amount,
    p_type:       type,
    p_description: description,
    p_reference:  reference
  } as any)

  if (error) return { success: false, newBalance: 0, error: error.message }

  const { data: balance } = await supabaseAdmin
    .from('coin_balances')
    .select('balance')
    .eq('user_id', userId)
    .single()

  return { success: true, newBalance: balance?.balance ?? 0 }
}

/**
 * Creates a notification for a user (admin bypass RLS).
 */
export async function adminCreateNotification(
  userId:       string,
  type:         string,
  title:        string,
  message:      string,
  actionUrl?:   string,
  actionLabel?: string,
) {
  return supabaseAdmin
  .from('notifications')
  .insert({
    user_id: userId,
    type,

    payload: {
      title,
      message,
      action_url: actionUrl ?? null,
      action_label: actionLabel ?? null,
    },

    is_read: false,
  })
}

/**
 * Gets a user's full profile with subscription + balance (admin).
 */
export async function adminGetUserFull(userId: string) {
  const [profileRes, balanceRes, subRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
    supabaseAdmin.from('coin_balances').select('*').eq('user_id', userId).single(),
    supabaseAdmin.from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  return {
    profile:      profileRes.data,
    balance:      balanceRes.data,
    subscription: subRes.data,
  }
}

/**
 * Returns the admin Supabase client.
 * Alias of supabaseAdmin for routes that prefer function-call style.
 */
export function createAdminClient() {
  return supabaseAdmin
}
