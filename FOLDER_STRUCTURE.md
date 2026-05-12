cerebre-plus/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── next-pwa.config.js
├── .env.local.example
├── .env.local                          ← (gitignored)
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── README.md
│
├── public/
│   ├── manifest.json                   ← PWA manifest
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── og-image.png
│   ├── logo.svg
│   ├── logo-dark.svg
│   ├── logo-white.svg
│   ├── icons/
│   │   └── *.png                       ← PWA icon sizes
│   └── images/
│       ├── hero-bg.webp
│       ├── pattern-overlay.svg
│       └── african-pattern.svg
│
├── styles/
│   └── (additional stylesheets if needed beyond globals.css)
│
├── app/
│   ├── globals.css                     ← DELIVERABLE 3
│   ├── layout.tsx                      ← Root layout (fonts, providers, metadata)
│   ├── page.tsx                        ← Marketing homepage
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   │
│   ├── (auth)/                         ← Auth route group (no sidebar)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts                ← Supabase OAuth callback
│   │
│   ├── (onboarding)/                   ← Onboarding route group
│   │   ├── layout.tsx
│   │   └── onboarding/
│   │       ├── page.tsx                ← Step router
│   │       ├── step-1/
│   │       │   └── page.tsx            ← Business basics
│   │       ├── step-2/
│   │       │   └── page.tsx            ← Industry & audience
│   │       ├── step-3/
│   │       │   └── page.tsx            ← Social & contact
│   │       ├── step-4/
│   │       │   └── page.tsx            ← Brand voice & challenges
│   │       └── complete/
│   │           └── page.tsx            ← Magic moment + confetti
│   │
│   ├── (dashboard)/                    ← Main app (with sidebar)
│   │   ├── layout.tsx                  ← Sidebar + mobile nav + providers
│   │   ├── dashboard/
│   │   │   └── page.tsx                ← Home dashboard
│   │   ├── tools/
│   │   │   ├── page.tsx                ← All 40 tools grid
│   │   │   └── [toolId]/
│   │   │       ├── page.tsx            ← Tool detail + form
│   │   │       └── loading.tsx
│   │   ├── library/
│   │   │   ├── page.tsx                ← Saved generations
│   │   │   └── [generationId]/
│   │   │       └── page.tsx            ← View saved item
│   │   ├── coins/
│   │   │   ├── page.tsx                ← Coin balance + history
│   │   │   └── topup/
│   │   │       └── page.tsx            ← Buy coin packs
│   │   ├── billing/
│   │   │   ├── page.tsx                ← Subscription management
│   │   │   └── upgrade/
│   │   │       └── page.tsx            ← Upgrade plan
│   │   ├── profile/
│   │   │   ├── page.tsx                ← Business profile editor
│   │   │   └── brand/
│   │   │       └── page.tsx            ← Brand colours + logo
│   │   ├── referral/
│   │   │   └── page.tsx                ← Referral dashboard
│   │   ├── notifications/
│   │   │   └── page.tsx                ← Notification centre
│   │   ├── share/
│   │   │   └── [token]/
│   │   │       └── page.tsx            ← Shared generation view
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── (marketing)/                    ← Public marketing pages
│   │   ├── layout.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── waitlist/
│   │       └── page.tsx
│   │
│   ├── admin/                          ← Admin panel (restricted)
│   │   ├── layout.tsx
│   │   ├── page.tsx                    ← Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/
│   │   │       └── page.tsx
│   │   ├── subscriptions/
│   │   │   └── page.tsx
│   │   ├── generations/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── system/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── generate/
│       │   └── [toolId]/
│       │       └── route.ts            ← Streaming AI generation endpoint
│       ├── coins/
│       │   ├── balance/
│       │   │   └── route.ts
│       │   ├── deduct/
│       │   │   └── route.ts
│       │   ├── topup/
│       │   │   └── route.ts
│       │   └── history/
│       │       └── route.ts
│       ├── profile/
│       │   ├── route.ts                ← GET/PATCH profile
│       │   ├── completeness/
│       │   │   └── route.ts
│       │   └── upload-logo/
│       │       └── route.ts
│       ├── generations/
│       │   ├── route.ts                ← List / create generations
│       │   └── [id]/
│       │       ├── route.ts            ← GET/DELETE generation
│       │       └── save/
│       │           └── route.ts
│       ├── library/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── share/
│       │   ├── create/
│       │   │   └── route.ts
│       │   └── [token]/
│       │       └── route.ts
│       ├── referral/
│       │   ├── route.ts                ← Get referral link
│       │   └── validate/
│       │       └── route.ts
│       ├── notifications/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── waitlist/
│       │   └── route.ts
│       ├── webhooks/
│       │   ├── paystack/
│       │   │   └── route.ts
│       │   └── flutterwave/
│       │       └── route.ts
│       ├── cron/
│       │   ├── refresh-coins/          ← Monthly coin allocation
│       │   │   └── route.ts
│       │   ├── expire-coins/           ← Coin expiry for non-rollovers
│       │   │   └── route.ts
│       │   ├── send-digest/            ← Weekly usage digest email
│       │   │   └── route.ts
│       │   └── cleanup-tokens/         ← Expire old share tokens
│       │       └── route.ts
│       └── admin/
│           ├── users/
│           │   └── route.ts
│           ├── grant-coins/
│           │   └── route.ts
│           └── stats/
│               └── route.ts
│
├── components/
│   ├── ui/                             ← shadcn/ui base components (customised)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── tooltip.tsx
│   │   ├── accordion.tsx
│   │   ├── popover.tsx
│   │   ├── switch.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── sheet.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── scroll-area.tsx
│   │   ├── textarea.tsx
│   │   └── use-toast.ts
│   │
│   ├── tools/                          ← Tool-specific components
│   │   ├── ToolGrid.tsx                ← 40 tool cards grid
│   │   ├── ToolCard.tsx                ← Individual tool card
│   │   ├── ToolForm.tsx                ← Dynamic form renderer
│   │   ├── ToolOutput.tsx              ← Streaming output renderer
│   │   ├── ToolOutputActions.tsx       ← Copy/WhatsApp/Save/Export
│   │   ├── LoadingStages.tsx           ← Multi-stage loading indicator
│   │   ├── CategoryFilter.tsx          ← Tool category tabs
│   │   ├── CoinCostBadge.tsx
│   │   ├── OutputHistory.tsx           ← Recent outputs for tool
│   │   └── ToolPageShell.tsx           ← Layout wrapper for /tools/[id]
│   │
│   ├── dashboard/                      ← Dashboard-specific components
│   │   ├── Sidebar.tsx                 ← Desktop sidebar nav
│   │   ├── MobileNav.tsx               ← Bottom tab nav
│   │   ├── Header.tsx                  ← Top header (mobile + desktop)
│   │   ├── CoinBalance.tsx             ← Coin display widget
│   │   ├── CoinGauge.tsx               ← Visual coin level gauge
│   │   ├── DashboardStats.tsx          ← Usage stats cards
│   │   ├── RecentGenerations.tsx       ← Last 5 outputs
│   │   ├── QuickActions.tsx            ← Featured tool shortcuts
│   │   ├── InsightCard.tsx             ← AI business insight
│   │   ├── MilestoneCard.tsx           ← Celebration prompts
│   │   ├── UpgradePrompt.tsx           ← Contextual upgrade nudge
│   │   └── WelcomeBanner.tsx           ← First-time welcome
│   │
│   ├── auth/                           ← Auth flow components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── GoogleOAuthButton.tsx
│   │   └── AuthCard.tsx
│   │
│   ├── onboarding/                     ← Onboarding flow components
│   │   ├── OnboardingShell.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── Step1BusinessBasics.tsx
│   │   ├── Step2IndustryAudience.tsx
│   │   ├── Step3SocialContact.tsx
│   │   ├── Step4BrandVoice.tsx
│   │   └── OnboardingComplete.tsx
│   │
│   ├── coins/                          ← Coin economy components
│   │   ├── CoinTopupModal.tsx
│   │   ├── CoinPackCard.tsx
│   │   ├── CoinTransactionList.tsx
│   │   ├── CoinDeductAnimation.tsx
│   │   ├── LowCoinWarning.tsx
│   │   └── SubscriptionCard.tsx
│   │
│   ├── marketing/                      ← Public marketing page components
│   │   ├── HeroSection.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── PricingSection.tsx
│   │   ├── TestimonialSlider.tsx
│   │   ├── ToolShowcase.tsx
│   │   ├── SocialProof.tsx
│   │   ├── CTASection.tsx
│   │   ├── MarketingNav.tsx
│   │   └── Footer.tsx
│   │
│   └── shared/                         ← Truly shared across all contexts
│       ├── Logo.tsx
│       ├── PageHeader.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── LoadingSpinner.tsx
│       ├── ConfirmDialog.tsx
│       ├── ShareModal.tsx
│       ├── CopyButton.tsx
│       ├── WhatsAppShareButton.tsx
│       ├── ExportButton.tsx
│       ├── MarkdownRenderer.tsx
│       ├── ProfileCompleteness.tsx
│       ├── ReferralBanner.tsx
│       ├── NotificationBell.tsx
│       ├── SearchCommand.tsx           ← cmdk search palette
│       └── Celebration.tsx            ← Confetti + celebration overlay
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ← Browser Supabase client
│   │   ├── server.ts                   ← Server Supabase client (SSR)
│   │   ├── admin.ts                    ← Service role admin client
│   │   ├── middleware.ts               ← Auth middleware helpers
│   │   └── types.ts                   ← Re-export generated DB types
│   │
│   ├── ai/
│   │   ├── client.ts                   ← Anthropic SDK instance
│   │   ├── generate.ts                 ← Core generation function
│   │   ├── stream.ts                   ← Streaming helpers (Vercel AI SDK)
│   │   ├── prompts.ts                  ← Master system prompt + prompt builders
│   │   ├── akin-alabi-laws.ts          ← The 10 laws as prompt injection
│   │   └── context-builder.ts         ← Profile → AI context builder
│   │
│   ├── paystack/
│   │   ├── client.ts                   ← Paystack API wrapper
│   │   ├── plans.ts                    ← Plan/price IDs
│   │   ├── webhooks.ts                 ← Webhook event handlers
│   │   └── types.ts
│   │
│   ├── coins/
│   │   ├── balance.ts                  ← Get/check coin balance
│   │   ├── deduct.ts                   ← Atomic coin deduction
│   │   ├── credit.ts                   ← Credit coins (referral, top-up)
│   │   ├── topup.ts                    ← Top-up pack logic
│   │   └── rollover.ts                 ← Premium plan rollover logic
│   │
│   ├── tools/
│   │   ├── registry.ts                 ← DELIVERABLE 6: All 40 tools
│   │   └── helpers.ts                  ← Tool utility functions
│   │
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   ├── useCoinBalance.ts
│   │   ├── useGenerate.ts              ← Streaming generation hook
│   │   ├── useToolOutput.ts
│   │   ├── useSavedLibrary.ts
│   │   ├── useNotifications.ts
│   │   ├── useOnboarding.ts
│   │   ├── useReferral.ts
│   │   ├── useSubscription.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                       ← clsx + tailwind-merge
│   │   ├── format.ts                   ← formatCurrency, formatDate, etc.
│   │   ├── whatsapp.ts                 ← Build WhatsApp share URLs
│   │   ├── export.ts                   ← PDF + DOCX export helpers
│   │   ├── share.ts                    ← Share token creation
│   │   ├── analytics.ts                ← Mixpanel wrapper
│   │   ├── naira.ts                    ← ₦ formatting helpers
│   │   └── validation.ts
│   │
│   ├── validations/
│   │   ├── profile.ts                  ← Zod schemas for profile
│   │   ├── tool-forms.ts               ← Dynamic tool form validation
│   │   ├── auth.ts
│   │   └── billing.ts
│   │
│   ├── onboarding/
│   │   ├── steps.ts                    ← Onboarding step definitions
│   │   ├── progress.ts                 ← Onboarding progress tracker
│   │   └── magic-moment.ts             ← First generation celebration logic
│   │
│   ├── notifications/
│   │   ├── create.ts                   ← Create in-app notification
│   │   ├── templates.ts                ← Notification message templates
│   │   └── email.ts                    ← Resend email sending
│   │
│   └── rate-limit/
│       └── index.ts                    ← Upstash rate limiting helpers
│
├── types/
│   ├── index.ts                        ← DELIVERABLE 8: All TS types
│   └── supabase.ts                     ← Auto-generated from Supabase
│
├── middleware.ts                        ← Next.js middleware (auth guard)
│
└── supabase/
    ├── config.toml
    └── migrations/
        ├── 001_complete_schema.sql     ← DELIVERABLE 5
        └── 002_seed_data.sql           ← Optional seed data
