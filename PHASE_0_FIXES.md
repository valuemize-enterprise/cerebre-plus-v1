# Phase 0 Fixes — Cerebre Plus

Applied: August 2026

---

## 0.1 — Mobile tool pages blank screen (FIXED)

**Root cause**  
`components/tools/ToolPage.tsx` mobile tab content used `absolute inset-0` inside a
parent div whose CSS `height` property resolved to `0px`. The parent had `flex-1 min-h-full`
but `min-height` doesn't satisfy the containing-block requirement for absolutely-positioned
children — only a resolved `height` does. The motion.div also had `min-h-screen` which
forced panels to 100dvh, creating a second overflow problem.

**What changed**

| File | Change |
|---|---|
| `components/tools/ToolPage.tsx` | Mobile panel container: removed `flex-1 min-h-full relative mb-5` wrapper div and `absolute inset-0 min-h-screen` from motion.div |
| `components/tools/ToolPage.tsx` | Mobile motion.div now uses `min-h-[70dvh]` (natural flow, no absolute positioning) |
| `components/tools/ToolPage.tsx` | Mobile tab bar: added `sticky top-0 z-10 backdrop-blur-sm` so it stays visible while scrolling long forms |
| `components/tools/ToolPage.tsx` | FormPanel outer div: removed `h-full overflow-y-auto` (outer `<main>` in DashboardShell is the scroll container) |
| `components/tools/ToolPage.tsx` | OutputPanel outer div: removed `h-full overflow-y-auto` (same reason) |
| `components/tools/ToolPage.tsx` | ToolPage root div: removed `h-full` (doesn't resolve through DashboardShell's overflow-y-auto ancestry) |
| `components/tools/ToolPage.tsx` | Desktop layout: removed `h-full overflow-hidden` from outer and inner containers (same reasoning; content scrolls via outer `<main>`) |

**Why sticky form header/footer still work**  
The outer `<main>` in `DashboardShell.tsx` is `overflow-y-auto` — it is the scroll container.
`sticky top-0` (form tool header) and `sticky bottom-0` (generate button) now operate
relative to `<main>`, which is correct. The generate button has `mb-9 md:mb-0` to clear the
mobile nav bar.

---

## 0.2 — Supabase types stub (ACTION REQUIRED — not a code fix)

`types/supabase.ts` is a hand-written stub that allows TypeScript to compile but does not
reflect your actual schema. Every database query in the codebase is validated against fiction.

**Run this once after setting up your Supabase project:**

```bash
# Install the Supabase CLI if you haven't already
npm install -g supabase

# Log in
npx supabase login

# Generate types (replace YOUR_PROJECT_ID with the ref from your Supabase dashboard URL)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/supabase.ts

# Then check for type errors
npx tsc --noEmit
```

Expect TypeScript errors after regeneration — they reveal real mismatches between
the codebase and the live schema that have been silently ignored. Fix them before
proceeding to Phase 1 coin cleanup, as Phase 1 touches every subscription-related
query.

**Where to find your project ID:**  
Supabase Dashboard → your project → Settings → General → Reference ID

---

## 0.3 — Middleware: session refresh + public route audit (FIXED)

**Root cause**  
The root `middleware.ts` had a narrow matcher:
`['/cerebre-admin/:path*', '/api/admin/:path*']`

This meant Supabase's `updateSession()` (which refreshes expiring access tokens) was
**never called for dashboard or tool routes**. Access tokens expire after 1 hour by default.
Once expired, `getServerUser()` in the dashboard layout returns null and users are
redirected to `/login` with no warning.

There were also two middleware files: `app/middleware.ts` (dead — wrong location, never
run by Next.js) and `middleware.ts` at the project root (the live one). They had identical
content, which was confusing.

**What changed**

| File | Change |
|---|---|
| `middleware.ts` | Added `updateSession()` call for all non-admin, non-static routes. Matcher expanded to cover everything except `_next/static`, `_next/image`, and image/font files |
| `middleware.ts` | Admin cookie checks kept exactly as before |
| `app/middleware.ts` | Replaced content with dead-code notice. Safe to delete |

**Note on route protection architecture**  
User-facing route protection (`/dashboard`, `/tools`, etc.) stays in the Server Component
layouts (`app/(dashboard)/layout.tsx`). This is correct: middleware refreshes tokens,
layouts check auth. Middleware route checks would be redundant and would fire before
the session is properly refreshed.

**Routes confirmed public (no auth needed):**  
`/`, `/pricing`, `/features`, `/about`, `/blog/*`, `/waitlist`, `/shared/*`, `/demo`,
`/solutions/*`, all `/api/*` (API routes handle their own auth), `/_next/*`, static assets.

**Routes to add for Phase 2 (SME Club):**  
`/club` (public landing page) and `/club/members/*` (public member directory profiles)
must be accessible without login. They are public by default under the current architecture
since route protection is in the dashboard layout, not middleware.

---

## Files changed in Phase 0

```
middleware.ts                         ← rewritten
app/middleware.ts                     ← marked dead code
components/tools/ToolPage.tsx         ← mobile layout fix
PHASE_0_FIXES.md                      ← this file (new)
```

No database migrations. No new dependencies. No environment variable changes.
