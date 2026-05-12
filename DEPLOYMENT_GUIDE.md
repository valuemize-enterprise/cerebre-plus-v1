# Cerebre Plus — Complete Deployment Guide

**Who this is for:** A developer who is comfortable with a terminal and a browser but has not deployed a Next.js app before. Every step is explained. Follow them in order and you will have a live application.

**Time required:** 45–90 minutes for first deployment.

---

## What You Are About to Deploy

Cerebre Plus is a full-stack AI marketing SaaS. It uses:

- **Next.js 14** — the web application framework
- **Supabase** — database, authentication, and file storage
- **Anthropic Claude** — the AI that powers all 40 tools
- **Upstash Redis** — rate limiting and caching
- **Paystack** — Nigerian payment processing
- **Vercel** — hosting (free tier is sufficient to start)
- **Resend** — transactional email

You will set up accounts on each of these services. Most have generous free tiers.

---

## PHASE 1 — Install Tools on Your Computer

### Step 1.1 — Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS version** (the left button — currently v20.x)
3. Run the installer and accept all defaults
4. Open your Terminal (Mac: press `Cmd + Space`, type "Terminal", press Enter) or Command Prompt (Windows: press `Win + R`, type "cmd", press Enter)
5. Type this and press Enter:
   ```
   node -v
   ```
6. You should see something like `v20.11.0`. If you do, Node.js is installed correctly.

### Step 1.2 — Install Git

1. Go to **https://git-scm.com/downloads**
2. Download and install Git for your operating system
3. Accept all defaults during installation
4. Verify: in your terminal, type `git --version` and press Enter
5. You should see something like `git version 2.44.0`

### Step 1.3 — Get a Code Editor (if you don't have one)

Download **VS Code** from **https://code.visualstudio.com** — it is free and the best option for this project.

---

## PHASE 2 — Set Up Your Accounts

You need to create accounts on these services. All are free to start.

### Step 2.1 — Supabase (Database + Auth)

1. Go to **https://supabase.com** and click **Start your project**
2. Sign up with GitHub (easiest) or email
3. Click **New project**
4. Fill in:
   - **Name:** `cerebre-plus` (or any name you like)
   - **Database Password:** Create a strong password and **save it somewhere safe** — you will need it
   - **Region:** Choose `West Europe` or `US East` (whichever is closer to your users)
