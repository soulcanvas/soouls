/**
 * Redis-backed sliding-window rate limiter for tRPC procedures.
 *
 * Uses Redis sorted sets (ZSET) with timestamps as scores for precise
 * sliding window implementation. Falls back to in-memory if Redis is unavailable.
 *
 * Usage in a tRPC middleware:
 *   const result = await checkRateLimit(ctx.ip, path, config);
 *   if (!result.ok) throw new TRPCError({ code: 'TOO_MANY_REQUESTS', ... });
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

export const MUTATION_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60_000,
};

export const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
};

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
}

interface RedisClient {
  zadd(key: string, score: number, member: string): Promise<number>;
  zremrangebyscore(key: string, min: number | string, max: number | string): Promise<number>;
  zcount(key: string, min: number | string, max: number | string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  scan(cursor: string, pattern: string, count: number): Promise<[string, string[]]>;
  zrange(key: string, start: number, stop: number): Promise<string[]>;
  pipeline(): {
    zadd(key: string, score: number, member: string): unknown;
    zremrangebyscore(key: string, min: number | string, max: number | string): unknown;
    expire(key: string, seconds: number): unknown;
    exec(): Promise<unknown[]>;
  };
}

let redisClient: RedisClient | null = null;
let useInMemoryFallback = false;

const inMemoryStore = new Map<string, number[]>();

const violations: Array<{ ip: string; route: string; timestamp: number; count: number }> = [];
const MAX_VIOLATIONS = 100;

export function initRateLimiter(client: RedisClient | null) {
  redisClient = client;
  useInMemoryFallback = !client;
  if (client) {
    console.log('[RateLimit] Using Redis-backed sliding window rate limiter');
  } else {
    console.warn('[RateLimit] Redis unavailable, falling back to in-memory rate limiter');
  }
}

export async function checkRateLimit(
  ip: string,
  routeKey: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
): Promise<RateLimitResult> {
  const key = `ratelimit:${ip}:${routeKey}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  if (useInMemoryFallback || !redisClient) {
    return checkRateLimitInMemory(key, now, windowStart, config, ip, routeKey);
  }

  return checkRateLimitRedis(key, now, windowStart, config, ip, routeKey);
}

async function checkRateLimitRedis(
  key: string,
  now: number,
  windowStart: number,
  config: RateLimitConfig,
  ip: string,
  routeKey: string,
): Promise<RateLimitResult> {
  try {
    const member = `${now}`;

    const pipeline = redisClient?.pipeline();
    pipeline.zadd(key, now, member);
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    pipeline.expire(key, Math.ceil(config.windowMs / 1000) + 1);
    await pipeline.exec();

    const count = await redisClient?.zcount(key, windowStart, now);

    if (count > config.maxRequests) {
      addViolation(ip, routeKey, count);
      return { ok: false, retryAfterMs: config.windowMs };
    }

    return { ok: true, retryAfterMs: 0 };
  } catch (error) {
    console.error('[RateLimit] Redis error, falling back to in-memory', error);
    useInMemoryFallback = true;
    return checkRateLimitInMemory(key, now, windowStart, config, ip, routeKey);
  }
}

function checkRateLimitInMemory(
  key: string,
  now: number,
  windowStart: number,
  config: RateLimitConfig,
  ip: string,
  routeKey: string,
): RateLimitResult {
  const timestamps = (inMemoryStore.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    addViolation(ip, routeKey, timestamps.length);
    const oldest = timestamps[0] ?? windowStart;
    const retryAfterMs = oldest - windowStart;
    return { ok: false, retryAfterMs };
  }

  timestamps.push(now);
  inMemoryStore.set(key, timestamps);

  if (Math.random() < 0.01) {
    pruneInMemory(windowStart);
  }

  return { ok: true, retryAfterMs: 0 };
}

function addViolation(ip: string, route: string, count: number) {
  violations.unshift({ ip, route, timestamp: Date.now(), count });
  if (violations.length > MAX_VIOLATIONS) {
    violations.pop();
  }
}

function pruneInMemory(windowStart: number) {
  for (const [key, timestamps] of inMemoryStore.entries()) {
    const fresh = timestamps.filter((t) => t > windowStart);
    if (fresh.length === 0) {
      inMemoryStore.delete(key);
    } else {
      inMemoryStore.set(key, fresh);
    }
  }
}

async function getRedisStats(): Promise<{
  entries: Array<{
    ip: string;
    route: string;
    count: number;
    oldest: number | null;
    newest: number | null;
  }>;
  totalKeys: number;
}> {
  if (!redisClient) return { entries: [], totalKeys: 0 };

  const entries: Array<{
    ip: string;
    route: string;
    count: number;
    oldest: number | null;
    newest: number | null;
  }> = [];
  let cursor = '0';
  let totalKeys = 0;

  do {
    const [nextCursor, keys] = await redisClient.scan(cursor, 'ratelimit:*', 100);
    cursor = nextCursor;
    totalKeys += keys.length;

    for (const key of keys) {
      const parts = key.replace('ratelimit:', '').split(':');
      if (parts.length >= 2) {
        const ip = parts[0] ?? 'unknown';
        const route = parts.slice(1).join(':');
        const members = await redisClient?.zrange(key, 0, -1);
        const now = Date.now();
        const windowStart = now - 60_000;
        const validMembers = members.filter((m) => Number(m) > windowStart);
        entries.push({
          ip,
          route,
          count: validMembers.length,
          oldest: validMembers.length > 0 ? Number(validMembers[0]) : null,
          newest: validMembers.length > 0 ? Number(validMembers[validMembers.length - 1]) : null,
        });
      }
    }
  } while (cursor !== '0');

  return { entries, totalKeys };
}

export async function getRateLimitStats() {
  if (useInMemoryFallback || !redisClient) {
    return {
      mode: 'in-memory',
      entries: Array.from(inMemoryStore.entries()).map(([key, timestamps]) => {
        const parts = key.replace('ratelimit:', '').split(':');
        return {
          key,
          ip: parts[0] ?? '',
          route: parts.slice(1).join(':') || 'unknown',
          count: timestamps.length,
          oldest: timestamps[0] ?? null,
          newest: timestamps[timestamps.length - 1] ?? null,
        };
      }),
      violations: violations.slice(0, 50),
      endpoints: [
        { route: '/api/trpc/*', type: 'default', limit: 60 },
        { route: 'POST mutations', type: 'mutation', limit: 30 },
        { route: 'auth.*', type: 'strict', limit: 10 },
      ],
    };
  }

  const redisStats = await getRedisStats();
  const ipMap = new Map<string, { count: number; route: string }>();

  for (const entry of redisStats.entries) {
    const existing = ipMap.get(entry.ip);
    if (!existing || existing.count < entry.count) {
      ipMap.set(entry.ip, { count: entry.count, route: entry.route });
    }
  }

  const topIPs = Array.from(ipMap.entries())
    .map(([ip, data]) => ({ ip, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    mode: 'redis',
    entries: redisStats.entries.map((e) => ({ ...e, key: `ratelimit:${e.ip}:${e.route}` })),
    totalKeys: redisStats.totalKeys,
    violations: violations.slice(0, 50),
    topIPs,
    endpoints: [
      { route: '/api/trpc/*', type: 'default', limit: 60 },
      { route: 'POST mutations', type: 'mutation', limit: 30 },
      { route: 'auth.*', type: 'strict', limit: 10 },
    ],
  };
}

export function resetRateLimiter() {
  inMemoryStore.clear();
  violations.length = 0;
  useInMemoryFallback = false;
}
