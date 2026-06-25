// /app/api/onboarding/complete/route.ts
// Atomically saves onboarding data + awards reward coins.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const ALLOWED_REWARDS: Record<string, number> = {
  onboarding_complete: 70,
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    business_name, industry, city, years_in_business,
    whatsapp, description, target_customer, unique_advantage,
    social_proof, price_range, primary_cta, brand_voice,
    marketing_challenges, primary_challenge, target_customers,
  } = body

  // 1. Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      business_name: business_name?.trim(),
      industry,
      city: city?.trim(),
      years_in_business: years_in_business ? parseInt(years_in_business) : null,
      whatsapp: whatsapp?.trim(),
      description: description?.trim(),
      target_customer: target_customer?.trim(),
      unique_advantage: unique_advantage?.trim(),
      social_proof: social_proof?.trim(),
      price_range: price_range?.trim(),
      primary_cta: primary_cta?.trim(),
      brand_voice,
      marketing_challenges,
      primary_goal: null,
      primary_challenge: primary_challenge || marketing_challenges?.[0] || null,
      target_customers: target_customers?.trim(),
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 2. Award coins (skip if already claimed)
  const { data: existing } = await supabase
    .from('coin_transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'reward_onboarding_complete')
    .single()

  if (!existing) {
    const amount = ALLOWED_REWARDS.onboarding_complete
    const { error: coinError } = await supabase.rpc('credit_coins', {
      p_user_id: user.id,
      p_amount: amount,
      p_type: 'reward_onboarding_complete',
      p_description: 'Bonus for: onboarding complete',
    })
    if (coinError) {
      console.error('[onboarding/complete] coin error:', coinError)
    }
  }

  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
