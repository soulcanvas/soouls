/**
 * Namespace: private
 * API:        entries
 * Route:      update
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

  content: z
    .string()
    .min(1, 'Entry content must not be empty')
    .max(50_000_000, 'Entry content must not exceed 50,000,000 characters')
    .trim(),
});

export type Input = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const config = {
  /**
   * Higher limit — auto-save calls this frequently while the user types.
   * 60 per 60s ≈ one save per second sustained, plenty of headroom.
   */
  rateLimit: {
    maxRequests: 60,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
