/**
 * Namespace: private
 * API:        entries
 * Route:      getAll
 *
 * Constants file — Zod input schema and route-level config.
 * This route returns all entries for the authenticated user with full content.
 */
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------
/** Paginated input for listing all entries. */
export const schema = z.object({
  cursor: z.number().nullish(), // offset
  limit: z.number().min(1).max(200).default(50),
});

export type Input = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const config = {
  /**
   * Moderate limit — listing entries is read-heavy.
   * 30 per minute is generous for any legitimate client.
   */
  rateLimit: {
    maxRequests: 30,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