5. Click **Create new project** and wait 2–3 minutes for it to set up
6. When ready, go to **Settings → API** in the left sidebar
7. **Copy and save these values** — you will need them:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → this is your `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep this secret**

### Step 2.2 — Anthropic (AI)

1. Go to **https://console.anthropic.com**
2. Sign up for an account
3. Go to **API Keys** in the left sidebar
4. Click **Create Key**, give it a name like `cerebre-plus-production`
5. **Copy the key immediately** — it will only be shown once
6. This is your `ANTHROPIC_API_KEY` — starts with `sk-ant-`
7. Add credits to your account (minimum $5 recommended to start)

### Step 2.3 — Upstash Redis (Caching + Rate Limiting)

1. Go to **https://upstash.com** and click **Start for Free**
2. Sign up with GitHub or email
3. Click **Create Database**
4. Fill in:
   - **Name:** `cerebre-plus-redis`
   - **Type:** Regional
   - **Region:** Choose the closest to your users
5. Click **Create**
6. On the database page, copy:
   - `UPSTASH_REDIS_REST_URL` → the REST URL
   - `UPSTASH_REDIS_REST_TOKEN` → the REST Token

### Step 2.4 — Paystack (Payments)

1. Go to **https://paystack.com** and click **Create a free account**
2. Complete registration and business verification (required for live payments)
3. For testing, you can use test mode first
4. Go to **Settings → API Keys & Webhooks**
5. Copy:
   - **Public Key** → this is `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_PUBLIC_KEY`
   - **Secret Key** → this is `PAYSTACK_SECRET_KEY` ⚠️ **Keep secret**
6. **For the webhook** (we will set this up after deployment — skip for now)

### Step 2.5 — Resend (Email)

1. Go to **https://resend.com** and sign up
2. Go to **API Keys** → **Create API Key**
3. Name it `cerebre-plus` and copy the key
4. This is your `RESEND_API_KEY`
5. Go to **Domains** and add your domain (or use Resend's test domain `@resend.dev` to start)

### Step 2.6 — Vercel (Hosting)

1. Go to **https://vercel.com** and sign up with GitHub
2. You will connect your repository later — just create the account now

---

## PHASE 3 — Set Up the Project Files

### Step 3.1 — Unzip the Project

1. Find the `cerebre-plus-v1.0.zip` file you downloaded
2. Unzip it to a location you can find easily (e.g. your Desktop or Documents folder)
3. You should now have a folder called `cerebre-plus`

### Step 3.2 — Open in Terminal

**Mac:**
1. Open Terminal
2. Type `cd ` (with a space after it)
3. Drag the `cerebre-plus` folder from Finder into the Terminal window
4. Press Enter

**Windows:**
1. Open the `cerebre-plus` folder in File Explorer
2. Click in the address bar at the top
3. Type `cmd` and press Enter

### Step 3.3 — Install Dependencies

In your terminal (make sure you are inside the `cerebre-plus` folder), run:

```bash
npm install
```

This will download all the packages the project needs. It may take 2–5 minutes. You will see a lot of text — this is normal. Wait until you see the cursor again.

### Step 3.4 — Create Your Environment File

In your terminal, run:

```bash
cp .env.local.example .env.local
```

This creates your environment file. Now open it:

**Mac:** `open .env.local` or open it in VS Code
**Windows:** `notepad .env.local`

You will fill in this file in the next step.

---

## PHASE 4 — Configure Environment Variables

Open `.env.local` in your editor. You will see many lines. Fill in each one:

### Required — Must fill in before running

```bash
# === APP URL ===
# Change this after deployment to your actual Vercel URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === SUPABASE (from Step 2.1) ===
NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...

# === ANTHROPIC (from Step 2.2) ===
ANTHROPIC_API_KEY=sk-ant-...your-key...

# === UPSTASH REDIS (from Step 2.3) ===
UPSTASH_REDIS_REST_URL=https://...your-url...
UPSTASH_REDIS_REST_TOKEN=...your-token...

# === PAYSTACK (from Step 2.4) ===
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# === RESEND (from Step 2.5) ===
RESEND_API_KEY=re_...your-key...

# === ADMIN ===
# Put your email address here — this gives you access to /admin
CEREBRE_ADMIN_EMAILS=your.email@example.com

# === CRON SECRET ===
# Make up any long random string (30+ characters)
CEREBRE_CRON_SECRET=make-up-any-long-random-string-here-minimum-30-chars

# === SUPPORT WHATSAPP ===
# Your WhatsApp number in international format (no + sign)
NEXT_PUBLIC_SUPPORT_WHATSAPP=whatsapp
```

**Save the file** when done.

> ⚠️ **Never share this file or commit it to Git.** It contains secret keys.

---

## PHASE 5 — Set Up the Database

This is the most important step. You are creating all the database tables.

### Step 5.1 — Open Supabase SQL Editor

1. Go to your Supabase project at **https://supabase.com/dashboard**
2. In the left sidebar, click **SQL Editor**
3. Click **New query**

### Step 5.2 — Run the Migration

1. Open the file `supabase/migrations/001_complete_schema.sql` in your code editor
2. Select all the text (`Ctrl+A` or `Cmd+A`)
3. Copy it (`Ctrl+C` or `Cmd+C`)
4. Paste it into the Supabase SQL Editor
5. Click the **Run** button (green button at the bottom right)
6. Wait 10–30 seconds
7. You should see a success message like `Success. No rows returned`

If you see an error:
- Read the error message carefully
- Common issue: if you have run it before and get "already exists" errors, you can ignore them — the migration uses `CREATE ... IF NOT EXISTS`
- If the error mentions `uuid_generate_v4`, run this first, then re-run the migration:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

### Step 5.3 — Verify the Tables Were Created

1. In the Supabase sidebar, click **Table Editor**
2. You should see tables including: `profiles`, `subscriptions`, `coin_balances`, `coin_transactions`, `generations`, `waitlist`, `referrals`, `notifications`, `saved_library`, `share_tokens`
3. If you see 10+ tables, the migration worked correctly

### Step 5.4 — Configure Supabase Auth

1. In the Supabase sidebar, click **Authentication → URL Configuration**
2. Under **Site URL**, enter: `http://localhost:3000` (change later to your production URL)
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Click **Save**

