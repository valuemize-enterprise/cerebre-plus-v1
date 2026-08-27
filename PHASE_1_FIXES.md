# Phase 1 — Coin Economy Pivot

Applied: August 2026 (builds on Phase 0 fixes)

---

## What changed and why

The pricing pivot decision (July 2026) replaced Free/Starter/Growth subscription tiers with
a pure pay-as-you-go coin economy. Everyone gets 70 free coins on signup with no expiry.
Additional coins are bought in bulk packs (starting ₦5,000) or custom amounts.
The SME Club is now free and open to all authenticated users.

Phase 1 makes the codebase consistent with that decision. Before this patch, the pivot
was announced but not implemented — the subscription gate was still active, tools still
showed Growth+ badges, and the billing page still sold plan upgrades.

---

## Files changed

### Critical gates removed
| File | Change |
|---|---|
| `app/(dashboard)/layout.tsx` | Removed subscription query + `isFreePlanExpired` redirect. Auth is now: user exists + profile complete + onboarding done. |
| `app/api/sme-club/sessions/route.ts` | Removed Growth plan gate. All published sessions are `accessible: true` for every authenticated user. |
| `app/(dashboard)/sme-club/page.tsx` | Removed `isGrowth` state, Growth Member badge, upsell strip, and lock icons. All sessions render as accessible. |

### Generate routes (subscription checks removed)
| File | Change |
|---|---|
| `app/api/generate/[toolId]/route.ts` | Removed `subscriptions` query. `isEnterprise = false` always. `planTier = 'pay_as_you_go'` for analytics only. |
| `app/api/generate/recycle/route.ts` | `isEnterprise = false` — coin deduction now always runs. |
| `app/api/generate/competitor/route.ts` | Removed subscription query. Coin check runs for every user. |

### Payment flow (coins only)
| File | Change |
|---|---|
| `app/api/billing/create-payment/route.ts` | `plan_upgrade` type removed. Only `topup_bulk` and `topup_custom` accepted. |
| `app/api/billing/verify-payment/route.ts` | Subscription upsert and PLAN_COINS logic removed. Only credits coins. |
| `app/api/webhooks/paystack/route.ts` | `subscription.disable` and plan-based `charge.success` removed. Only `isTopUp: true` events credited. `charge.failed` kept. |
| `app/(dashboard)/billing/page.tsx` | Plan cards, SME Club upsell, Growth upgrade buttons, and trial-expired banner removed. Page now shows coin balance + top-up packs + history. |

### Admin pages
| File | Change |
|---|---|
| `app/api/admin/billing/route.ts` | Rebuilt — now returns coin revenue (top-up ₦ estimates), coins sold YTD, buyers, coins in circulation. MRR/ARR/subscriber counts removed. |
| `app/cerebre-admin/billing/page.tsx` | Stat cards updated to show coin metrics instead of subscription metrics. |
| `app/api/admin/sme-club/route.ts` | New session notification now targets all onboarded users (was Growth plan subscribers only). |
| `app/api/admin/messages/route.ts` | Message blast changed from Growth subscribers to all onboarded users. |
| `app/api/admin/dashboard/route.ts` | Growth count stat replaced with "users with coins > 0" count. |
| `app/api/admin/users/[id]/route.ts` | `sme_club_member` now always `true` (club is open to all). |

### Infrastructure
| File | Change |
|---|---|
| `app/api/cron/expire-free-plans/routes.ts` | Disabled — returns immediately with `disabled: true`. Remove from `vercel.json` cron config. |
| `components/tools/ToolCard.tsx` | Growth+ badge removed. |
| `supabase/migrations/013_coin_pivot.sql` | **RUN THIS IN SUPABASE SQL EDITOR** — see below. |

---

## Migration 013 — run this in Supabase SQL Editor

File: `supabase/migrations/013_coin_pivot.sql`

What it does:
1. Makes `expire_free_plans()` a no-op (returns 0, does nothing)
2. Replaces `handle_new_user` — gives 70 signup coins, no subscription row created
3. Un-expires all existing free plan accounts (`free_expires_at → 2099`)
4. Adds a deprecation comment to the `subscriptions` table
5. Opens SME Club RLS to all authenticated users

**Run it BEFORE deploying the code changes** so that existing users aren't locked out
during the deployment window.

---

## What's still using subscriptions table

These still read from `subscriptions` but in non-blocking ways:
- `app/(dashboard)/billing/page.tsx` — still fetches `/api/billing/subscription` for the
  "current plan" badge display. The badge shows nothing if the row is missing. Non-blocking.
- `app/api/billing/subscription/route.ts` — still returns subscription data. Keep it — no
  harm in having the data, just don't gate anything on it.
- `app/api/coins/history/route.ts` — unrelated to subscriptions.

No further action needed on these. The subscriptions table is soft-deprecated and will be
cleaned up in a future migration if needed.

---

## Vercel cron — update vercel.json

Remove or disable this entry:

```json
{ "path": "/api/cron/expire-free-plans", "schedule": "0 2 * * *" }
```

---

## What Phase 2 adds next

- SME Club website hub (`/club` public page + `/dashboard/club` member hub)
- Coin reward ledger for club participation
- WhatsApp join link with source tracking
- Templates vault, leaderboard, Wins board
