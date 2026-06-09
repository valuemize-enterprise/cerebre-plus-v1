// /app/api/admin/users/route.ts
// GET — paginated user list with search + plan filter + CSV export

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, unauthorized, forbidden } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request);
  if (!session) return unauthorized();
  if (!hasPermission(session.role, "view_users")) return forbidden();

  const admin = createAdminClient();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20"));
  const search = url.searchParams.get("search") || "";
  const plan = url.searchParams.get("plan") || "";
  const filter = url.searchParams.get("filter") || "";
  const isCSV = url.searchParams.get("export") === "csv";

  const offset = (page - 1) * limit;

  // Build profile query
  let q = admin
    .from("profiles")
    .select(
      `
      id, email, full_name, business_name, industry, city, created_at,
      subscriptions!left(plan_tier, status, current_period_end, free_expires_at),
      coin_balances!left(balance),
      plan_tier
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (search) {
    q = q.or(
      `email.ilike.%${search}%,full_name.ilike.%${search}%`,
    );
  }
  if (plan && plan !== 'all') {
  q = q.eq('plan_tier', plan)  // ← direct column on profiles
}
  if (filter === "expiring") {
    const in7 = new Date(Date.now() + 7 * 86400_000).toISOString();
    q = q
      .lte("subscriptions.free_expires_at", in7)
      .gte("subscriptions.free_expires_at", new Date().toISOString());
  }

  if (!isCSV) q = q.range(offset, offset + limit - 1);

  const { data, count, error } = await q;
  //console.log("Users query error:", error);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const users = (data || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    business_name: u.business_name,
    industry: u.industry,
    city: u.city,
    created_at: u.created_at,
    plan_tier: u.plan_tier || "free",
    subscription_tier: u.subscriptions?.plan_tier || "free",
    sub_status: u.subscriptions?.status,
    coin_balance: u.coin_balances?.balance || 0,
    expires_at:
      u.subscriptions?.current_period_end ||
      u.subscriptions?.[0]?.free_expires_at,
  }));

  if (isCSV) {
    const cols = [
      "email",
      "full_name",
      "business_name",
      "subscription_tier",
      "coin_balance",
      "created_at",
      "plan_tier",
    ];
    const rows = users.map((u) =>
      cols.map((c) => JSON.stringify((u as any)[c] ?? "")).join(","),
    );
    const csv = [cols.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment;filename=users-${Date.now()}.csv`,
      },
    });
  }

  return NextResponse.json({ users, total: count ?? 0, page, limit });
}

export const dynamic = "force-dynamic";
