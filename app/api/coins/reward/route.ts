// /app/api/coins/reward/route.ts
// Awards bonus coins for specific user actions (e.g. PWA install).
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const ALLOWED_REWARDS: Record<string, number> = {
  pwa_install: 20,
  profile_complete: 10,
  first_share: 5,
  onboarding_complete: 70,
};

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason } = (await request.json()) as { reason: string };

  const amount = ALLOWED_REWARDS[reason];
  if (!amount) {
    return NextResponse.json(
      { error: "Invalid reward reason" },
      { status: 400 },
    );
  }

  // Check if already claimed
  const { data: existing, error: checkError } = await supabase
    .from("coin_transactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", `reward_${reason}`)
    .single();

  // 👇 log this
  // console.log("[coin reward] existing check:", { existing, checkError });

  if (existing) {
    return NextResponse.json({ already_claimed: true });
  }

  // Credit coins
  const { error } = await supabase.rpc("credit_coins", {
    p_user_id: user.id,
    p_amount: amount,
    p_type: `reward_${reason}`,
    p_description: `Bonus for: ${reason.replace(/_/g, " ")}`,
  });

  // 👇 log the full error object
  if (error) {
    console.error("[coin reward] rpc error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json(
      {
        error: "Could not award coins",
        detail: error.message, // 👈 surface it in the response too
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ awarded: amount, reason });
}

export const dynamic = "force-dynamic";
