/**
 * Namespace: private
 * API:        tasks
 * Route:      convertToTask
 *
 * Constants file — Zod input schema and route-level config.
 */
import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------
export const schema = z.object({
  entryId: z.string().uuid('Entry ID must be a valid UUID'),

  deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO 8601 datetime string' })
    .refine((val) => new Date(val) > new Date(), { message: 'Deadline must be in the future' }),
});

export type Input = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const config = {
  /** Converting entries to tasks is a rare, intentional action — strict limit. */
  rateLimit: {
    maxRequests: 20,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
