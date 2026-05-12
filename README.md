# Cerebre Plus

**Africa's Premier AI Marketing SaaS Platform**  
Built by Cerebre Media Africa for Nigerian and African business owners.

---

## What Is This

Cerebre Plus is a subscription AI marketing platform. Users access 40 AI tools covering content, strategy, advertising, WhatsApp, sales, reputation, SEO, and growth. The platform uses a Cerebre Coin economy — subscribe monthly to receive coins, spend coins to run tools.

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript (strict) · Supabase · Anthropic Claude · Upstash Redis · Paystack · Vercel

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/cerebre-media/cerebre-plus.git
cd cerebre-plus

# 2. Setup (installs deps, creates .env.local, validates env)
bash scripts/setup.sh

# 3. Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key        # Server-only, never expose

# Anthropic (required)
ANTHROPIC_API_KEY=sk-ant-...

# Upstash Redis (required for rate limiting + caching)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Paystack (required for payments)
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

# App URL (required for share links + OAuth redirects)
NEXT_PUBLIC_APP_URL=https://cerebreplus.com

# Admin (required — comma-separated admin emails)
CEREBRE_ADMIN_EMAILS=admin@cerebreplus.com,your@email.com
# Note: Do NOT prefix this with NEXT_PUBLIC_ — keep server-side only

# Cron protection (required for scheduled jobs)
CEREBRE_CRON_SECRET=your_long_random_string_here

# Optional: Analytics
MIXPANEL_TOKEN=your_token
NEXT_PUBLIC_GA_ID=G-...

# Optional: Email
RESEND_API_KEY=re_...

# Optional: Support WhatsApp (shown in error pages)
NEXT_PUBLIC_SUPPORT_WHATSAPP=2348012345678

# Optional: Cloudflare R2 (for logo uploads)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=cerebre-plus
```

---

## Database Setup

### 1. Create a Supabase project at [supabase.com](https://supabase.com)

### 2. Run the migration

Go to **SQL Editor** in your Supabase dashboard and run the contents of:
```
supabase/migrations/001_complete_schema.sql
```

This creates all tables, RLS policies, and the critical `deduct_coins()` stored procedure.

### 3. Generate TypeScript types (optional but recommended)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

The stub at `types/supabase.ts` covers all required types for compilation.

---

## Architecture

```
app/
├── (auth)/          # Login, signup, verify, password reset
├── (dashboard)/     # All authenticated pages
│   ├── dashboard/   # Main dashboard — the daily marketing briefing
│   ├── tools/       # 40-tool library
│   ├── brand/       # Brand vault
│   ├── history/     # All past generations
│   ├── library/     # Saved collections
│   ├── insights/    # Nigerian market intelligence
│   ├── ideas/       # Daily content ideas engine
│   └── competitor/  # Competitor intelligence (40 coins)
├── (marketing)/     # Public pages — no auth required
│   ├── waitlist/    # Main sales page (Cerebre Plus 10 laws)
│   └── demo/        # Interactive demo
├── api/
│   ├── generate/[toolId]/  # The main streaming AI endpoint
│   ├── generate/recycle/   # Content recycler (8 coins)
│   ├── generate/competitor/ # Competitor analysis (40 coins)
│   ├── ideas/              # Daily ideas API
│   ├── share/create/       # Share token generation
│   ├── coins/reward/       # Bonus coin rewards
│   ├── waitlist/           # Waitlist signup
│   ├── stats/member-count/ # Live member counter
│   └── cron/               # Scheduled jobs
├── shared/[shareToken]/    # Public share view (growth loop)
└── admin/                  # Admin panel

