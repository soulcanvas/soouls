/**
 * Namespace: public
 * API:        health
 * Route:      ping
 *
 * Constants file — defines the Zod input schema and route-level config.
 * Imported by the route builder in router.ts; never calls tRPC directly.
 */
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------
export const schema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(64, 'Name must be 64 characters or fewer')
    .trim(),
});

export type Input = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const config = {
  /** Rate limit: generous — just a health check. */
  rateLimit: {
    maxRequests: 120,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
