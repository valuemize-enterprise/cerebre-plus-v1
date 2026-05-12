// ═══════════════════════════════════════════════════════════════
// /lib/performance/cache.ts
// Redis caching layer using Upstash.
// Caches: profile (5min), coin balance (30s), tool registry (1hr).
// All cache functions are server-side only.
// ═══════════════════════════════════════════════════════════════

import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    redis = Redis.fromEnv()
  }
  return redis
}

// ─────────────────────────────────────────────────────────────
// TTL CONSTANTS (seconds)
// ─────────────────────────────────────────────────────────────

export const TTL = {
  PROFILE:          5 * 60,        // 5 minutes — profile changes rarely
  COIN_BALANCE:     30,            // 30 seconds — needs to be near-real-time
  SUBSCRIPTION:     5 * 60,        // 5 minutes
  TOOL_REGISTRY:    60 * 60,       // 1 hour — tools don't change often
  IDEAS:            24 * 60 * 60,  // 24 hours — daily ideas cache
  INSIGHTS:         60 * 60,       // 1 hour
  GENERATION_COUNT: 60,            // 1 minute
} as const

// ─────────────────────────────────────────────────────────────
// CACHE KEYS
// ─────────────────────────────────────────────────────────────

export const cacheKey = {
  profile:      (userId: string) => `profile:${userId}`,
  coinBalance:  (userId: string) => `coins:${userId}`,
  subscription: (userId: string) => `subscription:${userId}`,
  toolRegistry: ()               => `tool_registry`,
  ideas:        (userId: string, date: string) => `ideas:${userId}:${date}`,
  insights:     (userId: string) => `insights:${userId}`,
  genCount:     (userId: string) => `gen_count:${userId}`,
  memberCount:  ()               => `member_count`,
  waitlistCount: ()              => `waitlist_count`,
}

// ─────────────────────────────────────────────────────────────
// GENERIC CACHE HELPERS
// ─────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await getRedis().get<T>(key)
  } catch {
    return null
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await getRedis().set(key, value, { ex: ttlSeconds })
  } catch {
    // Cache failures are silent — app still works without cache
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(key)
  } catch {}
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(pattern)
    if (keys.length > 0) {
      await getRedis().del(...keys)
    }
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// PROFILE CACHE
// ─────────────────────────────────────────────────────────────

export async function getCachedProfile(userId: string): Promise<Record<string, any> | null> {
  return cacheGet<Record<string, any>>(cacheKey.profile(userId))
}

export async function setCachedProfile(userId: string, profile: Record<string, any>): Promise<void> {
  return cacheSet(cacheKey.profile(userId), profile, TTL.PROFILE)
}

export async function invalidateProfile(userId: string): Promise<void> {
  return cacheDel(cacheKey.profile(userId))
}

// ─────────────────────────────────────────────────────────────
// COIN BALANCE CACHE
// ─────────────────────────────────────────────────────────────

export async function getCachedBalance(userId: string): Promise<number | null> {
  return cacheGet<number>(cacheKey.coinBalance(userId))
}

export async function setCachedBalance(userId: string, balance: number): Promise<void> {
  return cacheSet(cacheKey.coinBalance(userId), balance, TTL.COIN_BALANCE)
}

export async function invalidateBalance(userId: string): Promise<void> {
  return cacheDel(cacheKey.coinBalance(userId))
}

// ─────────────────────────────────────────────────────────────
// SUBSCRIPTION CACHE
// ─────────────────────────────────────────────────────────────

export async function getCachedSubscription(userId: string): Promise<Record<string, any> | null> {
  return cacheGet<Record<string, any>>(cacheKey.subscription(userId))
}

export async function setCachedSubscription(userId: string, sub: Record<string, any>): Promise<void> {
  return cacheSet(cacheKey.subscription(userId), sub, TTL.SUBSCRIPTION)
}

// ─────────────────────────────────────────────────────────────
// MEMBER COUNT CACHE
// ─────────────────────────────────────────────────────────────

export async function getCachedMemberCount(): Promise<number | null> {
  return cacheGet<number>(cacheKey.memberCount())
}

export async function setCachedMemberCount(count: number): Promise<void> {
  return cacheSet(cacheKey.memberCount(), count, 5 * 60)  // 5 minute cache
}

// ─────────────────────────────────────────────────────────────
// RATE LIMIT HELPERS (using Redis sorted sets)
// ─────────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const r   = getRedis()
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  try {
    const pipeline = r.pipeline()
    pipeline.zremrangebyscore(key, 0, now - windowMs)
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    pipeline.zcard(key)
    pipeline.expire(key, windowSeconds)

    const results = await pipeline.exec()
    const count   = (results[2] as number) || 0

    return {
      allowed:  count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt:  now + windowMs,
    }
  } catch {
    // If Redis fails, allow the request
    return { allowed: true, remaining: maxRequests, resetAt: now + windowMs }
  }
}

// ─────────────────────────────────────────────────────────────
// CACHE WARMING (call on server startup)
// ─────────────────────────────────────────────────────────────

export async function warmToolRegistryCache(): Promise<void> {
  // Tool registry is static — imported directly, no need to cache in Redis
  // But we can cache computed tool metadata if needed
  const cached = await cacheGet(cacheKey.toolRegistry())
  if (!cached) {
    // Import is fast — just mark as warm
    await cacheSet(cacheKey.toolRegistry(), { warmedAt: Date.now() }, TTL.TOOL_REGISTRY)
  }
}
