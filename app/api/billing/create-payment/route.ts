// /app/api/billing/create-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// ── Pricing config ─────────────────────────────────────────────
const PLAN_PRICES: Record<string, number> = {
    starter: 20000,
    growth: 80000,
};

const BULK_PACKS: Record<string, { coins: number; price: number }> = {
  pack_50: { coins: 50, price: 1000 },
  pack_100: { coins: 100, price: 1800 },
  pack_250: { coins: 250, price: 4000 },
  pack_500: { coins: 500, price: 7500 },
};

const COIN_UNIT_PRICE = 20; // ₦20 per coin for custom topup

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, planId, packId, coinQty, price } = body;

  const reference = `cp_${user.id.slice(0, 8)}_${Date.now()}`;

  let amount = 0;
  let coins = 0;

  if (type === "plan_upgrade") {
    if (!planId || !PLAN_PRICES[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    amount = PLAN_PRICES[planId];
    coins = 0; // plans don't add coins
  } else if (type === "topup_bulk") {
    if (!packId || !BULK_PACKS[packId]) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }
    amount = BULK_PACKS[packId].price;
    coins = BULK_PACKS[packId].coins;
  } else if (type === "topup_custom") {
    if (!coinQty || coinQty < 1) {
      return NextResponse.json(
        { error: "Invalid coin quantity" },
        { status: 400 },
      );
    }
    amount = price ?? coinQty * COIN_UNIT_PRICE;
    coins = coinQty;
  } else {
    return NextResponse.json(
      { error: "Invalid payment type" },
      { status: 400 },
    );
  }

  const metadata = {
    user_id: user.id,
    type,
    plan_id: planId || null,
    pack_id: packId || null,
    coin_qty: coinQty || null,
    coins,
    reference,
  };

  return NextResponse.json({ reference, amount, coins, metadata });
}

export const dynamic = "force-dynamic";
