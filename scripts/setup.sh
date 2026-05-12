#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Cerebre Plus — Setup Script
# Gets you from clone to running in under 10 minutes.
# Usage: bash scripts/setup.sh
# ═══════════════════════════════════════════════════════════════
set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

log()   { echo -e "${BOLD}${GREEN}▸ $1${RESET}"; }
warn()  { echo -e "${YELLOW}⚠  $1${RESET}"; }
error() { echo -e "${RED}✗ $1${RESET}"; exit 1; }

echo ""
echo -e "${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║     CEREBRE PLUS — Setup Script        ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""

# ── Check prerequisites ────────────────────────────────────────
log "Checking prerequisites…"
command -v node >/dev/null 2>&1 || error "Node.js is not installed. Install from https://nodejs.org (v18+)"
command -v npm  >/dev/null 2>&1 || error "npm is not installed"
NODE_VER=$(node -v | sed 's/v//' | cut -d'.' -f1)
[ "$NODE_VER" -lt 18 ] && error "Node.js v18+ required. You have $(node -v)"
log "Node.js $(node -v) ✓"

# ── Install dependencies ───────────────────────────────────────
log "Installing npm packages…"
npm install
log "Dependencies installed ✓"

# ── Environment setup ──────────────────────────────────────────
if [ ! -f ".env.local" ]; then
  log "Creating .env.local from template…"
  cp .env.local.example .env.local
  warn "IMPORTANT: Open .env.local and fill in all required values before continuing."
  warn "You need: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,"
  warn "          SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, PAYSTACK_SECRET_KEY"
  echo ""
  read -p "Press ENTER once you've filled in .env.local…" _
else
  log ".env.local already exists ✓"
fi

# ── Validate required env vars ────────────────────────────────
log "Validating environment variables…"
source .env.local 2>/dev/null || true

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "ANTHROPIC_API_KEY"
)

MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    warn "Missing: $var"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  error "$MISSING required environment variables are missing. Please fill in .env.local"
fi
log "Environment variables ✓"

# ── Database setup ────────────────────────────────────────────
log "Running database migrations…"
if command -v supabase >/dev/null 2>&1; then
  supabase db push --db-url "$DATABASE_URL" 2>/dev/null || warn "Run migrations manually from supabase/migrations/"
else
  warn "Supabase CLI not found. Apply migrations manually:"
  warn "  1. Go to your Supabase project → SQL Editor"
  warn "  2. Run the contents of supabase/migrations/001_complete_schema.sql"
fi

# ── Generate Supabase types ────────────────────────────────────
log "Generating Supabase TypeScript types…"
if command -v supabase >/dev/null 2>&1 && [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's/https:\/\///' | cut -d'.' -f1)
  npx supabase gen types typescript --project-id "$PROJECT_ID" > types/supabase.ts 2>/dev/null \
    && log "Types generated ✓" \
    || warn "Could not auto-generate types. The included stub in types/supabase.ts will work fine."
fi

# ── Build check ────────────────────────────────────────────────
log "Running TypeScript type check…"
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | head -20 || true

# ── Success ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔═══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║  ✓  Cerebre Plus is ready!                    ║${RESET}"
echo -e "${BOLD}${GREEN}╚═══════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Start the dev server:${RESET}"
echo -e "    npm run dev"
echo ""
echo -e "  ${BOLD}Open in browser:${RESET}"
echo -e "    http://localhost:3000"
echo ""
echo -e "  ${BOLD}Deploy to Vercel:${RESET}"
echo -e "    npx vercel --prod"
echo ""