### Step 5.5 — Enable Google OAuth (Optional but Recommended)

1. Go to **Authentication → Providers**
2. Find **Google** and toggle it on
3. You will need Google OAuth credentials — follow Supabase's guide at the link shown in the Supabase UI
4. Add your Google Client ID and Secret
5. Add the callback URL shown in Supabase to your Google OAuth settings

---

## PHASE 6 — Test Locally

### Step 6.1 — Start the Development Server

In your terminal (inside the `cerebre-plus` folder), run:

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 14.x.x
- Local:   http://localhost:3000
- Ready in 2.3s
```

### Step 6.2 — Open the App

1. Open your browser
2. Go to **http://localhost:3000**
3. You should be redirected to the waitlist page
4. The page should load with the Cerebre Plus dark navy design

### Step 6.3 — Test Signup

1. Go to **http://localhost:3000/signup**
2. Enter your email and a password
3. Check your email for a verification link
4. Click the verification link — it should redirect you to the dashboard
5. You should see the dashboard with a welcome message

### Step 6.4 — Test a Tool

1. Click **Tools** in the navigation
2. Click **CaptionCraft** (cheapest tool at 15 coins)
3. Fill in the form (the fields are pre-populated if your profile is complete)
4. Click **Generate**
5. You should see text streaming in word by word
6. If this works, your Anthropic API key is correct and the AI is responding

### Step 6.5 — Test the Admin Panel

1. Go to **http://localhost:3000/admin**
2. If your email is in `CEREBRE_ADMIN_EMAILS`, you should see the admin dashboard
3. If you are redirected to `/dashboard`, your email is not matching — check the env var

### Common Local Issues

**"Cannot connect to database"**
- Check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Make sure there are no trailing spaces or quotes around the values

**"AI generation failed"**
- Check your `ANTHROPIC_API_KEY`
- Make sure you have credits in your Anthropic account

**"Coins not deducting"**
- The `deduct_coins` function may not have been created — re-run the SQL migration

**The page is blank or shows an error**
- Look in the terminal where you ran `npm run dev` — it will show error messages
- Also check the browser console (press F12 → Console tab)

---

## PHASE 7 — Deploy to Vercel

### Step 7.1 — Push to GitHub

Vercel deploys from GitHub. You need to push your code there first.

1. Go to **https://github.com** and log in (create an account if needed)
2. Click the **+** button → **New repository**
3. Name it `cerebre-plus`
4. Set it to **Private** (important — your code contains business logic)
5. Click **Create repository**
6. GitHub will show you some commands. In your terminal, run them:

```bash
git init
git add .
git commit -m "Initial Cerebre Plus deployment"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/cerebre-plus.git
git push -u origin main
```

Replace `YOURUSERNAME` with your GitHub username.

> ⚠️ **Make sure `.env.local` is NOT pushed to GitHub.** Check that `.gitignore` contains `.env.local` — it should already be there.

### Step 7.2 — Connect to Vercel

1. Go to **https://vercel.com** and log in
2. Click **Add New Project**
3. Find your `cerebre-plus` repository and click **Import**
4. Vercel will detect it is a Next.js project automatically

### Step 7.3 — Add Environment Variables to Vercel

**This is critical.** Your `.env.local` file is on your computer — Vercel needs the same variables.

1. On the Vercel import screen, click **Environment Variables**
2. Add each variable from your `.env.local` file:
   - Click **Add** for each one
   - Enter the Name (e.g. `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the Value (e.g. `https://yourproject.supabase.co`)
   - Select **Production**, **Preview**, and **Development** for all variables
