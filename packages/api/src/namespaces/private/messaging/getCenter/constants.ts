import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.undefined();

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 30,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
