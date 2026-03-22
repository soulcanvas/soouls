/**
 * Namespace: private
 * API:        entries
 * Route:      create
 *
 * Constants file — Zod input schema and route-level config.
 */
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------
export const schema = z.object({
  content: z
    .string()
    .min(1, 'Entry content must not be empty')
    .max(50_000_000, 'Entry content must not exceed 50,000,000 characters')
    .trim(),

  type: z.enum(['entry', 'task']).optional().default('entry'),
});

export type Input = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const config = {
  /** Moderate limit — writing entries is meaningful work, not spam-prone. */
  rateLimit: {
    maxRequests: 30,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
