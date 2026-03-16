/**
 * In-memory sliding-window rate limiter for tRPC procedures.
 *
 * Keyed on `${ip}:${procedurePath}` so limits are per-user, per-route.
 * No Redis required — resets on server restart (acceptable for now).
 *
 * Usage in a tRPC middleware:
 *   const result = checkRateLimit(ctx.ip, path, config);
 *   if (!result.ok) throw new TRPCError({ code: 'TOO_MANY_REQUESTS', ... });
 */

export interface RateLimitConfig {
  /**  Max number of requests allowed inside the window. */
  maxRequests: number;
  /** Sliding window duration in milliseconds. */
  windowMs: number;
}

/** Default limits applied to every procedure unless overridden. */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000, // 1 minute
};

/** Tighter limits for mutating / expensive operations. */
export const MUTATION_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60_000,
};

/** Very tight limits for sensitive auth-adjacent routes. */
export const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
};

// Internal store: key → sorted array of timestamps (ms)
const store = new Map<string, number[]>();

export interface RateLimitResult {
  /** Whether the request is within the allowed rate. */
  ok: boolean;
  /**
   * How many ms until the caller can retry.
   * Always 0 when `ok === true`.
   */
  retryAfterMs: number;
}

/**
 * Check whether the caller is within the allowed rate for this key.
 *
 * @param ip         - Caller IP address (forwarded by NestJS).
 * @param routeKey   - Unique procedure path, e.g. `private.entries.create`.
 * @param config     - The rate-limit configuration for this route.
 */
export function checkRateLimit(
  ip: string,
  routeKey: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
): RateLimitResult {
  const key = `${ip}:${routeKey}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Retrieve existing timestamps, prune those outside the window
  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    // Oldest request inside window — caller must wait until it falls out
    const oldest = timestamps[0] ?? windowStart;
    const retryAfterMs = oldest - windowStart;
    return { ok: false, retryAfterMs };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  // Periodic cleanup to prevent unbounded memory growth
  // (runs ~1% of the time, good enough for low-load services)
  if (Math.random() < 0.01) {
    pruneExpired(config.windowMs);
  }

  return { ok: true, retryAfterMs: 0 };
}

function pruneExpired(windowMs: number) {
  const cutoff = Date.now() - windowMs;
  for (const [key, timestamps] of store.entries()) {
    const fresh = timestamps.filter((t) => t > cutoff);
    if (fresh.length === 0) {
      store.delete(key);
    } else {
      store.set(key, fresh);
    }
  }
}

export function getRateLimitStore() {
  return Array.from(store.entries()).map(([key, timestamps]) => ({
    key,
    count: timestamps.length,
    oldest: timestamps[0] ?? null,
    newest: timestamps[timestamps.length - 1] ?? null,
  }));
}