lib/
├── ai/
│   ├── master-system-prompt.ts  # CEREBRE_MASTER_SYSTEM_PROMPT + ProfileContext
│   ├── tool-prompts-1-10.ts     # Tools 1–10 prompts
│   ├── tool-prompts-11-20.ts    # Tools 11–20 prompts
│   ├── tool-prompts-21-30.ts    # Tools 21–30 prompts
│   └── tool-prompts-31-40.ts    # Tools 31–40 prompts
├── coins/economy.ts       # Plan pricing, coin constants
├── tools/registry.ts      # All 40 tools — metadata, forms, loading messages
├── validations/           # Zod schemas for all 40 tools
├── supabase/              # Supabase client factories
├── performance/           # Redis cache layer + bandwidth detection
├── errors/api-errors.ts   # Standardised error codes
└── hooks/useUser.ts       # Auth + profile React hook
```

---

## The AI Architecture

Every tool call flows through a 3-layer prompt:

1. **Layer 1 — Master System Prompt** (`CEREBRE_MASTER_SYSTEM_PROMPT`)  
   Contains all 10 Cerebre Plus laws, mandatory output rules, Nigerian market context.

2. **Layer 2 — Profile Context** (`buildProfileContext(profile)`)  
   Injects the user's business name, city, WhatsApp number, industry, social proof.

3. **Layer 3 — Tool-Specific Prompt** (`getToolPromptXtoY(toolId, inputs, profile)`)  
   The specialist prompt for each tool — with Nigerian market intelligence baked in.

**All Claude API calls are server-side only.** The client never sees the system prompt or API key.

---

## Adding a New Tool

1. Add to `lib/tools/registry.ts` (tool metadata + form fields + loading messages)
2. Add Zod schema to the appropriate `lib/validations/tool-schemas-X.ts`
3. Add prompt function to the appropriate `lib/ai/tool-prompts-X.ts`
4. Add to the dispatcher function at the bottom of that file
5. Tool is immediately available via the `/api/generate/[toolId]` endpoint

No other changes needed — the routing is automatic.

---

## Cron Jobs

Configured in `vercel.json`:

| Job | Schedule | Purpose |
|-----|----------|---------|
| `/api/cron/daily-ideas` | 5AM UTC (6AM WAT) daily | Pre-generate ideas for active users |
| `/api/cron/weekly-pulse` | 6AM UTC Monday (7AM WAT) | Weekly performance report |

Both are protected by `Authorization: Bearer CRON_SECRET`.

---

## Admin Access

1. Set `CEREBRE_ADMIN_EMAILS=your@email.com` in environment
2. Navigate to `/admin`
3. Must be logged in with one of the admin emails

---

## Deployment

### Vercel (recommended)

```bash
# One-time setup
npm i -g vercel
vercel link

# Add all env vars to Vercel
vercel env add ANTHROPIC_API_KEY
# ... (repeat for all env vars)

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add all values from `.env.local`.

⚠️ **Never add `CEREBRE_ADMIN_EMAILS` as a `NEXT_PUBLIC_` variable** — it would expose admin email addresses to the browser.

---

## Security Notes

- All Anthropic API calls are server-side only (Route Handlers / Server Actions)
- Coin deduction uses a PostgreSQL `FOR UPDATE` lock via `deduct_coins()` RPC — atomic
- All Supabase tables have Row Level Security (RLS) enabled
- Admin routes verified server-side against `CEREBRE_ADMIN_EMAILS` env var
- Rate limiting on all generation endpoints via Upstash Redis
- API keys never reach the browser

---

## Troubleshooting

**TypeScript errors about Database type:**
```bash
npx supabase gen types typescript --project-id YOUR_ID > types/supabase.ts
```

**`ANTHROPIC_API_KEY` not found at runtime:**
- Verify it's in `.env.local` (not `.env`)
- Restart the dev server after adding

**Streaming doesn't work in production:**
- Verify `maxDuration: 60` is set in `vercel.json` for the generate route
- Confirm the route uses `runtime = 'nodejs'` (not Edge)

**Coins not deducting:**
- Check the `deduct_coins()` function exists in your Supabase project
- Run `supabase/migrations/001_complete_schema.sql` to create it

**Admin panel redirects to dashboard:**
- Verify your logged-in email is in `CEREBRE_ADMIN_EMAILS`
- This is a server env var — NOT `NEXT_PUBLIC_`

**Redis errors on startup:**
- Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- The app degrades gracefully without Redis — caching just won't work

---

## Tech Stack Reference

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.x | App framework (App Router) |
| React | 18.x | UI |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Supabase | @supabase/ssr | Auth + Database |
| Anthropic SDK | latest | Claude API |
| @upstash/ratelimit | latest | Rate limiting |
| @upstash/redis | latest | Caching |
| Framer Motion | 11.x | Animations |
| React Markdown | 9.x | Output rendering |
| Zod | 3.x | Schema validation |
| next-pwa | 5.x | PWA support |

---

Built by Cerebre Media Africa · [cerebreplus.com](https://cerebreplus.com)
