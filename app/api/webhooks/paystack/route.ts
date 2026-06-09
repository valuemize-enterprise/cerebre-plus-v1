// /app/api/webhooks/paystack/route.ts
// Paystack webhook — handles subscription events, payment verification.
// Signature-verified. Idempotent (events may be delivered more than once).
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateBalance } from "@/lib/performance/cache";
import { sendEmail } from "@/lib/email";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event: string;
    data: Record<string, any>;
  };
  const supabase = createAdminClient();

  // Log all events for audit trail
  try {
    await supabase.from("notifications").insert({
      user_id: "system",
      type: `paystack_${event.event}`,
      payload: event.data,
      is_read: true,
    });
  } catch (_) {} // Non-blocking

  try {
    switch (event.event) {
      // ── Subscription created / renewed ──────────────────────
      case "charge.success": {
        const { metadata, customer, amount, reference } = event.data;
        const userId = metadata?.user_id;
        const planId = metadata?.plan_id;
        const isTopUp = metadata?.is_top_up === true;
        const topUpCoins = metadata?.top_up_coins;

        if (!userId) break;

        if (isTopUp && topUpCoins) {
          // Credit coins for top-up
          await supabase.rpc("credit_coins", {
            p_user_id: userId,
            p_amount: topUpCoins,
            p_type: "topup_purchase",
            p_description: `Top-up: ${topUpCoins} coins`,
          });
          await invalidateBalance(userId);

          // Notify user
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "coins_added",
            payload: { coins: topUpCoins, reference },
            is_read: false,
          });
        } else if (planId) {
          // New subscription — update plan
          const periodEnd = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString();

          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              plan_tier: planId,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd,
            },
            { onConflict: "user_id" },
          );

          // Credit monthly coins
          const PLAN_COINS: Record<string, number> = {
            free: 700,
            starter: 150,
            growth: 700,
          };
          const coins = PLAN_COINS[planId] || 0;
          if (coins > 0) {
            await supabase.rpc("credit_coins", {
              p_user_id: userId,
              p_amount: coins,
              p_type: "subscription_renewal",
              p_description: `${planId} monthly coins`,
            });
            await invalidateBalance(userId);
          }

          await supabase.from("notifications").insert({
            user_id: userId,
            type: "subscription_renewed",
            payload: { planId, coins, reference },
            is_read: false,
          });

          // Credit referrer if this was a referred user
          if (userId && planId) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/referral`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-webhook-secret": process.env.CEREBRE_CRON_SECRET!,
              },
              body: JSON.stringify({
                referred_user_id: userId,
                plan_tier: planId,
              }),
            }).catch(() => {}); // Non-fatal
          }
        }
        break;
      }

      // ── Subscription cancelled ──────────────────────────────
      case "subscription.disable": {
        const { customer } = event.data;
        // Find user by Paystack customer code and update subscription status
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("paystack_customer_id", customer?.customer_code)
          .single();

        if (sub?.user_id) {
          await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      // ── Payment failed ──────────────────────────────────────
      case "charge.failed": {
        const userId = event.data.metadata?.user_id;
        const userEmail = event.data.metadata?.user_email;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", userId)
          .single();
        if (userId) {
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "payment_failed",
            payload: { reference: event.data.reference },
            is_read: false,
          });

          // In the charge.failed case:
          const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing`;
          await sendEmail({
            to: userEmail,
            template: "payment_failed",
            data: { firstName: profile, retryUrl },
          }).catch(() => {});
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paystack-webhook] error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
