// /app/api/cron/expire-free-plans/routes.ts
// PHASE 1: DISABLED. Free plan expiry removed — coins don't expire.
// This cron job is kept here for reference but does nothing.
// Remove from Vercel Cron config (vercel.json) to stop it running.
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Free plan expiry is disabled (Phase 1 coin pivot). No accounts were expired.',
    disabled: true,
  })
}
