/**
 * tRPC singleton for the SoulCanvas API package.
 *
 * Exports:
 *  - `t`                  — raw tRPC instance (rarely needed directly)
 *  - `router`             — alias for t.router
 *  - `publicProcedure`    — rate-limited, no auth
 *  - `protectedProcedure` — rate-limited + Clerk auth + DB user ensured
 *  - `TrpcContext`        — type of the request context
 *  - `ProtectedContext`   — narrowed context with guaranteed userId
 *  - `Services`           — shape of services injected by NestJS
 */
import { TRPCError, initTRPC } from '@trpc/server';
import { DEFAULT_RATE_LIMIT, type RateLimitConfig, checkRateLimit } from './rate-limit.js';
import type { EntriesApi, MessagingApi, TasksApi, UsersApi } from './router.js';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface TrpcContext {
  /** Clerk user ID — set only when auth header is present and valid. */
  userId?: string;
  /** Raw Bearer token for downstream use if needed. */
  authToken?: string;
  /** Caller IP — set by the NestJS adapter layer. */
  ip: string;
  /** Whether this request is an admin masquerading as the user. */
  isMasquerade?: boolean;
}

export type ProtectedContext = TrpcContext & { userId: string };

// ---------------------------------------------------------------------------
// Services shape (injected at runtime by NestJS TrpcRouter)
// ---------------------------------------------------------------------------

export interface Services {
  entries: EntriesApi;
  messaging: MessagingApi;
  tasks: TasksApi;
  users: UsersApi;
}

// ---------------------------------------------------------------------------
// tRPC instance
// ---------------------------------------------------------------------------

export const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;

// ---------------------------------------------------------------------------
// Middlewares
// ---------------------------------------------------------------------------

/**
 * Rate-limit middleware factory.
 * Returns a tRPC middleware that enforces the given RateLimitConfig.
 * The limit is keyed on `${ctx.ip}:${path}`.
 */
export function makeRateLimitMiddleware(config: RateLimitConfig = DEFAULT_RATE_LIMIT) {
  return t.middleware(async ({ ctx, path, next }) => {
    const ip = ctx.ip ?? '127.0.0.1';
    const result = checkRateLimit(ip, path, config);

    if (!result.ok) {
      const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Retry after ${retryAfterSec}s.`,
      });
    }

    return next();
  });
}

/** Auth middleware — rejects unauthenticated callers. */
const requireAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be signed in to access this resource.',
    });
  }
  return next({ ctx: ctx as ProtectedContext });
});

/** Recursively scrambles strings in an object. */
function scrambleData(data: Extract<unknown, any>): any {
  if (!data) return data;
  if (typeof data === 'string') {
    // Keep first and last char, scramble the rest
    if (data.length <= 2) return '*'.repeat(data.length);
    return `${data[0]}${'*'.repeat(data.length - 2)}${data[data.length - 1]}`;
  }
  if (Array.isArray(data)) {
    return data.map(scrambleData);
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const scrambled: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      // Don't scramble IDs or timestamps
      if (
        key.toLowerCase().endsWith('id') ||
        key.toLowerCase().endsWith('at') ||
        key === 'status' ||
        key === 'type'
      ) {
        scrambled[key] = obj[key];
      } else {
        scrambled[key] = scrambleData(obj[key]);
      }
    }
    return scrambled;
  }
  return data;
}

/** Zero-Knowledge Interceptor: Scrambles output if masquerading. */
const masqueradeScramblerMiddleware = t.middleware(async ({ ctx, next }) => {
  const result = await next();

  if (ctx.isMasquerade && result.ok) {
    return {
      ...result,
      data: scrambleData(result.data),
    };
  }
  return result;
});

// ---------------------------------------------------------------------------
// Base procedures
// ---------------------------------------------------------------------------

/** Public procedure: only enforces the default rate limit. */
export const publicProcedure = t.procedure.use(makeRateLimitMiddleware(DEFAULT_RATE_LIMIT));

/**
 * Protected procedure: enforces rate limit, then authentication.
 * The `ensureUser` step (Clerk → DB user sync) is handled inside each
 * router that calls `services.users.ensureUser` — this keeps the procedure
 * base generic and avoids circular dependency on the services object.
 */
export const protectedProcedure = t.procedure
  .use(makeRateLimitMiddleware(DEFAULT_RATE_LIMIT))
  .use(requireAuth)
  .use(masqueradeScramblerMiddleware);
