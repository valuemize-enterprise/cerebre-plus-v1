// ═══════════════════════════════════════════════════════════════
// /app/(auth)/callback/route.ts — Supabase OAuth Callback
// Handles: Google OAuth redirect, email verification links,
//          password reset links, magic link sign-ins.
// ═══════════════════════════════════════════════════════════════
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const next = searchParams.get("next");
  const finalRedirect = next ?? redirect;

  try {
    if (code) {
      const supabase = await createServerClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      const user = data?.user;

      if (!error && user && user.email) {
        // ── Email-conflict check ──────────────────────────────────
        // If this email already belongs to a different auth user,
        // merge: delete the duplicate and sign in the original.
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id, email, full_name")
          .eq("email", user.email)
          .neq("id", user.id)
          .maybeSingle();

        if (existingProfile) {
          const existingProfileAny = existingProfile as any;
          // This is the "signed up with email/password, now logging in with
          // Google using the same email" case. We don't want two separate
          // accounts — delete the freshly-created Google auth user + profile,
          // then sign the user into their ORIGINAL account via magic link and
          // send them straight to `finalRedirect` (dashboard by default).
          console.log(
            "[auth/callback] Email conflict — merging Google login into existing password account:",
            existingProfileAny.id,
          );

          // 1. Delete the duplicate profile row (if the trigger created one)
          const { error: deleteProfileError } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", user.id);

          if (deleteProfileError) {
            console.error(
              "[auth/callback] Failed to delete duplicate profile:",
              deleteProfileError.message,
            );
          }

          // 2. Delete the duplicate auth user
          const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
            user.id,
          );

          if (deleteUserError) {
            console.error(
              "[auth/callback] Failed to delete duplicate auth user:",
              deleteUserError.message,
            );
          }

          // 3. Generate a magic link for the original user
          const destination = finalRedirect.startsWith("/")
            ? `${origin}${finalRedirect}`
            : finalRedirect;

          const { data: linkData, error: linkError } =
            await supabaseAdmin.auth.admin.generateLink({
              type: "magiclink",
              email: existingProfileAny.email,
              options: { redirectTo: destination },
            });

          if (linkError || !linkData?.properties?.action_link) {
            console.error(
              "[auth/callback] generateLink failed:",
              linkError?.message,
            );
            const errUrl = new URL("/login", origin);
            errUrl.searchParams.set("error", "merge_failed");
            return NextResponse.redirect(errUrl, { status: 303 });
          }

          // 4. Redirect to the magic-link URL — Supabase processes it,
          //    creates a session for the original user, and redirects back.
          return NextResponse.redirect(linkData.properties.action_link, {
            status: 303,
          });
        }

        // ── Normal flow (no conflict) ─────────────────────────────
        // ✅ Upsert profile — prevents profile_missing loop
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name ?? null,
              avatar_url: user.user_metadata?.avatar_url ?? null,
              updated_at: new Date().toISOString(),
            } as any,
            { onConflict: "id" },
          )
          .select() as any;

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
        // NOTE: supabase.rpc() returns a thenable (PostgrestFilterBuilder), not a
        // real Promise — it has no .catch()/.finally(). Destructure { error } instead.
        const { error: provisionError } = await (supabase as any).rpc(
          "provision_free_plan",
          { p_user_id: user.id },
        );

        if (provisionError) {
          // Safe to ignore on re-login (already provisioned) — just log it
          console.error(
            "[auth/callback] provision_free_plan failed:",
            provisionError.message,
          );
        }

        const profileData = Array.isArray(profile)
          ? profile[0]
          : (profile as { email?: string; full_name?: string } | null);

        // After provision_free_plan():
        try {
          await sendEmail({
            to: profileData?.email ?? user.email ?? "",
            template: "welcome",
            data: {
              firstName:
                profileData?.full_name ||
                user.user_metadata?.full_name ||
                "there",
            },
          });
        } catch (emailErr) {
          console.error("[auth/callback] sendEmail failed:", emailErr);
        }

        // Record referral if ?ref= was in the URL
        const refCode = searchParams.get("ref");
        if (refCode && user) {
          const { error: referralError } = await (supabase as any).rpc(
            "record_referral",
            {
              p_referred_user_id: user.id,
              p_referred_email: user.email,
              p_referral_code: refCode,
            },
          );

          if (referralError) {
            // Non-fatal — referral fails silently to the user, but log it
            console.error(
              "[auth/callback] record_referral failed:",
              referralError.message,
            );
          }
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
  } catch (err) {
    console.error("[auth/callback] UNCAUGHT ERROR:", err);
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(errorUrl, { status: 303 });
  }
}