3. The required variables are:

```
NEXT_PUBLIC_APP_URL          → your Vercel URL (you'll update this after first deploy)
NEXT_PUBLIC_SUPABASE_URL     → from Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY → from Supabase
SUPABASE_SERVICE_ROLE_KEY    → from Supabase
ANTHROPIC_API_KEY            → from Anthropic
UPSTASH_REDIS_REST_URL       → from Upstash
UPSTASH_REDIS_REST_TOKEN     → from Upstash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY → from Paystack
PAYSTACK_SECRET_KEY          → from Paystack
RESEND_API_KEY               → from Resend
CEREBRE_ADMIN_EMAILS         → your email address
CEREBRE_CRON_SECRET          → the random string you created
NEXT_PUBLIC_SUPPORT_WHATSAPP → your WhatsApp number
```

4. Click **Deploy**
5. Wait 2–4 minutes for the build to complete

### Step 7.4 — Get Your Live URL

1. When deployment succeeds, Vercel will show you a URL like `https://cerebre-plus-abc123.vercel.app`
2. **Copy this URL**

### Step 7.5 — Update the App URL

1. Go to Vercel → your project → **Settings → Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL` and change its value to your Vercel URL (e.g. `https://cerebre-plus-abc123.vercel.app`)
3. Click **Save**
4. Vercel will automatically redeploy

### Step 7.6 — Update Supabase Auth URLs

1. Go to your Supabase project → **Authentication → URL Configuration**
2. Change **Site URL** to your Vercel URL: `https://cerebre-plus-abc123.vercel.app`
3. Under **Redirect URLs**, add: `https://cerebre-plus-abc123.vercel.app/auth/callback`
4. Keep `http://localhost:3000/auth/callback` in the list too (for local development)
5. Click **Save**

---

## PHASE 8 — Post-Deployment Configuration

### Step 8.1 — Set Up the Paystack Webhook

This allows Paystack to tell your app when a payment succeeds.

1. Go to **Paystack Dashboard → Settings → API Keys & Webhooks**
2. Under **Webhook URL**, enter: `https://your-vercel-url.vercel.app/api/webhooks/paystack`
3. Click **Update**
4. Back in Vercel, add this environment variable:
   - `PAYSTACK_WEBHOOK_SECRET` → copy the webhook secret from Paystack

### Step 8.2 — Verify Cron Jobs

Your app has two scheduled jobs that run automatically:
- **Daily ideas generation:** runs at 6AM Nigeria time every day
- **Weekly performance pulse:** runs every Monday at 7AM Nigeria time

Vercel handles these automatically based on your `vercel.json`. To verify they are set up:

1. Go to Vercel → your project → **Settings → Cron Jobs**
2. You should see two cron jobs listed
3. If they are not there, check your `vercel.json` file has the `crons` section

### Step 8.3 — Set Up a Custom Domain (Optional)

1. Go to Vercel → your project → **Settings → Domains**
2. Click **Add Domain**
3. Enter your domain (e.g. `cerebreplus.com`)
4. Follow Vercel's instructions to update your DNS settings
5. Wait 10–30 minutes for DNS to propagate
6. Once active, update `NEXT_PUBLIC_APP_URL` in Vercel to your custom domain

### Step 8.4 — Configure Resend for Your Domain

1. Go to **Resend → Domains**
2. Click **Add Domain**
3. Enter your domain
4. Resend will give you DNS records to add to your domain registrar
5. After verification, update the `from` address in `/lib/email.ts`:
   - Change `hello@cerebreplus.com` to `hello@yourdomain.com`
6. Commit and push the change — Vercel will redeploy automatically

### Step 8.5 — Switch Paystack to Live Mode

When you are ready to accept real payments:

