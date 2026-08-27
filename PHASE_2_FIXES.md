# Phase 2 — SME Club Hub

Applied: August 2026 (builds on Phase 0 + Phase 1 fixes)

---

## What's new

Phase 2 builds the SME Club from a locked-away Growth-plan perk into a
fully operational, public-facing community engine. The club is now the
primary flywheel connecting the WhatsApp community to the platform.

---

## Files created

### Database
| File | Description |
|---|---|
| `supabase/migrations/014_sme_club_hub.sql` | 7 new tables + 2 functions + view + RLS. **Run before deploying.** |

### Public marketing page
| File | URL | Description |
|---|---|---|
| `app/(marketing)/club/page.tsx` | `/club` | Full landing page — hero, weekly schedule, benefits, two WhatsApp CTAs with source tracking |

### API routes
| File | Endpoint | Description |
|---|---|---|
| `app/api/club/hub/route.ts` | `GET /api/club/hub` | Aggregated hub data: points, rank, challenge, wins, stats |
| `app/api/club/join/route.ts` | `POST /api/club/join` (dashboard) `GET /api/club/join?source=&redirect=` (public page) | WhatsApp join tracking + first-join bonus (5 coins, 10 pts) |
| `app/api/club/wins/route.ts` | `GET/POST /api/club/wins` | List community wins + user wins; submit a win |
| `app/api/club/templates/route.ts` | `GET/POST /api/club/templates` | List templates; record download (2 pts) |
| `app/api/club/challenges/route.ts` | `GET/POST /api/club/challenges` | List challenges + entries; submit entry |
| `app/api/club/leaderboard/route.ts` | `GET /api/club/leaderboard` | Top 20 + user's position |
| `app/api/club/hot-seat/route.ts` | `GET/POST /api/club/hot-seat` | Check/submit hot seat application |
| `app/api/admin/club/route.ts` | `GET/PATCH /api/admin/club` | Admin review queue: wins, entries, hot seat, templates |

### Dashboard pages (`/sme-club/*`)
| File | URL | Description |
|---|---|---|
| `app/(dashboard)/sme-club/page.tsx` | `/sme-club` | **REPLACED** — member hub with rank, weekly schedule, challenge, wins |
| `app/(dashboard)/sme-club/sessions/page.tsx` | `/sme-club/sessions` | Session library (moved from `/sme-club`) |
| `app/(dashboard)/sme-club/templates/page.tsx` | `/sme-club/templates` | Templates vault with category filter + download tracking |
| `app/(dashboard)/sme-club/wins/page.tsx` | `/sme-club/wins` | Win submission form + community wins board + own wins tab |
| `app/(dashboard)/sme-club/challenges/page.tsx` | `/sme-club/challenges` | Active challenges + submission form + points leaderboard |
| `app/(dashboard)/sme-club/hot-seat/page.tsx` | `/sme-club/hot-seat` | Hot Seat application form |
| Loading files for all 5 sub-pages | — | Skeleton screens |

### Admin
| File | URL | Description |
|---|---|---|
| `app/cerebre-admin/club/page.tsx` | `/cerebre-admin/club` | Approve wins (feature/approve/reject), approve challenge entries, schedule hot seat, toggle template publish |

### Updated files
| File | Change |
|---|---|
| `components/shared/Navigation.tsx` | Added SME Club (GraduationCap icon) under new "Community" sidebar section |
| `app/cerebre-admin/layout.tsx` | Added "Club Hub" link to admin sidebar |
| `lib/email/templates.ts` | Added `clubWelcomeEmail()` function |
| `lib/email/sender.ts` | Added `sendClubWelcome()` function |
| `vercel.json` | Removed `expire-free-plans` cron entry (disabled in Phase 1, now removed from config) |

---

## Migration 014 — run in Supabase SQL Editor

File: `supabase/migrations/014_sme_club_hub.sql`

**Run before deploying**. Creates:
- `club_challenges` — monthly challenges with coin/point rewards
- `club_challenge_entries` — user submissions (UNIQUE per user per challenge)
- `club_points_ledger` — cumulative points per user
- `club_templates` — Template Thursday drops
- `club_wins` — member win submissions (pending → approved/featured/rejected)
- `club_hot_seat_applications` — hot seat applications
- `club_whatsapp_joins` — source-tracked WhatsApp button clicks
- `get_club_rank(points)` function — Rookie/Builder/Operator/Growth Partner
- `award_club_points(user_id, points, action, coins)` function — atomic points + coin credit
- `club_member_totals` view — aggregated leaderboard data

---

## Coin + points reward table

| Action | Coins | Points | Trigger |
|---|---|---|---|
| Join WhatsApp (first time) | +5 | +10 | Click join button |
| Win approved | +10 | +20 | Admin approves |
| Win featured | +10 | +20 | Admin features |
| Challenge complete | +50 | +100 | Admin approves entry |
| Hot Seat scheduled | +100 | +200 | Admin schedules |
| Template download | 0 | +2 | User downloads |

---

## Rank thresholds

| Rank | Points needed |
|---|---|
| Rookie | 0–99 |
| Builder | 100–399 |
| Operator | 400–999 |
| Growth Partner | 1,000+ |

---

## Environment variables needed

Add to `.env.local` and Vercel:

```
NEXT_PUBLIC_SME_CLUB_WHATSAPP_LINK=https://chat.whatsapp.com/YOUR_INVITE_CODE
```

---

## What still needs to be done

- **Populate first challenge**: Insert a row into `club_challenges` via Supabase dashboard
- **Upload first template**: Insert into `club_templates` with `is_published = false`, add `file_url`, then toggle via admin
- **Send club welcome email**: Wire `sendClubWelcome()` into the onboarding-complete flow (`app/api/onboarding/complete/route.ts` or wherever onboarding finishes)
- **Set the WhatsApp invite link**: Create the WhatsApp Community group, get the invite link, add to env
- **Member directory** (Phase 2 extension): `club_directory_profiles` table is reserved but the UI isn't built yet

---

## Phase 3 preview

Auto-Publish Engine Phase 2: LinkedIn, X/Twitter, TikTok connectors; WhatsApp Business API broadcast; post-performance read-back; retry/failure UX.
