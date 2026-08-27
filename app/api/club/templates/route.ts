// /app/api/club/templates/route.ts
// GET  — list published templates (all authenticated users)
// POST — record a download (awards 2 points)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabase
    .from("club_templates" as any)
    .select(
      "id, title, description, category, file_url, thumbnail_url, week_label, download_count, created_at",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(request: NextRequest) {
  // Record a download and award 2 points
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { templateId } = await request.json();
  if (!templateId)
    return NextResponse.json({ error: "templateId required" }, { status: 400 });

  const admin = createAdminClient();

  // Increment download count
  const { error: dataError } = await admin.rpc(
    "increment_template_downloads" as any,
    { p_template_id: templateId },
  );
  // Fallback if RPC doesn't exist yet
  if (dataError) {
    admin
      .from("club_templates" as any)
      .update({ download_count: 1 }) // Will be handled by trigger
      .eq("id", templateId);
  }

  // Award 2 points (no coins for template downloads)
  await admin.rpc("award_club_points" as any, {
    p_user_id: user.id,
    p_points: 2,
    p_action: "template_download",
    p_reference: templateId,
    p_notes: "Downloaded a club template",
    p_coins: 0,
  });

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
