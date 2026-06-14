// ═══════════════════════════════════════════════════════════════
// /middleware.ts — Cerebre Plus Edge Middleware
// Runs on every request before rendering.
// Responsibilities:
//   1. Refresh Supabase session tokens
//   2. Protect /dashboard/* and /tools/* routes
//   3. Protect /admin/* (require CEREBRE_ADMIN_EMAILS)
//   4. Redirect authenticated users away from auth pages
//   5. Track page views in Mixpanel (server-side, fire-and-forget)
// ═══════════════════════════════════════════════════════════════
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { supabase } from "./lib/supabase/client";

// ─────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS
// ─────────────────────────────────────────────────────────────

/** Routes that require authentication */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/tools",
  "/library",
  "/profile",
  "/billing",
  "/referral",
  "/calendar",
  "/insights",
  "/settings",
  "/notifications",
  "/onboarding",
  "/help",
  "/feedback",
  "/share",
];

/** Routes that require admin access */
const ADMIN_PREFIXES = ["/admin"];

/** Auth pages — authenticated users should not see these */
const AUTH_PAGES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
];

/** Routes that are always public */
const PUBLIC_PREFIXES = [
  "/",
  "/pricing",
  "/features",
  "/about",
  "/blog",
  "/waitlist",
  "/shared", // Public share view pages
  "/demo", // Public demo page
  "/api", // All API routes handle their own auth
  "/_next", // Next.js internals
  "/favicon",
  "/robots",
  "/sitemap",
  "/manifest",
  "/icons",
  "/images",
  "/sw.js", // Service worker
];

// ─────────────────────────────────────────────────────────────
// ADMIN EMAIL LIST
// ─────────────────────────────────────────────────────────────

function getAdminEmails(): string[] {
  const raw = process.env.CEREBRE_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────
// MIXPANEL SERVER-SIDE PAGE VIEW
// ─────────────────────────────────────────────────────────────

async function trackPageView(
  userId: string | null,
  pathname: string,
  request: NextRequest,
) {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token || !userId) return;

  const payload = {
    event: "$pageview",
    properties: {
      token,
      distinct_id: userId,
      $current_url: `${process.env.NEXT_PUBLIC_APP_URL}${pathname}`,
      mp_lib: "node",
      time: Math.floor(Date.now() / 1000),
      $user_agent: request.headers.get("user-agent") ?? "",
    },
  };

  // Fire-and-forget — don't await, never block the request
  fetch("https://api.mixpanel.com/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([payload]),
  }).catch(() => {}); // Silently swallow errors
}

// ─────────────────────────────────────────────────────────────
// PATH HELPERS
// ─────────────────────────────────────────────────────────────

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE FUNCTION
// ─────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always skip for static assets + Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".woff2") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // ── 1. Refresh session (MUST happen first) ─────────────────
  const { supabaseResponse, user } = await updateSession(request);

  // ── 2. Fire-and-forget page view tracking ──────────────────
  trackPageView(user?.id ?? null, pathname, request);

  // ── 3. Admin route guard ───────────────────────────────────
  // ── Admin console protection ──────────────────────────
  if (
    pathname.startsWith("/cerebre-admin") &&
    !pathname.startsWith("/cerebre-admin/login")
  ) {
    const cookieHeader = request.headers.get("cookie") || "";
    const hasSession = cookieHeader.includes("admin_session=");
    if (!hasSession) {
      return NextResponse.redirect(
        new URL("/cerebre-admin/login", request.url),
      );
    }
    // Full session validation happens in the layout and API routes
  }

  if (
    user && (pathname.startsWith("/dashboard") || pathname.startsWith("/tools"))
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email_verified_at")
      .eq("id", user.id)
      .single();
  }

  // ── Block admin API without session cookie ────────────
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const cookieHeader = request.headers.get("cookie") || "";
    if (!cookieHeader.includes("admin_session=")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (matchesAny(pathname, ADMIN_PREFIXES)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      url.searchParams.set("reason", "admin");
      return NextResponse.redirect(url);
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isAdmin) {
      // Authenticated but not admin → redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // ── 4. Protected route guard ───────────────────────────────
  if (matchesAny(pathname, PROTECTED_PREFIXES)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Authenticated — let the dashboard layout handle
    // onboarding redirect (it needs the profile from DB)
    return supabaseResponse;
  }

  // ── 5. Auth page redirect (already logged in) ──────────────
  if (matchesAny(pathname, AUTH_PAGES)) {
    if (user) {
      const url = request.nextUrl.clone();
      // Respect the redirect param if present
      const redirect = request.nextUrl.searchParams.get("redirect");
      url.pathname = redirect ?? "/dashboard";
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
  }

  // ── 6. All other routes: pass through ─────────────────────
  return supabaseResponse;
}

// ─────────────────────────────────────────────────────────────
// MATCHER — which paths to run middleware on
// ─────────────────────────────────────────────────────────────

export const config = {
  matcher: ["/cerebre-admin/:path*", "/api/admin/:path*"],
};
