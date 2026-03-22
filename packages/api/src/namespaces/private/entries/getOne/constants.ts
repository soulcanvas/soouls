/**
 * Namespace: private
 * API:        entries
 * Route:      getOne
 *
 * Constants file — Zod input schema and route-level config.
 */
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------
export const schema = z.object({
  id: z.string().uuid('Entry ID must be a valid UUID'),
});

export type Input = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const config = {
  rateLimit: {
    maxRequests: 60,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