1. Go to Paystack and complete all business verification steps
2. In Paystack Dashboard, switch from **Test** to **Live** mode
3. Copy your **Live Secret Key** and **Live Public Key**
4. Update these in Vercel Environment Variables:
   - `PAYSTACK_SECRET_KEY` → live secret key
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` → live public key
5. Redeploy

---

## PHASE 9 — Final Checks

### Checklist Before Going Live

Run through each of these manually:

- [ ] **Waitlist page loads** — go to `yoursite.com/waitlist`
- [ ] **Signup works** — create a new account
- [ ] **Email verification** — check that verification email arrives
- [ ] **Dashboard loads** — after login, you see the dashboard
- [ ] **Profile save works** — fill in profile, click save, reload — data persists
- [ ] **Tool generation works** — run CaptionCraft (15 coins)
- [ ] **Coins deduct** — balance decreases after generation
- [ ] **Copy button works** — output can be copied to clipboard
- [ ] **WhatsApp share works** — opens WhatsApp with pre-filled text
- [ ] **Admin panel works** — go to `/admin` with your admin email
- [ ] **Ideas page loads** — shows 5 content ideas
- [ ] **Billing page loads** — shows subscription options
- [ ] **Share link works** — generate output, click share, visit the share URL

### Testing a Payment (Test Mode)

1. Go to `/billing`
2. Click "Upgrade to Starter"
3. When Paystack popup opens, use test card:
   - Card: `4084 0840 8408 4081`
   - Expiry: any future date
   - CVV: `408`
   - PIN: `0000`
   - OTP: `123456`
4. After payment, check that your plan updates to Starter
5. Check that 100 coins are added to your balance

---

## PHASE 10 — Ongoing Operations

### Making Code Changes

When you update the code and push to GitHub, Vercel automatically redeploys:

```bash
# Make your changes, then:
git add .
git commit -m "Description of what you changed"
git push
```

Vercel will pick up the push and deploy within 2–3 minutes.

### Viewing Logs

1. Go to Vercel → your project → **Deployments**
2. Click the latest deployment
3. Click **Functions** to see API route logs
4. This is where you look when something breaks in production

### Database Backups

Supabase automatically backs up your database daily (on paid plans). On the free plan:

1. Go to Supabase → **Database → Backups**
2. Click **Create backup** weekly

### Monitoring Costs

Keep an eye on these as usage grows:

- **Anthropic:** you pay per API call. ~₦0.50–5 per tool generation
- **Upstash:** free tier covers 10,000 requests/day
- **Vercel:** free tier covers 100GB bandwidth/month
- **Supabase:** free tier covers 500MB database and 50,000 users

---

## Troubleshooting

### "Build failed on Vercel"

1. Go to Vercel → Deployments → click the failed deployment
2. Click **Build Logs**
3. Scroll to the red error
4. Common causes:
   - Missing environment variable → add it in Vercel settings
   - TypeScript error → run `npm run build` locally to see the same error

### "502 Bad Gateway on AI routes"

This means the AI generation is timing out. The fix:

1. In Vercel → Settings → Functions, check that `maxDuration` is set
2. Your `vercel.json` already sets 60 seconds for the generate route
3. If you are on Vercel's free tier, maximum is 10 seconds — you need to upgrade to Vercel Pro (or switch to a different hosting provider that supports longer function timeouts)

### "Coins not updating after payment"

1. Check that the Paystack webhook is configured (Step 8.1)
2. Check Vercel logs for `/api/webhooks/paystack` errors
3. Verify `PAYSTACK_SECRET_KEY` matches what Paystack shows

### "Users not receiving emails"

1. Check Resend dashboard → **Emails** tab — are emails being sent?
2. If sending but not arriving, check spam folders
3. If not sending, check `RESEND_API_KEY` in Vercel settings
4. Make sure your sending domain is verified in Resend

### "Admin panel says 'Page not found'"

1. Check that your logged-in email exactly matches `CEREBRE_ADMIN_EMAILS` in Vercel (case-sensitive)
2. No spaces before or after the email
3. Redeploy after changing the env var

---

## Getting Help

**Check the logs first.** 90% of issues are visible in either:
- Vercel function logs (for API errors)
- Browser console — press F12 (for client errors)

**Common resources:**
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- Anthropic docs: https://docs.anthropic.com
- Paystack docs: https://paystack.com/docs

---

*Cerebre Plus — Built by Cerebre Media Africa*
