// ═══════════════════════════════════════════════════════════════
// /app/(auth)/callback/route.ts — Supabase OAuth Callback
// Handles: Google OAuth redirect, email verification links,
//          password reset links, magic link sign-ins.
// ═══════════════════════════════════════════════════════════════
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const next = searchParams.get("next");
  const finalRedirect = next ?? redirect;

  if (code) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    const user = data?.user;

    if (!error && user) {
      // ✅ Upsert profile — prevents profile_missing loop
      const {data: profile, error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (profileError) {
        console.error(
          "[auth/callback] Profile upsert error:",
          profileError.message,
        );
        // Don't block login over a profile error — still redirect
      }

      // After successful user creation, provision their free plan
      // provision_free_plan is a custom RPC not present in the generated rpc types
      // cast to any to avoid TypeScript error about unknown function name
      await (supabase as any).rpc("provision_free_plan", {
        p_user_id: user.id,
      });

      const profileData = Array.isArray(profile)
        ? profile[0]
        : (profile as { email?: string; full_name?: string } | null);

      // After provision_free_plan():
      await sendEmail({
        to: profileData?.email ?? user.email ?? "",
        template: "welcome",
        data: {
          firstName:
            profileData?.full_name ||
            user.user_metadata?.full_name ||
            "there",
        },
      }).catch(() => {});
      // Record referral if ?ref= was in the URL
      const refCode = searchParams.get("ref");
      if (refCode && user) {
        await (supabase as any)
          .rpc("record_referral", {
            p_referred_user_id: user.id,
            p_referred_email: user.email,
            p_referral_code: refCode,
          })
          .catch(() => {}); // Non-fatal — referral fails silently
      }

      const destination = finalRedirect.startsWith("/")
        ? `${origin}${finalRedirect}`
        : finalRedirect;

      return NextResponse.redirect(destination, { status: 303 });
    }

    console.error("[auth/callback] Code exchange error:", error?.message);
  }

  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", "auth_failed");
  return NextResponse.redirect(errorUrl, { status: 303 });
}
