// ═══════════════════════════════════════════════════════════════
// /lib/errors/api-errors.ts
// Standardised error codes used throughout the API.
// Client-side error handling and display logic.
// ═══════════════════════════════════════════════════════════════

export const API_ERRORS = {

  // ── Auth ───────────────────────────────────────────────────
  AUTH_REQUIRED: {
    code:       'AUTH_REQUIRED',
    status:     401,
    message:    'Please log in to continue.',
    actionLabel: 'Log in',
    actionUrl:   '/login',
  },
  SESSION_EXPIRED: {
    code:       'SESSION_EXPIRED',
    status:     401,
    message:    'Your session has expired. Please log in again.',
    actionLabel: 'Log in again',
    actionUrl:   '/login',
  },
  FORBIDDEN: {
    code:       'FORBIDDEN',
    status:     403,
    message:    'You don\'t have permission to do this.',
    actionLabel: 'Go back',
    actionUrl:   null,
  },

  // ── Coins ─────────────────────────────────────────────────
  INSUFFICIENT_COINS: {
    code:       'INSUFFICIENT_COINS',
    status:     402,
    message:    'Not enough Cerebre Coins. Top up to continue generating.',
    actionLabel: 'Top up coins',
    actionUrl:   '/billing',
  },
  COIN_DEDUCTION_FAILED: {
    code:       'COIN_DEDUCTION_FAILED',
    status:     500,
    message:    'Coin deduction failed. Your content was still generated — please contact support.',
    actionLabel: 'Contact support',
    actionUrl:   `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`,
  },

  // ── Rate limits ───────────────────────────────────────────
  RATE_LIMITED: {
    code:       'RATE_LIMITED',
    status:     429,
    message:    'Too many requests. Please wait a moment before trying again.',
    actionLabel: 'Try again',
    actionUrl:   null,
  },

  // ── Input validation ──────────────────────────────────────
  INVALID_INPUT: {
    code:       'INVALID_INPUT',
    status:     400,
    message:    'Please check all required fields and try again.',
    actionLabel: null,
    actionUrl:   null,
  },
  PROFILE_MISSING: {
    code:       'PROFILE_MISSING',
    status:     422,
    message:    'Complete your profile to run this tool — it needs your business details to personalise the output.',
    actionLabel: 'Complete profile',
    actionUrl:   '/profile',
  },
  TOOL_NOT_FOUND: {
    code:       'TOOL_NOT_FOUND',
    status:     404,
    message:    'Tool not found. Please refresh the page.',
    actionLabel: 'Browse tools',
    actionUrl:   '/tools',
  },

  // ── AI generation ─────────────────────────────────────────
  AI_ERROR: {
    code:       'AI_ERROR',
    status:     500,
    message:    'The AI generation failed. No coins were deducted. Please try again.',
    actionLabel: 'Try again',
    actionUrl:   null,
  },
  PROMPT_MISSING: {
    code:       'PROMPT_MISSING',
    status:     500,
    message:    'Tool configuration error. Please contact support.',
    actionLabel: 'Contact support',
    actionUrl:   `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`,
  },
  GENERATION_TIMEOUT: {
    code:       'GENERATION_TIMEOUT',
    status:     504,
    message:    'Generation took too long. No coins were deducted. Please try again.',
    actionLabel: 'Try again',
    actionUrl:   null,
  },

  // ── Payments ──────────────────────────────────────────────
  PAYMENT_FAILED: {
    code:       'PAYMENT_FAILED',
    status:     402,
    message:    'Payment could not be processed. Please try a different card or contact your bank.',
    actionLabel: 'Try again',
    actionUrl:   '/billing',
  },

  // ── Generic ───────────────────────────────────────────────
  SERVER_ERROR: {
    code:       'SERVER_ERROR',
    status:     500,
    message:    'Something went wrong on our end. Our team has been notified.',
    actionLabel: 'Go to dashboard',
    actionUrl:   '/dashboard',
  },
  NOT_FOUND: {
    code:       'NOT_FOUND',
    status:     404,
    message:    'Page not found.',
    actionLabel: 'Go to dashboard',
    actionUrl:   '/dashboard',
  },
} as const

export type ApiErrorCode = keyof typeof API_ERRORS

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export function getApiError(code: string) {
  return API_ERRORS[code as ApiErrorCode] || API_ERRORS.SERVER_ERROR
}

/** Format an error for JSON API response */
export function apiError(code: ApiErrorCode, detail?: string) {
  const err = API_ERRORS[code]
  return new Response(
    JSON.stringify({ error: code, message: err.message, detail }),
    {
      status:  err.status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

/** Check if an HTTP response is a known API error */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const body = await response.json()
    const err  = API_ERRORS[body.error as ApiErrorCode]
    return err?.message || body.message || 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}
