/**
 * Namespace: private
 * API:        entries
 * Route:      getGalaxy
 *
 * Constants file — Zod input schema and route-level config.
 * This route takes no user-supplied input (data is scoped by auth userId).
 */
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------
/** Paginated input for the galaxy to safely stream nodes. */
export const schema = z.object({
  cursor: z.number().nullish(), // offset
  limit: z.number().min(1).max(1000).default(100),
});

export type Input = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const config = {
  /**
   * Lower limit — fetching galaxy data involves heavy joins.
   * 20 per minute is more than enough for any legitimate client.
   */
  rateLimit: {
    maxRequests: 20,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
