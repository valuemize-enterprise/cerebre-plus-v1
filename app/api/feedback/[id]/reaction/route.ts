import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const segmenter = new Intl.Segmenter();

// Exactly one grapheme, and it must be an emoji or a flag
function isSingleEmoji(value: string) {
  return (
    [...segmenter.segment(value)].length === 1 &&
    /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(value)
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Session client: only used to identify the user
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const emoji = typeof body?.emoji === "string" ? body.emoji : "";

  if (!isSingleEmoji(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  // Make sure the feedback exists (clean 404 instead of a foreign key error)
  const { data: feedback, } = await supabase
    .from("feedback")
    .select("id")
    .eq("id", id)
    // .maybeSingle();
  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("feedback_reactions")
    .select("emoji")
    .eq("feedback_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Same emoji again = remove it
  if (existing?.emoji === emoji) {
    const { error } = await supabase
      .from("feedback_reactions")
      .delete()
      .eq("feedback_id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Could not remove reaction", error);
      return NextResponse.json({ error: "Could not remove reaction" }, { status: 500 });
    }
    return NextResponse.json({ mine: null });
  }

  // Otherwise add or replace
  const { error } = await supabase
    .from("feedback_reactions")
    .upsert({ feedback_id: id, user_id: user.id, emoji });

  if (error) {
    return NextResponse.json({ error: "Could not save reaction" }, { status: 500 });
  }

  return NextResponse.json({ mine: emoji });
}