// /app/api/generate/competitor/route.ts
// Streaming competitor intelligence — 40 coins.
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60s"),
  prefix: "cerebre:competitor",
});

const TOOL_COST = 40;

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  const { success: ratePassed } = await ratelimit.limit(user.id);
  if (!ratePassed)
    return new Response(JSON.stringify({ error: "RATE_LIMITED" }), {
      status: 429,
    });

  const body = (await request.json()) as {
    competitors: string[];
    strengths: string;
    weaknesses: string;
    yourEdge: string;
    profile: Record<string, any>;
  };

  const { competitors, strengths, weaknesses, yourEdge, profile } = body;

  if (!competitors?.length) {
    return new Response(
      JSON.stringify({ error: "At least one competitor required" }),
      { status: 400 },
    );
  }

  // Check plan & coins
  const isEnterprise =
    (
      await supabase
        .from("subscriptions")
        .select("plan_tier")
        .eq("user_id", user.id)
        .single()
    )?.data?.plan_tier === "enterprise";
  if (!isEnterprise) {
    const { data: coinData } = await supabase
      .from("coin_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    if ((coinData?.balance ?? 0) < TOOL_COST) {
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_COINS",
          message: `Need ${TOOL_COST} coins to run Competitor Intelligence`,
        }),
        { status: 402 },
      );
    }
  }

  const prompt = `
You are a Nigerian competitive intelligence expert applying Cerebre Plus's 10 laws to help ${profile.business_name || "a Nigerian business"} in ${profile.city || "Nigeria"} understand and outmanoeuvre their competition.

BUSINESS: ${profile.business_name || "Unknown"} | ${profile.industry || "Unknown"} | ${profile.city || "Nigeria"}
UNIQUE ADVANTAGE: ${profile.unique_advantage || "Not specified"}

COMPETITORS NAMED: ${competitors.join(", ")}
WHAT THEY DO WELL (client's assessment): ${strengths || "Not specified"}
GAPS THE CLIENT SEES: ${weaknesses || "Not specified"}
CLIENT'S OWN EDGE: ${yourEdge || "Not specified"}

DISCLAIMER: This analysis is based on the client's assessment + AI marketing pattern recognition. Not live web scraping.

Generate a structured competitive intelligence report:

## 1. COMPETITIVE LANDSCAPE READING
[Your objective reading of the competitive situation based on the information provided — what's actually happening in this market]

## 2. LAW 4 ANALYSIS — The Fear: What You're NOT Doing
[What the named competitors appear to be doing marketing-wise that ${profile.business_name || "this business"} isn't. What is this costing them in specific terms?]

## 3. THE MESSAGING GAP
[Based on what the client says competitors do well — what positioning territory is still available? What can ${profile.business_name || "this business"} claim that would be differentiated and credible?]

## 4. THE ONE MOVE — 30-DAY COMPETITIVE ADVANTAGE
[ONE specific, implementable marketing action in the next 30 days that would directly address the competitive gap. Specific. Nigerian market context. Not vague advice.]

## 5. YOUR UNFAIR ADVANTAGE
[Based on the client's stated edge (${yourEdge || "their unique position"}) — how to weaponise this in marketing using Cerebre Plus's laws]

## 6. IMMEDIATE COPY — The Competitive Positioning Statement
[A ready-to-use positioning statement that positions ${profile.business_name || "this business"} against the competition without naming them. Could be used in bio, ads, or pitches immediately.]

💡 CEREBRE TIP: [The counterintuitive competitive intelligence insight most Nigerian ${profile.industry || ""} businesses miss — the move that looks weak but wins]
`.trim();

  // Pre-insert generation row
  const { data: genRow } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      tool_id: "competitor-snoop",
      tool_name: "Competitor Intelligence",

      inputs: {
        competitors,
        strengths,
        weaknesses,
        yourEdge,
      },

      status: "streaming",
      coin_cost: isEnterprise ? 0 : TOOL_COST,

      output: null,
      tokens_used: null,
      completed_at: null,
    })
    .select("id")
    .single();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
          stream: true,
        });

        let fullText = "";
        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            controller.enqueue(
              encoder.encode(`0:${JSON.stringify(event.delta.text)}\n`),
            );
          }
          if (event.type === "message_stop") {
            if (!isEnterprise) {
              await supabase.rpc("deduct_coins", {
                p_user_id: user.id,
                p_amount: TOOL_COST,
                p_tool_id: "competitor-snoop",
                p_generation_id: genRow?.id ?? null,
              });
            }
            if (genRow?.id) {
              await supabase
                .from("generations")
                .update({
                  output: fullText,
                  status: "complete",
                  completed_at: new Date().toISOString(),
                })
                .eq("id", genRow.id);
            }
            controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `3:${JSON.stringify({ error: "Generation failed" })}\n`,
          ),
        );
        if (genRow?.id)
          await supabase
            .from("generations")
            .update({ status: "failed" })
            .eq("id", genRow.id);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;
