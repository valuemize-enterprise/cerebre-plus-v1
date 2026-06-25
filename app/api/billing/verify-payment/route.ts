// /app/api/billing/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { invalidateBalance } from "@/lib/performance/cache";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reference, planId, isTopUp, topUpCoins } = await request.json();

  // Verify with Paystack
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    },
  );
  const { data: txData } = await verifyRes.json();

  if (txData?.status !== "success") {
    return NextResponse.json(
      { success: false, error: "Payment not verified" },
      { status: 400 },
    );
  }
  const PLAN_PRICES: Record<string, number> = {
    starter: 20000,
    growth: 80000,
  };

  // Idempotency: check if we've already processed this reference
  const { data: existing } = await supabase
    .from("coin_transactions")
    .select("id")
    .eq("description", `paystack:${reference}`)
    .single();

  if (existing)
    return NextResponse.json({ success: true, message: "Already processed" });

  if (isTopUp && topUpCoins) {
    const { error: creditError } = await supabase.rpc("credit_coins", {
      p_user_id: user.id,
      p_amount: topUpCoins,
      p_type: "topup",
      p_description: `paystack:${reference}`,
    });
    if (creditError) {
      console.error("[verify-payment] credit_coins RPC failed:", creditError);
      return NextResponse.json(
        { success: false, error: "Failed to credit coins. Contact support." },
        { status: 500 },
      );
    }
    await invalidateBalance(user.id);
    return NextResponse.json({ success: true, coins_added: topUpCoins });
  }

  // Subscription upgrade
  const PLAN_COINS: Record<string, number> = {
    free: 700,
    starter: 150,
    growth: 700,
  };
  const coins = PLAN_COINS[planId] || 0;
  const periodEnd = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  //console.log("6. Plan insert:", { planId, coins, periodEnd, userId: user.id });

  if (!planId || coins === 0) {
    return NextResponse.json(
      { success: false, error: `Invalid planId: ${planId}` },
      { status: 400 },
    );
  }
  const [subResult, coinResult, profileResult] = await Promise.all([
    supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan_tier: planId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        coins_per_period: coins,
        price_naira: PLAN_PRICES[planId], // ← add this
      },
      { onConflict: "user_id" },
    ),
    supabase.rpc("credit_coins", {
      p_user_id: user.id,
      p_amount: coins,
      p_type: "allocation", // ← subscription coins
      p_description: `paystack:${reference}`,
    }),
    supabase
      .from("profiles")
      .update({ plan_tier: planId }) // ← add this
      .eq("id", user.id),
  ]);

  // console.log("Profile error:", profileResult.error);
  // console.log("Sub upsert:", subResult.error);
  // console.log("Coin credit:", coinResult.error);

  // After activate_annual_plan() succeeds:
  const isGrowth = planId === "growth";
  // fetch profile to get first name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (user.email) {
    await sendEmail({
      to: user.email,
      template: isGrowth ? "sme_club_welcome" : "upgrade_confirm",
      data: {
        firstName: (profile as { full_name?: string } | null)?.full_name ?? "",
        planName: planId === "growth" ? "Growth" : "Starter",
        coins,
        validUntil: new Date(Date.now() + 365 * 86400000).toLocaleDateString(
          "en-NG",
          { day: "numeric", month: "long", year: "numeric" },
        ),
      },
    }).catch(() => {});
  }

  await invalidateBalance(user.id);
  return NextResponse.json({ success: true, plan: planId, coins_added: coins });
}

export const dynamic = "force-dynamic";
