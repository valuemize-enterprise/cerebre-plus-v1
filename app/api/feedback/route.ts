import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Service-role client: bypasses RLS, server-side only
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PRODUCTS = ["cerebre-plus"];

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: items, error }, { data: ratings }] = await Promise.all([
    admin
      .from("feedback")
      .select("id, rating, comment, created_at")
      .eq("product", "cerebre-plus")
      .order("created_at", { ascending: false })
      .limit(50),
    admin.from("feedback").select("rating").eq("product", "cerebre-plus"),
  ]);

  if (error) {
    console.error("Could not load feedback", error);
    return NextResponse.json({ error: "Could not load feedback" }, { status: 500 });
  }

  const ids = (items ?? []).map((i) => i.id);
  const { data: reactions } = ids.length
    ? await admin
        .from("feedback_reactions")
        .select("feedback_id, emoji, user_id")
        .in("feedback_id", ids)
    : { data: [] };

  const enriched = (items ?? []).map((item) => {
    const counts: Record<string, number> = {};
    let mine: string | null = null;
    for (const r of reactions ?? []) {
      if (r.feedback_id !== item.id) continue;
      counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
      if (r.user_id === user.id) mine = r.emoji;
    }
    return { ...item, reactions: counts, mine };
  });

  const distribution = [5, 4, 3, 2, 1].map(
    (n) => (ratings ?? []).filter((r) => r.rating === n).length,
  );
  const total = ratings?.length ?? 0;
  const avg = total
    ? (ratings ?? []).reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  return NextResponse.json({ items: enriched, stats: { avg, total, distribution } });
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const rating = Number(body?.rating);
  const comment = typeof body?.comment === "string" ? body.comment.trim() : "";
  const product = typeof body?.product === "string" ? body.product : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }
  if (comment.length > 500) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }
  if (!PRODUCTS.includes(product)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const { error } = await admin
    .from("feedback")
    .insert({ product, rating, comment, user_id: user.id });

  if (error) {
    console.error("Could not save feedback", error);
    return NextResponse.json({ error: "Could not save feedback" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}